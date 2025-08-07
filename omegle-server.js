const WebSocket = require('ws');
const http = require('http');
const crypto = require('crypto');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Store active users and rooms
const waitingUsers = new Map(); // userId -> { socket, audioEnabled, videoEnabled, joinTime, token }
const activeRooms = new Map(); // roomId -> { user1, user2 }
const tokenToUser = new Map(); // token -> { userId, roomId? }
const userCount = { count: 0 };

// Generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);
const generateRoomId = () => Math.random().toString(36).substr(2, 12);
const generateToken = () => crypto.randomBytes(12).toString('hex');

// Determine initiator based on deterministic criteria
const determineInitiator = (user1Id, user1Data, user2Id, user2Data) => {
  // Method 1: Use join time (first to join becomes initiator)
  if (user1Data.joinTime < user2Data.joinTime) {
    return { initiator: user1Id, responder: user2Id };
  } else if (user2Data.joinTime < user1Data.joinTime) {
    return { initiator: user2Id, responder: user1Id };
  }
  
  // Method 2: If join times are the same, use alphabetical order of user IDs
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
      client.send(message);
    }
  });
};

// Find a suitable partner for a user
const findPartner = (userId, audioEnabled, videoEnabled) => {
  for (const [waitingUserId, userData] of waitingUsers) {
    if (waitingUserId !== userId) {
      // Simple matching - could be enhanced with preferences
      return { userId: waitingUserId, userData };
    }
  }
  return null;
};

