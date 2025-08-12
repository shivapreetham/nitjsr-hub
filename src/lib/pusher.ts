import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// Create a singleton instance for the server
// useTLS is used in order to enable encryption while interacting with the Pusher API
//TLS --> Transport Layer Security
const pusherServerClient = new PusherServer({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.NEXT_PUBLIC_PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true
});

// Create a singleton instance for the client
const pusherClientInstance = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: '/api/pusher/auth',
    authTransport: 'ajax',// ajax means it uses XMLHttpRequest (XHR).
    auth: {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
    //ws and wss represent WebSocket connections (secure and non-secure).
    enabledTransports: ['ws', 'wss'],
  }
);

// Type definitions
type PusherConnectionState = 'connecting' | 'connected' | 'disconnected' | 'failed' | 'unavailable';

interface PusherStateChange {
  current: PusherConnectionState;
  previous: PusherConnectionState;
}

// Add error handling
pusherClientInstance.connection.bind('error', (err: Error) => {
  console.error('Pusher connection error:', {
    message: err.message,
    name: err.name,
    stack: err.stack
  });
  
  if (pusherClientInstance.connection.state !== 'connected') {
    setTimeout(() => {
      pusherClientInstance.connect();
    }, 3000);
  }
});

// Add state change logging
pusherClientInstance.connection.bind('state_change', (states: PusherStateChange) => {
  console.log('Pusher connection state changed:', {
    current: states.current,
    previous: states.previous,
    timestamp: new Date().toISOString()
  });

  switch (states.current) {
    case 'connected':
      console.log('Successfully connected to Pusher');
      break;
    case 'connecting':
      console.log('Attempting to connect to Pusher');
      break;
    case 'disconnected':
    case 'failed':
      console.log('Lost connection to Pusher, attempting to reconnect...');
      break;
    case 'unavailable':
      console.log('Pusher is unavailable, check your internet connection');
      break;
  }
});

// Helper function
const isPusherConnected = () => {
  return pusherClientInstance.connection.state === 'connected';
};

// Export everything needed
export {
  pusherServerClient as pusherServer,
  pusherClientInstance as pusherClient,
  isPusherConnected
};