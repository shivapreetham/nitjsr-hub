const WebSocket = require('ws');
const http = require('http');
const crypto = require('crypto');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Store active users and rooms
const waitingUsers = new Map(); // userId -> { socket, audioEnabled, videoEnabled, joinTime, token }
const activeRooms = new Map(); // roomId -> { user1, user2 }
const tokenToUser = new Map(); // token -> { userId, roomId? }
const userConnections = new Map(); // userId -> socket (track current socket)
const userCount = { count: 0 };

// Generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);
const generateRoomId = () => Math.random().toString(36).substr(2, 12);
const generateToken = () => crypto.randomBytes(12).toString('hex');

// Determine initiator based on deterministic criteria
const determineInitiator = (user1Id, user1Data, user2Id, user2Data) => {
  // Use join time (first to join becomes initiator)
  if (user1Data.joinTime < user2Data.joinTime) {
    return { initiator: user1Id, responder: user2Id };
  } else if (user2Data.joinTime < user1Data.joinTime) {
    return { initiator: user2Id, responder: user1Id };
  }
  
  // If join times are the same, use alphabetical order of user IDs
  if (user1Id < user2Id) {
    return { initiator: user1Id, responder: user2Id };
  } else {
    return { initiator: user2Id, responder: user1Id };
  }
};

// Broadcast user count to all connected clients
const broadcastUserCount = () => {
  const message = JSON.stringify({
    type: 'user_count',
    count: userCount.count
  });
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (err) {
        console.warn('[SERVER] Error broadcasting user count:', err);
      }
    }
  });
};

// Find a suitable partner for a user
const findPartner = (userId) => {
  for (const [waitingUserId, userData] of waitingUsers) {
    if (waitingUserId !== userId) {
      return { userId: waitingUserId, userData };
    }
  }
  return null;
};

// Clean up user from all data structures
const cleanupUser = (userId) => {
  console.log(`[SERVER] Cleaning up user ${userId}`);
  
  // Remove from waiting list
  waitingUsers.delete(userId);
  
  // Remove from active rooms and notify partner
  for (const [roomId, roomData] of activeRooms.entries()) {
    if (roomData.user1.id === userId || roomData.user2.id === userId) {
      const otherUser = roomData.user1.id === userId ? roomData.user2 : roomData.user1;
      
      console.log(`[SERVER] Notifying ${otherUser.id} about ${userId}'s disconnection from room ${roomId}`);
      
      // Notify the other user
      try {
        if (otherUser.socket && otherUser.socket.readyState === WebSocket.OPEN) {
          otherUser.socket.send(JSON.stringify({
            type: 'partner_disconnected'
          }));
        }
      } catch (err) {
        console.warn('[SERVER] Error sending disconnect notification:', err);
      }
      
      // Remove room
      activeRooms.delete(roomId);
      
      // Update token mapping for the other user
      if (tokenToUser.has(otherUser.socket?.token)) {
        tokenToUser.get(otherUser.socket.token).roomId = null;
      }
      
      console.log(`[SERVER] Room ${roomId} closed due to user ${userId} disconnection`);
      break;
    }
  }
  
  // Clean up user connections
  userConnections.delete(userId);
};

