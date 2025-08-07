const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Store active users and rooms
const waitingUsers = new Map(); // userId -> { socket, audioEnabled, videoEnabled, joinTime }
const activeRooms = new Map(); // roomId -> { user1, user2 }
const userCount = { count: 0 };

// Generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);
const generateRoomId = () => Math.random().toString(36).substr(2, 12);

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
  const userId = generateId();
  userCount.count++;
  broadcastUserCount();
  
  console.log(`User ${userId} connected. Total users: ${userCount.count}`);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'find_partner':
          const { audioEnabled = true, videoEnabled = true } = data;
          
          // Check if there's already a waiting user
          const partner = findPartner(userId, audioEnabled, videoEnabled);
          
          if (partner) {
            // Create a room with both users
            const roomId = generateRoomId();
            const partnerData = partner.userData;
            
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
            
            // Notify both users with their roles
            const initiatorSocket = roles.initiator === userId ? ws : partnerData.socket;
            const responderSocket = roles.responder === userId ? ws : partnerData.socket;
            
            initiatorSocket.send(JSON.stringify({
              type: 'room_assigned',
              room: roomId,
              initiator: true,
              role: 'initiator'
            }));
            
            responderSocket.send(JSON.stringify({
              type: 'room_assigned',
              room: roomId,
              initiator: false,
              role: 'responder'
            }));
            
            console.log(`Room ${roomId} created with ${roles.initiator} (initiator) and ${roles.responder} (responder)`);
          } else {
            // Add user to waiting list with join time
            waitingUsers.set(userId, {
              socket: ws,
              audioEnabled,
              videoEnabled,
              joinTime: Date.now()
            });
            
            console.log(`User ${userId} added to waiting list`);
          }
          break;
          
        case 'join':
          // User joining an existing room
          const room = activeRooms.get(data.room);
          if (room) {
            console.log(`User ${userId} joined room ${data.room}`);
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
              joinTime: Date.now() 
            });
            waitingUsers.set(otherUser.id, { 
              socket: otherUser.socket, 
              audioEnabled: true, 
              videoEnabled: true, 
              joinTime: Date.now() 
            });
            
            console.log(`User ${userId} skipped in room ${roomId}`);
          }
          break;
          
        case 'offer':
        case 'answer':
        case 'candidate':
          // Forward WebRTC signaling messages
          const targetRoom = activeRooms.get(data.room);
          if (targetRoom) {
            const targetUser = targetRoom.user1.id === userId ? targetRoom.user2 : targetRoom.user1;
            targetUser.socket.send(JSON.stringify({
              ...data,
              from: userId
            }));
          }
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    // Remove user from waiting list
    waitingUsers.delete(userId);
    
    // Remove user from active rooms
    for (const [roomId, roomData] of activeRooms.entries()) {
      if (roomData.user1.id === userId || roomData.user2.id === userId) {
        const otherUser = roomData.user1.id === userId ? roomData.user2 : roomData.user1;
        
        // Notify the other user
        otherUser.socket.send(JSON.stringify({
          type: 'partner_disconnected'
        }));
        
        // Add other user back to waiting list with new join time
        waitingUsers.set(otherUser.id, { 
          socket: otherUser.socket, 
          audioEnabled: true, 
          videoEnabled: true, 
          joinTime: Date.now() 
        });
        
        // Remove room
        activeRooms.delete(roomId);
        
        console.log(`Room ${roomId} closed due to user ${userId} disconnection`);
        break;
      }
    }
    
    userCount.count--;
    broadcastUserCount();
    console.log(`User ${userId} disconnected. Total users: ${userCount.count}`);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for user ${userId}:`, error);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Omegle WebSocket server running on port ${PORT}`);
  console.log(`WebSocket URL: ws://localhost:${PORT}`);
});

// Cleanup inactive rooms periodically
setInterval(() => {
  const now = Date.now();
  for (const [roomId, roomData] of activeRooms.entries()) {
    // You could add timestamp tracking to remove old rooms
    // For now, we'll just log active rooms
    console.log(`Active room: ${roomId} with ${roomData.user1.id} (${roomData.user1.initiator ? 'initiator' : 'responder'}) and ${roomData.user2.id} (${roomData.user2.initiator ? 'initiator' : 'responder'})`);
  }
}, 30000); // Log every 30 seconds