wss.on('connection', (ws) => {
  // Create stable userId and token for this logical user
  const userId = generateId();
  const token = generateToken();
  ws.userId = userId;
  ws.token = token;

  // store token->user mapping (socket will be updated)
  tokenToUser.set(token, { userId, socket: ws, roomId: null });

  userCount.count++;
  broadcastUserCount();
  
  console.log(`[SERVER] User ${userId} connected. Token ${token}. Total users: ${userCount.count}`);

  // Send welcome with token
  ws.send(JSON.stringify({ type: 'welcome', userId, token }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`[SERVER] Received message from ${userId}:`, data.type);
      
      switch (data.type) {
        case 'reconnect': {
          // client asks to claim an existing token
          const { token: clientToken } = data;
          const entry = tokenToUser.get(clientToken);
          if (entry) {
            // replace socket reference with the new ws
            entry.socket = ws;
            ws.userId = entry.userId;
            ws.token = clientToken;
            // update waitingUsers or activeRooms if present to use this new socket object
            if (waitingUsers.has(entry.userId)) {
              const u = waitingUsers.get(entry.userId);
              u.socket = ws;
              waitingUsers.set(entry.userId, u);
            }
            // update any activeRooms user socket references
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

        case 'find_partner':
          const { audioEnabled = true, videoEnabled = true } = data;
          console.log(`[SERVER] User ${userId} looking for partner (audio: ${audioEnabled}, video: ${videoEnabled})`);
          
          // Check if there's already a waiting user
          const partner = findPartner(userId, audioEnabled, videoEnabled);
          
          if (partner) {
            // Create a room with both users
            const roomId = generateRoomId();
            const partnerData = partner.userData;
            
            console.log(`[SERVER] Found partner for ${userId}: ${partner.userId}`);
            
            // Remove both users from waiting list
            waitingUsers.delete(partner.userId);
            waitingUsers.delete(userId);
            
            // Determine initiator and responder
            const roles = determineInitiator(userId, { joinTime: Date.now() }, partner.userId, partnerData);
            
            // Create room with proper roles
            activeRooms.set(roomId, {
              user1: { 
                id: roles.initiator, 
                socket: roles.initiator === userId ? ws : partnerData.socket, 
                initiator: true 
              },
              user2: { 
                id: roles.responder, 
                socket: roles.responder === userId ? ws : partnerData.socket, 
                initiator: false 
              }
            });

            // store roomId in tokenToUser
            tokenToUser.get(roles.initiator === userId ? ws.token : partnerData.socket.token).roomId = roomId;
            tokenToUser.get(roles.responder === userId ? ws.token : partnerData.socket.token).roomId = roomId;
            
            // Notify both users with their roles
            const initiatorSocket = roles.initiator === userId ? ws : partnerData.socket;
            const responderSocket = roles.responder === userId ? ws : partnerData.socket;
            
            console.log(`[SERVER] Sending room_assigned to initiator ${roles.initiator}`);
            initiatorSocket.send(JSON.stringify({
              type: 'room_assigned',
              room: roomId,
              initiator: true,
              role: 'initiator'
            }));
            
            console.log(`[SERVER] Sending room_assigned to responder ${roles.responder}`);
            responderSocket.send(JSON.stringify({
              type: 'room_assigned',
              room: roomId,
              initiator: false,
              role: 'responder'
            }));
            
            console.log(`[SERVER] Room ${roomId} created with ${roles.initiator} (initiator) and ${roles.responder} (responder)`);
          } else {
                         // Add user to waiting list with join time
             waitingUsers.set(userId, {
               socket: ws,
               audioEnabled,
               videoEnabled,
               joinTime: Date.now(),
               token: ws.token
             });
            
            console.log(`[SERVER] User ${userId} added to waiting list. Total waiting: ${waitingUsers.size}`);
          }
          break;
          
        case 'join':
          // client asks to join existing room - optionally with token
          const { room: roomToJoin, token: clientToken } = data;
          console.log(`[SERVER] User ${userId} trying to join room ${roomToJoin} (token: ${clientToken || 'none'})`);
          const room = activeRooms.get(roomToJoin);
          if (room) {
            // If token provided, use it to map this socket to the correct user slot
            if (clientToken && tokenToUser.has(clientToken)) {
              const entry = tokenToUser.get(clientToken);
              // update socket references in room if userIds match
              if (room.user1.id === entry.userId) {
                room.user1.socket = ws;
                entry.socket = ws;
              } else if (room.user2.id === entry.userId) {
                room.user2.socket = ws;
                entry.socket = ws;
              } else {
                // token doesn't match either slot, but still accept join (optional)
                console.log(`[SERVER] Token matched user ${entry.userId} but they are not in room ${roomToJoin}`);
              }
            }
            // ack join
            ws.send(JSON.stringify({ type: 'join_ok', room: roomToJoin }));
            console.log(`[SERVER] User ${userId} joined room ${roomToJoin}`);
          } else {
            ws.send(JSON.stringify({ type: 'join_failed', reason: 'no_room' }));
            console.log(`[SERVER] User ${userId} tried to join non-existent room ${roomToJoin}`);
          }
          break;
          
        case 'skip':
          // Handle skip request
          const userRoom = Array.from(activeRooms.entries()).find(([_, roomData]) => 
            roomData.user1.id === userId || roomData.user2.id === userId
          );
          
          if (userRoom) {
            const [roomId, roomData] = userRoom;
            const otherUser = roomData.user1.id === userId ? roomData.user2 : roomData.user1;
            
            console.log(`[SERVER] User ${userId} skipping in room ${roomId}`);
            
            // Notify the other user about the skip
            otherUser.socket.send(JSON.stringify({
              type: 'partner_skipped'
            }));
            
            // Close the room
            activeRooms.delete(roomId);
            
                         // Add both users back to waiting list with new join times
             waitingUsers.set(userId, { 
               socket: ws, 
               audioEnabled: true, 
               videoEnabled: true, 
               joinTime: Date.now(),
               token: ws.token
             });
             waitingUsers.set(otherUser.id, { 
               socket: otherUser.socket, 
               audioEnabled: true, 
               videoEnabled: true, 
               joinTime: Date.now(),
               token: otherUser.socket.token
             });
            
            console.log(`[SERVER] Room ${roomId} closed due to skip. Users back in waiting list.`);
          } else {
            console.log(`[SERVER] User ${userId} tried to skip but not in any room`);
          }
          break;
          
        case 'offer':
        case 'answer':
        case 'candidate':
          // Forward WebRTC signaling messages
          const targetRoom = activeRooms.get(data.room);
          if (targetRoom) {
            const targetUser = targetRoom.user1.id === userId ? targetRoom.user2 : targetRoom.user1;
            console.log(`[SERVER] Forwarding ${data.type} from ${userId} to ${targetUser.id} in room ${data.room}`);
            targetUser.socket.send(JSON.stringify({
              ...data,
              from: userId
            }));
          } else {
            console.log(`[SERVER] Received ${data.type} for non-existent room ${data.room} from ${userId}`);
          }
          break;
          
        default:
          console.log(`[SERVER] Unknown message type from ${userId}:`, data.type);
      }
    } catch (error) {
      console.error(`[SERVER] Error processing message from ${userId}:`, error);
    }
  });

  ws.on('close', () => {
    console.log(`[SERVER] User ${userId} disconnected`);
    
    // Remove user from waiting list
    waitingUsers.delete(userId);
    
    // Remove user from active rooms
    for (const [roomId, roomData] of activeRooms.entries()) {
      if (roomData.user1.id === userId || roomData.user2.id === userId) {
        const otherUser = roomData.user1.id === userId ? roomData.user2 : roomData.user1;
        
        console.log(`[SERVER] Notifying ${otherUser.id} about ${userId}'s disconnection`);
        
        // Notify the other user
        otherUser.socket.send(JSON.stringify({
          type: 'partner_disconnected'
        }));
        
                 // Add other user back to waiting list with new join time
         waitingUsers.set(otherUser.id, { 
           socket: otherUser.socket, 
           audioEnabled: true, 
           videoEnabled: true, 
           joinTime: Date.now(),
           token: otherUser.socket.token
         });
        
        // Remove room
        activeRooms.delete(roomId);
        
        console.log(`[SERVER] Room ${roomId} closed due to user ${userId} disconnection`);
        break;
      }
    }
    
    // Cleanup token mapping if this socket was the stored socket
    if (ws.token && tokenToUser.has(ws.token)) {
      const entry = tokenToUser.get(ws.token);
      if (entry.socket === ws) {
        // keep tokenToUser entry (so reconnect can work) but clear socket reference
        // entry.socket = null; // optional - leave socket so reconnect replacement works
      }
    }
    
    userCount.count--;
    broadcastUserCount();
    console.log(`[SERVER] User ${userId} disconnected. Total users: ${userCount.count}`);
  });

  ws.on('error', (error) => {
    console.error(`[SERVER] WebSocket error for user ${userId}:`, error);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`[SERVER] Omegle WebSocket server running on port ${PORT}`);
  console.log(`[SERVER] WebSocket URL: ws://localhost:${PORT}`);
});

// Cleanup inactive rooms periodically
setInterval(() => {
  console.log(`[SERVER] Status - Active rooms: ${activeRooms.size}, Waiting users: ${waitingUsers.size}, Total users: ${userCount.count}`);
  for (const [roomId, roomData] of activeRooms.entries()) {
    console.log(`[SERVER] Active room: ${roomId} with ${roomData.user1.id} (${roomData.user1.initiator ? 'initiator' : 'responder'}) and ${roomData.user2.id} (${roomData.user2.initiator ? 'initiator' : 'responder'})`);
  }
}, 30000); // Log every 30 seconds
