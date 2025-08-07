# Omegle Feature Setup Guide

## Overview
This is an improved Omegle-like video chat feature with:
- Real-time user count display
- Classic Omegle-style UI with skip, search, stop buttons
- Better connection handling and user experience
- Audio/video controls
- Modern gradient design

## Features

### Main Page (`/omegle`)
- **User Count Display**: Shows how many people are currently online
- **Media Controls**: Toggle audio/video before starting
- **Search Timer**: Shows how long you've been searching
- **Skip & Stop**: Classic Omegle controls
- **Beautiful UI**: Purple gradient design with glassmorphism effects

### Chat Room (`/omegle/room`)
- **Dual Video Layout**: Side-by-side local and remote video
- **Connection Status**: Real-time connection indicators
- **Media Controls**: Mute/unmute, start/stop video
- **Omegle Controls**: Skip, Stop, New Chat buttons
- **Responsive Design**: Works on mobile and desktop

## Setup Instructions

### 1. Install Dependencies

First, install the WebSocket server dependencies:

```bash
# In the project root
npm install ws nodemon
```

### 2. Start the WebSocket Server

Create a new terminal and run the Omegle server:

```bash
# Option 1: Direct run
node omegle-server.js

# Option 2: With nodemon for development
npx nodemon omegle-server.js
```

The server will start on port 3001 by default.

### 3. Configure Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_OMEGLE_SERVER_URL=ws://localhost:3001
```

### 4. Start the Next.js App

In another terminal, start your Next.js application:

```bash
npm run dev
```

### 5. Access the Omegle Feature

Navigate to `http://localhost:3000/omegle` to use the improved Omegle feature.

## How It Works

### User Matching
1. User clicks "Start Chatting" on the main page
2. User is added to a waiting queue
3. When another user joins, they are automatically matched
4. Both users are redirected to a video chat room

### WebRTC Connection
1. Users join the same room via WebSocket
2. WebRTC signaling happens through the WebSocket server
3. Direct peer-to-peer video/audio connection is established
4. Users can see and hear each other

### Controls
- **Skip**: Find a new stranger
- **Stop**: End the current session
- **Mute/Unmute**: Toggle audio
- **Video On/Off**: Toggle video
- **New Chat**: Start fresh

## Server Features

### Real-time User Count
- Tracks connected users
- Broadcasts count to all clients
- Updates every 3 seconds

### Room Management
- Automatic user pairing
- Room cleanup on disconnection
- Skip functionality
- Error handling

### WebRTC Signaling
- Handles offer/answer exchange
- ICE candidate forwarding
- Connection state management

## Troubleshooting

### Common Issues

1. **Camera/Microphone Access Denied**
   - Make sure to allow camera and microphone permissions
   - Try refreshing the page

2. **Connection Issues**
   - Check if the WebSocket server is running
   - Verify the `NEXT_PUBLIC_OMEGLE_SERVER_URL` environment variable

3. **No Video/Audio**
   - Check browser permissions
   - Ensure WebRTC is supported in your browser
   - Try different browsers (Chrome, Firefox, Safari)

4. **Server Not Starting**
   - Check if port 3001 is available
   - Install dependencies: `npm install ws`
   - Check Node.js version (requires 14+)

### Development Tips

1. **Testing with Multiple Users**
   - Open multiple browser windows/tabs
   - Use incognito mode for separate sessions
   - Test on different devices

2. **Debugging**
   - Check browser console for errors
   - Monitor server logs for connection issues
   - Use browser dev tools to inspect WebRTC connections

3. **Performance**
   - The server can handle multiple concurrent users
   - WebRTC connections are peer-to-peer (no server bandwidth usage)
   - Consider adding TURN servers for NAT traversal

## Security Considerations

- Users are anonymous (no personal data stored)
- WebRTC connections are peer-to-peer
- Server only handles signaling
- No video/audio data passes through the server
- Consider implementing rate limiting for production

## Future Enhancements

- Text chat functionality
- Interest-based matching
- User reporting system
- Moderation tools
- Mobile app support
- Group video chats
- Screen sharing
- File sharing

## Production Deployment

For production deployment:

1. **Server**: Deploy the WebSocket server to a cloud provider
2. **Environment**: Update `NEXT_PUBLIC_OMEGLE_SERVER_URL` to production URL
3. **SSL**: Use WSS (WebSocket Secure) for HTTPS
4. **Scaling**: Consider using Redis for user/room management
5. **Monitoring**: Add logging and monitoring tools

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review server logs for errors
3. Test with different browsers/devices
4. Ensure all dependencies are installed correctly