wss.on('connection', (ws) => {
  const userId = generateId();
  const token = generateToken();
  ws.userId = userId;
  ws.token = token;

  // Track user connection
  userConnections.set(userId, ws);
  
  // Store token->user mapping
  tokenToUser.set(token, { userId, socket: ws, roomId: null });

  userCount.count++;
  broadcastUserCount();
  
  console.log(`[SERVER] User ${userId} connected. Token ${token}. Total users: ${userCount.count}`);

  // Send welcome with token
  try {
    ws.send(JSON.stringify({ type: 'welcome', userId, token }));
  } catch (err) {
    console.warn('[SERVER] Error sending welcome message:', err);
  }

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      const curUserId = ws.userId;
      console.log(`[SERVER] Received message from ${curUserId}:`, data.type);
      
      switch (data.type) {
        case 'reconnect': {
          const { token: clientToken } = data;
          const entry = tokenToUser.get(clientToken);
          if (entry) {
            // Replace socket reference with the new ws
            entry.socket = ws;
            ws.userId = entry.userId;
            ws.token = clientToken;
            userConnections.set(entry.userId, ws);
            
            // Update waitingUsers if present
            if (waitingUsers.has(entry.userId)) {
              const u = waitingUsers.get(entry.userId);
              u.socket = ws;
              waitingUsers.set(entry.userId, u);
            }
            
            // Update activeRooms user socket references
            for (const [rid, room] of activeRooms.entries()) {
              if (room.user1.id === entry.userId) room.user1.socket = ws;
              if (room.user2.id === entry.userId) room.user2.socket = ws;
            }
            
            ws.send(JSON.stringify({ type: 'reconnect_ok', room: entry.roomId || null }));
            console.log(`[SERVER] Reconnect successful for token ${clientToken} -> user ${entry.userId}`);
          } else {
            ws.send(JSON.stringify({ type: 'reconnect_failed' }));
            console.log(`[SERVER] Reconnect failed for token ${clientToken}`);
          }
          break;
        }

        case 'find_partner': {
          const { audioEnabled = true, videoEnabled = true } = data;
          console.log(`[SERVER] User ${curUserId} looking for partner (audio: ${audioEnabled}, video: ${videoEnabled})`);
          
          // Check if user is already in waiting list or active room
          if (waitingUsers.has(curUserId)) {
            console.log(`[SERVER] User ${curUserId} already in waiting list`);
            return;
          }
          
          // Check if user is already in an active room
          const existingRoom = Array.from(activeRooms.entries()).find(([_, roomData]) => 
            roomData.user1.id === curUserId || roomData.user2.id === curUserId
          );
          if (existingRoom) {
            console.log(`[SERVER] User ${curUserId} already in active room ${existingRoom[0]}`);
            return;
          }
          
          // Find a partner
          const partner = findPartner(curUserId);
          
          if (partner) {
            // Create a room with both users
            const roomId = generateRoomId();
            const partnerData = partner.userData;
            
            console.log(`[SERVER] Found partner for ${curUserId}: ${partner.userId}`);
            
            // Remove both users from waiting list
            waitingUsers.delete(partner.userId);
            waitingUsers.delete(curUserId);
            
            // Determine initiator and responder
            const myJoinTime = Date.now();
            const partnerJoinTime = partnerData.joinTime || Date.now();
            const roles = determineInitiator(
              curUserId, { joinTime: myJoinTime }, 
              partner.userId, { joinTime: partnerJoinTime }
            );
            
            // Create room with proper roles
            activeRooms.set(roomId, {
              user1: { 
                id: roles.initiator, 
                socket: roles.initiator === curUserId ? ws : partnerData.socket, 
                initiator: true 
              },
              user2: { 
                id: roles.responder, 
                socket: roles.responder === curUserId ? ws : partnerData.socket, 
                initiator: false 
              }
            });

            // Update token mapping with roomId for both users
            const initiatorToken = roles.initiator === curUserId ? ws.token : partnerData.socket?.token;
            const responderToken = roles.responder === curUserId ? ws.token : partnerData.socket?.token;
            
            if (initiatorToken && tokenToUser.has(initiatorToken)) {
              tokenToUser.get(initiatorToken).roomId = roomId;
            }
            if (responderToken && tokenToUser.has(responderToken)) {
              tokenToUser.get(responderToken).roomId = roomId;
            }
            
            // Notify both users with their roles
            const initiatorSocket = roles.initiator === curUserId ? ws : partnerData.socket;
            const responderSocket = roles.responder === curUserId ? ws : partnerData.socket;
            
            try {
              console.log(`[SERVER] Sending room_assigned to initiator ${roles.initiator}`);
              initiatorSocket.send(JSON.stringify({
                type: 'room_assigned',
                room: roomId,
                initiator: true,
                role: 'initiator'
              }));
            } catch (err) {
              console.warn(`[SERVER] Error sending room_assigned to initiator:`, err);
            }
            
            try {
              console.log(`[SERVER] Sending room_assigned to responder ${roles.responder}`);
              responderSocket.send(JSON.stringify({
                type: 'room_assigned',
                room: roomId,
                initiator: false,
                role: 'responder'
              }));
            } catch (err) {
              console.warn(`[SERVER] Error sending room_assigned to responder:`, err);
            }
            
            console.log(`[SERVER] Room ${roomId} created with ${roles.initiator} (initiator) and ${roles.responder} (responder)`);
          } else {
            // Add user to waiting list with join time
            waitingUsers.set(curUserId, {
              socket: ws,
              audioEnabled,
              videoEnabled,
              joinTime: Date.now(),
              token: ws.token
            });
            
            console.log(`[SERVER] User ${curUserId} added to waiting list. Total waiting: ${waitingUsers.size}`);
          }
          break;
        }
          
        case 'join': {
          // Client asks to join existing room - optionally with token
          const { room: roomToJoin, token: clientToken } = data;
          console.log(`[SERVER] User ${curUserId} trying to join room ${roomToJoin} (token: ${clientToken || 'none'})`);
          const room = activeRooms.get(roomToJoin);
          
          if (room) {
            // If token provided, use it to map this socket to the correct user slot
            if (clientToken && tokenToUser.has(clientToken)) {
              const entry = tokenToUser.get(clientToken);
              ws.userId = entry.userId;
              ws.token = clientToken;
              
              // Update socket references in room if userIds match
              if (room.user1.id === entry.userId) {
                room.user1.socket = ws;
                entry.socket = ws;
                userConnections.set(entry.userId, ws);
              } else if (room.user2.id === entry.userId) {
                room.user2.socket = ws;
                entry.socket = ws;
                userConnections.set(entry.userId, ws);
              }
            }
            
            // Re-send room assignment with role information
            const isUser1 = room.user1.id === ws.userId;
            const isUser2 = room.user2.id === ws.userId;
            
            if (isUser1 || isUser2) {
              try {
                ws.send(JSON.stringify({
                  type: 'room_assigned',
                  room: roomToJoin,
                  initiator: isUser1 ? room.user1.initiator : room.user2.initiator,
                  role: isUser1 
                    ? (room.user1.initiator ? 'initiator' : 'responder') 
                    : (room.user2.initiator ? 'initiator' : 'responder')
                }));
                console.log(`[SERVER] User ${ws.userId} joined room ${roomToJoin} as ${
                  isUser1 
                    ? (room.user1.initiator ? 'initiator' : 'responder') 
                    : (room.user2.initiator ? 'initiator' : 'responder')
                }`);
              } catch (err) {
                console.warn('[SERVER] Error sending room_assigned on join:', err);
              }
            } else {
              try {
                ws.send(JSON.stringify({ type: 'join_failed', reason: 'not_in_room' }));
              } catch (err) {
                console.warn('[SERVER] Error sending join_failed:', err);
              }
            }
          } else {
            try {
              ws.send(JSON.stringify({ type: 'join_failed', reason: 'no_room' }));
            } catch (err) {
              console.warn('[SERVER] Error sending join_failed:', err);
            }
            console.log(`[SERVER] User ${curUserId} tried to join non-existent room ${roomToJoin}`);
          }
          break;
        }
          
        case 'skip': {
          // Handle skip request
          const userRoom = Array.from(activeRooms.entries()).find(([_, roomData]) => 
            roomData.user1.id === curUserId || roomData.user2.id === curUserId
          );
          
          if (userRoom) {
            const [roomId, roomData] = userRoom;
            const otherUser = roomData.user1.id === curUserId ? roomData.user2 : roomData.user1;
            
            console.log(`[SERVER] User ${curUserId} skipping in room ${roomId}`);
            
            // Notify the other user about the skip
            try {
              if (otherUser.socket && otherUser.socket.readyState === WebSocket.OPEN) {
                otherUser.socket.send(JSON.stringify({
                  type: 'partner_skipped'
                }));
              }
            } catch (err) {
              console.warn('[SERVER] Error sending partner_skipped:', err);
            }
            
            // Close the room
            activeRooms.delete(roomId);
            
            // Update token mappings to clear roomId
            if (tokenToUser.has(ws.token)) {
              tokenToUser.get(ws.token).roomId = null;
            }
            if (otherUser.socket?.token && tokenToUser.has(otherUser.socket.token)) {
              tokenToUser.get(otherUser.socket.token).roomId = null;
            }
            
            console.log(`[SERVER] Room ${roomId} closed due to skip.`);
          } else {
            console.log(`[SERVER] User ${curUserId} tried to skip but not in any room`);
          }
          break;
        }
          
        case 'offer':
        case 'answer':
        case 'candidate': {
          const targetRoom = activeRooms.get(data.room);
          const senderId = ws.userId;
          
          if (!targetRoom) {
            console.warn(`[SERVER] No room ${data.room} for ${data.type} from ${senderId}`);
            break;
          }
          
          const targetUser = targetRoom.user1.id === senderId
            ? targetRoom.user2
            : targetRoom.user1;
            
          if (targetUser.socket?.readyState === WebSocket.OPEN) {
            try {
              targetUser.socket.send(JSON.stringify(data));
              console.log(`[SERVER] Forwarded ${data.type} from ${senderId} to ${targetUser.id} in room ${data.room}`);
            } catch (err) {
              console.warn(`[SERVER] Error forwarding ${data.type}:`, err);
            }
          } else {
            console.warn(`[SERVER] Target socket not open for ${targetUser.id} in room ${data.room}`);
          }
          break;
        }
          
        default:
          console.log(`[SERVER] Unknown message type from ${curUserId}:`, data.type);
      }
    } catch (error) {
      console.error(`[SERVER] Error processing message from ${ws.userId}:`, error);
    }
  });

  ws.on('close', () => {
    const curUserId = ws.userId;
    console.log(`[SERVER] User ${curUserId} disconnected`);
    
    // Clean up user
    cleanupUser(curUserId);
    
    // Don't delete token mapping - keep it for potential reconnection
    // Just set socket to null or keep it for reconnection attempts
    if (ws.token && tokenToUser.has(ws.token)) {
      // Keep the entry but could mark socket as disconnected
      // tokenToUser.get(ws.token).socket = null;
    }
    
    userCount.count = Math.max(0, userCount.count - 1);
    broadcastUserCount();
    console.log(`[SERVER] User ${curUserId} cleanup complete. Total users: ${userCount.count}`);
  });

  ws.on('error', (error) => {
    console.error(`[SERVER] WebSocket error for user ${ws.userId}:`, error);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`[SERVER] Omegle WebSocket server running on port ${PORT}`);
  console.log(`[SERVER] WebSocket URL: ws://localhost:${PORT}`);
});

// Cleanup inactive rooms and log status periodically
setInterval(() => {
  console.log(`[SERVER] Status - Active rooms: ${activeRooms.size}, Waiting users: ${waitingUsers.size}, Total users: ${userCount.count}`);
  
  // Log active rooms for debugging
  for (const [roomId, roomData] of activeRooms.entries()) {
    const user1Role = roomData.user1.initiator ? 'initiator' : 'responder';
    const user2Role = roomData.user2.initiator ? 'initiator' : 'responder';
    console.log(`[SERVER] Active room: ${roomId} with ${roomData.user1.id} (${user1Role}) and ${roomData.user2.id} (${user2Role})`);
  }
  
  // Log waiting users
  if (waitingUsers.size > 0) {
    console.log(`[SERVER] Waiting users: ${Array.from(waitingUsers.keys()).join(', ')}`);
  }
  
  // Cleanup stale connections
  for (const [userId, socket] of userConnections.entries()) {
    if (socket.readyState === WebSocket.CLOSED) {
      console.log(`[SERVER] Cleaning up stale connection for user ${userId}`);
      cleanupUser(userId);
    }
  }
}, 30000); // Log every 30 seconds