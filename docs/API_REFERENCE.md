# API Reference Guide

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://nit-jsr-hub-v1.vercel.app/api`

## Authentication
All protected endpoints require authentication via NextAuth.js session cookies.

---

## Chat API

### Conversations

#### `GET /api/chat/conversations`
Get all conversations for the authenticated user.

**Response:**
```json
{
  "conversations": [
    {
      "id": "conv_id",
      "name": "Group Name",
      "isGroup": true,
      "members": [...],
      "messages": [...],
      "lastMessageAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### `POST /api/chat/conversations`
Create a new conversation.

**Body:**
```json
{
  "isGroup": false,
  "members": ["user_id_1", "user_id_2"],
  "name": "Optional Group Name"
}
```

#### `POST /api/chat/conversations/find-or-create`
Find existing conversation or create new one.

**Body:**
```json
{
  "userId": "target_user_id"
}
```

### Messages

#### `GET /api/chat/conversations/[conversationId]`
Get messages for a specific conversation.

#### `POST /api/chat/messages`
Send a new message.

**Body:**
```json
{
  "message": "Hello world",
  "image": "optional_image_url",
  "conversationId": "conv_id"
}
```

#### `POST /api/chat/messages/[messageId]/reactions`
Add/remove reaction to a message.

**Body:**
```json
{
  "emoji": "👍",
  "action": "add" | "remove"
}
```

### AI Features

#### `POST /api/chat/ai-autofill`
Get AI-generated message suggestions.

**Body:**
```json
{
  "context": "Previous conversation context"
}
```

---

## Marketplace API

### Products

#### `GET /api/products`
Get all products with optional filtering.

**Query Parameters:**
- `category`: Filter by category
- `search`: Search in title/description
- `minPrice`: Minimum price
- `maxPrice`: Maximum price

#### `POST /api/products`
Create a new product listing.

**Body:**
```json
{
  "title": "Product Title",
  "description": "Product description",
  "price": 100.00,
  "category": "Electronics",
  "condition": "New",
  "images": ["image_url_1", "image_url_2"]
}
```

#### `GET /api/products/[productId]`
Get specific product details.

#### `PUT /api/products/[productId]`
Update product (owner only).

#### `DELETE /api/products/[productId]`
Delete product (owner only).

#### `POST /api/products/[productId]/interest`
Express interest in a product.

**Body:**
```json
{
  "interested": true
}
```

---

## Attendance API

### Current Attendance

#### `GET /api/attendance/current`
Get current attendance statistics for authenticated user.

**Response:**
```json
{
  "overallPercentage": 85.5,
  "subjects": [
    {
      "name": "Mathematics",
      "percentage": 90.0,
      "present": 18,
      "total": 20
    }
  ],
  "lastUpdated": "2024-01-01T00:00:00Z"
}
```

### Calendar Data

#### `GET /api/attendance/calendar`
Get calendar view attendance data.

**Query Parameters:**
- `month`: Month (1-12)
- `year`: Year (e.g., 2024)

**Response:**
```json
{
  "calendar": {
    "2024-01-01": {
      "status": "present",
      "subjects": ["Math", "Physics"]
    },
    "2024-01-02": {
      "status": "absent",
      "subjects": ["Chemistry"]
    }
  }
}
```

### Leaderboard

#### `GET /api/attendance/leaderboard`
Get student attendance rankings.

**Response:**
```json
{
  "leaderboard": [
    {
      "userId": "user_id",
      "username": "student1",
      "percentage": 95.5,
      "rank": 1
    }
  ]
}
```

---

## Anonymous Messages API

### Send Message

#### `POST /api/anonymous/send-messages`
Send anonymous message to a user.

**Body:**
```json
{
  "username": "target_username",
  "content": "Your anonymous message"
}
```

### Get Messages

#### `GET /api/anonymous/get-messages`
Get anonymous messages for authenticated user.

**Response:**
```json
{
  "messages": [
    {
      "id": "msg_id",
      "content": "Anonymous message content",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Message Controls

#### `POST /api/anonymous/accept-messages`
Toggle anonymous message acceptance.

**Body:**
```json
{
  "acceptMessages": true
}
```

#### `DELETE /api/anonymous/delete-message/[messageId]`
Delete a specific anonymous message.

### AI Suggestions

#### `GET /api/anonymous/suggest-messages`
Get AI-generated anonymous message suggestions.

---

## Authentication API

### Sign Up

#### `POST /api/auth-utils/sign-up`
Register a new user account.

**Body:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Verification

#### `POST /api/auth-utils/verify-code`
Verify email with verification code.

**Body:**
```json
{
  "username": "newuser",
  "code": "123456"
}
```

### Password Reset

#### `POST /api/auth-utils/forgot-password`
Request password reset.

**Body:**
```json
{
  "identifier": "user@example.com"
}
```

#### `POST /api/auth-utils/reset-password`
Reset password with token.

**Body:**
```json
{
  "token": "reset_token",
  "password": "newpassword"
}
```

---

## Shared APIs

### File Upload

#### `POST /api/cloudflare/upload`
Upload files (images, videos, GIFs) to Cloudflare R2 storage.

**Body:** FormData with `file` field and optional `type` field

**Response:**
```json
{
  "url": "https://storage_url/filename",
  "success": true
}
```

#### `POST /api/cloudflare/delete`
Delete files from Cloudflare R2 storage.

**Body:**
```json
{
  "imageUrl": "https://storage_url/filename"
}
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### User Status

#### `POST /api/(shared)/users/status`
Update user online status.

**Body:**
```json
{
  "status": "online" | "offline"
}
```

### Validation

#### `POST /api/(shared)/zod-check/check-username-unique`
Check if username is available.

**Body:**
```json
{
  "username": "desired_username"
}
```

#### `POST /api/(shared)/zod-check/check-groupname-unique`
Check if group name is available.

**Body:**
```json
{
  "name": "desired_group_name"
}
```

---

## Error Responses

All APIs return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- Most endpoints: 100 requests per minute per IP
- Authentication endpoints: 5 requests per minute per IP
- File upload: 10 requests per minute per user

## WebSocket Events (Pusher)

### Chat Events
- `new-message` - New message received
- `typing-start` - User started typing
- `typing-stop` - User stopped typing
- `message-seen` - Message marked as seen

### Presence Events
- `user-online` - User came online
- `user-offline` - User went offline