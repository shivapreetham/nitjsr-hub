# NIT-JSR-Hub Modules Documentation

## Module Overview

The application consists of four main functional modules, each with its own dedicated section in the codebase.

## 1. Chat Module 💬

### Location: `src/app/(app)/(chat)/`

#### Purpose
Real-time messaging system supporting both one-on-one and group conversations.

#### Key Features
- Real-time messaging with Pusher integration
- Group chat creation and management
- Typing indicators and read receipts
- File and image sharing
- Message reactions
- AI-powered message suggestions

#### Core Components
- **ConversationBox**: Individual chat interface
- **ConversationList**: List of user's conversations
- **MessageBox**: Individual message display
- **GroupChatModal**: Group creation interface
- **Input/Select**: Custom form components

#### API Endpoints
- `/api/chat/conversations` - CRUD operations for conversations
- `/api/chat/messages` - Message sending and retrieval
- `/api/chat/ai-autofill` - AI message suggestions
- `/api/chat/profile` - User profile management

#### Database Schema
```prisma
model Conversation {
  id: String
  name: String?
  isGroup: Boolean
  members: User[]
  messages: Message[]
  createdAt: DateTime
  lastMessageAt: DateTime
}

model Message {
  id: String
  body: String?
  image: String?
  conversation: Conversation
  sender: User
  seen: User[]
  reactions: Reaction[]
  createdAt: DateTime
}
```

---

## 2. Marketplace Module 🛒

### Location: `src/app/(app)/market/`

#### Purpose
Peer-to-peer marketplace for students to buy and sell items.

#### Key Features
- Product listing creation with multiple images
- Interest expression system
- Direct seller-buyer chat integration
- Product search and filtering
- User's product management
- Image upload via Supabase Storage

#### Core Components
- **ProductCard**: Product display card
- **ProductFilters**: Search and filter interface
- **ProductGrid**: Layout for product listings
- **MarketplaceHeader**: Module header with search
- **ProductImageCarousel**: Image gallery for products

#### API Endpoints
- `/api/products` - CRUD operations for products
- `/api/products/[productId]/interest` - Interest expression
- `/api/upload` - File upload handling

#### Database Schema
```prisma
model Product {
  id: String
  title: String
  description: String
  price: Float
  images: String[]
  category: String
  condition: String
  seller: User
  interestedUsers: User[]
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## 3. Video Chat Module 🎥

### Location: `src/app/(app)/videoChat/`

#### Purpose
Integrated video conferencing solution using Stream.io SDK.

#### Key Features
- High-quality video and audio calls
- Meeting scheduling
- Call history and recordings
- Screen sharing capabilities
- Meeting room management

#### Core Components
- **MeetingRoom**: Main video call interface
- **MeetingSetup**: Pre-call setup (camera/mic test)
- **CallList**: List of past and upcoming calls
- **MeetingModal**: Meeting creation interface
- **EndCallButton**: Call termination

#### Integration
- Uses Stream.io Video SDK for all video functionality
- Server-side integration for user authentication
- Call management through Stream's backend services

#### API Endpoints
- `/api/(shared)/stream.actions` - Stream integration actions

---

## 4. Attendance Tracking Module 📅

### Location: `src/app/(app)/attendance/`

#### Purpose
Automated attendance tracking with data visualization and analytics.

#### Key Features
- Automated data scraping from college portal
- Attendance calendar visualization
- Statistical analysis and trends
- Student leaderboard rankings
- Manual refresh triggers

#### Core Components
- **AttendanceCharts**: Data visualization components
- **CalendarGrid**: Calendar view of attendance
- **LeaderboardTable**: Student rankings
- **AttendanceTrends**: Trend analysis charts
- **SubjectDetail**: Individual subject statistics

#### Architecture
- **Frontend**: Data display and user interaction
- **Backend API**: Data processing and storage
- **External Microservice**: Web scraping service (Express.js + Playwright)

#### API Endpoints
- `/api/attendance/current` - Current attendance data
- `/api/attendance/calendar` - Calendar data
- `/api/attendance/leaderboard` - Rankings data

#### Data Flow
1. Microservice scrapes college portal using Playwright
2. Raw data processed and stored in MongoDB
3. Frontend fetches processed data via API
4. Charts and visualizations display insights

---

## 5. Anonymous Messaging Module 📝

### Location: `src/app/(app)/anonymous/`

#### Purpose
Anonymous message system allowing users to send and receive anonymous feedback.

#### Key Features
- Send anonymous messages to users
- AI-powered message suggestions
- Message acceptance/rejection controls
- User-specific message boards

#### Core Components
- **AnonymousMessageCard**: Message display component
- **Dashboard**: User's anonymous message interface

#### API Endpoints
- `/api/anonymous/send-messages` - Send anonymous message
- `/api/anonymous/get-messages` - Retrieve user's messages
- `/api/anonymous/suggest-messages` - AI suggestions
- `/api/anonymous/accept-messages` - Toggle message acceptance

---

## Cross-Module Integrations

### Chat ↔ Marketplace
- "Contact Seller" button creates direct conversation
- Interest expression triggers chat notification

### Authentication Across Modules
- NextAuth.js provides consistent authentication
- User sessions shared across all modules
- Protected routes ensure proper access control

### Real-time Features
- Pusher integration for chat notifications
- Socket.io for some real-time updates
- Stream.io for video call notifications

### Data Sharing
- Single MongoDB database across all modules
- Shared user model and authentication
- Consistent API patterns and error handling