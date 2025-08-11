# Database Schema Documentation

## Overview
The application uses **MongoDB** as the primary database with **Prisma ORM** for type-safe database access and schema management.

## Schema Location
- **Prisma Schema**: `prisma/schema.prisma`
- **Database URL**: Configured via `DATABASE_URL` environment variable

---

## Core Models

### User Model
The central user model used across all modules.

```prisma
model User {
  id                String   @id @default(cuid()) @map("_id")
  name              String?
  username          String?  @unique
  email             String   @unique
  emailVerified     DateTime?
  image             String?
  hashedPassword    String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Anonymous messaging
  isAcceptingMessages Boolean @default(true)
  
  // Relationships
  accounts          Account[]
  sessions          Session[]
  
  // Chat relationships
  conversationIds   String[]
  conversations     Conversation[] @relation(fields: [conversationIds], references: [id])
  seenMessageIds    String[]
  seenMessages      Message[] @relation("Seen", fields: [seenMessageIds], references: [id])
  messages          Message[]
  reactions         Reaction[]
  
  // Marketplace relationships
  products          Product[]
  interestedProducts Product[] @relation("ProductInterest")
  
  // Anonymous messages
  anonymousMessages AnonymousMessage[]
}
```

### Authentication Models (NextAuth)

#### Account
```prisma
model Account {
  id                String  @id @default(cuid()) @map("_id")
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
}
```

#### Session
```prisma
model Session {
  id           String   @id @default(cuid()) @map("_id")
  sessionToken String   @unique
  userId       String
  expires      DateTime
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### VerificationToken
```prisma
model VerificationToken {
  id         String   @id @default(cuid()) @map("_id")
  identifier String
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
}
```

---

## Chat Module Models

### Conversation
Central model for chat conversations (both individual and group).

```prisma
model Conversation {
  id            String   @id @default(cuid()) @map("_id")
  createdAt     DateTime @default(now())
  lastMessageAt DateTime @default(now())
  name          String?
  isGroup       Boolean?
  
  // Relationships
  messagesIds   String[]
  messages      Message[]
  
  userIds       String[]
  users         User[] @relation(fields: [userIds], references: [id])
}
```

### Message
Individual messages within conversations.

```prisma
model Message {
  id        String   @id @default(cuid()) @map("_id")
  body      String?
  image     String?
  createdAt DateTime @default(now())
  
  // Relationships
  seenIds      String[]
  seen         User[] @relation("Seen", fields: [seenIds], references: [id])
  
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  senderId String
  sender   User   @relation(fields: [senderId], references: [id], onDelete: Cascade)
  
  reactions Reaction[]
}
```

### Reaction
Message reactions (emojis).

```prisma
model Reaction {
  id      String @id @default(cuid()) @map("_id")
  emoji   String
  
  // Relationships
  messageId String
  message   Message @relation(fields: [messageId], references: [id], onDelete: Cascade)
  
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([messageId, userId, emoji])
}
```

---

## Marketplace Module Models

### Product
Product listings in the marketplace.

```prisma
model Product {
  id          String   @id @default(cuid()) @map("_id")
  title       String
  description String
  price       Float
  images      String[]
  category    String
  condition   String
  isAvailable Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  sellerId         String
  seller           User   @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  
  interestedUserIds String[]
  interestedUsers   User[] @relation("ProductInterest", fields: [interestedUserIds], references: [id])
}
```

---

## Anonymous Messaging Models

### AnonymousMessage
Anonymous messages sent to users.

```prisma
model AnonymousMessage {
  id        String   @id @default(cuid()) @map("_id")
  content   String
  createdAt DateTime @default(now())
  
  // Relationships
  recipientId String
  recipient   User   @relation(fields: [recipientId], references: [id], onDelete: Cascade)
}
```

---

## Attendance Module

**Note**: Attendance data is handled by an external microservice and may use a different collection/schema structure. The main application primarily displays this data.

### Potential Attendance Schema
```typescript
// Handled by external microservice - not in main Prisma schema
interface AttendanceRecord {
  userId: string
  date: Date
  subjects: {
    name: string
    status: 'present' | 'absent'
    period: number
  }[]
  overallPercentage: number
  updatedAt: Date
}
```

---

## Database Indexes

### Recommended Indexes for Performance

#### User Collection
```javascript
db.User.createIndex({ "email": 1 }, { unique: true })
db.User.createIndex({ "username": 1 }, { unique: true })
```

#### Conversation Collection
```javascript
db.Conversation.createIndex({ "userIds": 1 })
db.Conversation.createIndex({ "lastMessageAt": -1 })
```

#### Message Collection
```javascript
db.Message.createIndex({ "conversationId": 1, "createdAt": -1 })
db.Message.createIndex({ "senderId": 1 })
```

#### Product Collection
```javascript
db.Product.createIndex({ "sellerId": 1 })
db.Product.createIndex({ "category": 1 })
db.Product.createIndex({ "createdAt": -1 })
db.Product.createIndex({ "price": 1 })
db.Product.createIndex({ "title": "text", "description": "text" })
```

---

## Database Operations

### Prisma Client Usage

#### Basic CRUD Operations
```typescript
// Create user
const user = await prisma.user.create({
  data: {
    email: "user@example.com",
    username: "newuser",
    hashedPassword: hashedPassword
  }
})

// Find with relationships
const conversation = await prisma.conversation.findUnique({
  where: { id: conversationId },
  include: {
    users: true,
    messages: {
      include: {
        sender: true,
        seen: true,
        reactions: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    }
  }
})

// Complex queries
const products = await prisma.product.findMany({
  where: {
    AND: [
      { category: filter.category },
      { price: { gte: filter.minPrice, lte: filter.maxPrice } },
      {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ]
      }
    ]
  },
  include: {
    seller: true,
    interestedUsers: true
  },
  orderBy: {
    createdAt: 'desc'
  }
})
```

### Transaction Examples
```typescript
// Create message with conversation update
const result = await prisma.$transaction(async (tx) => {
  const message = await tx.message.create({
    data: {
      body: messageBody,
      conversationId: conversationId,
      senderId: currentUser.id
    },
    include: {
      sender: true,
      seen: true,
      reactions: true
    }
  })

  await tx.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      messages: {
        connect: { id: message.id }
      }
    }
  })

  return message
})
```

---

## Data Validation

### Zod Schemas
Located in `src/shared/schemas/`

#### User Validation
```typescript
export const signUpSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(20, "Username must be no more than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special characters"),
  
  email: z.string().email({ message: "Invalid email address" }),
  
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
})
```

#### Product Validation
```typescript
export const productFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  condition: z.enum(["New", "Like New", "Good", "Fair", "Poor"]),
  images: z.array(z.string().url()).min(1, "At least one image required")
})
```

---

## Backup and Migration Strategy

### Database Migrations
```bash
# Generate migration after schema changes
npx prisma migrate dev --name description_of_change

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Data Backup
- Regular MongoDB backups via MongoDB Atlas
- Export critical data before major migrations
- Test restore procedures regularly

### Environment Management
- Development: Local MongoDB or MongoDB Atlas
- Staging: MongoDB Atlas staging cluster
- Production: MongoDB Atlas production cluster with replica sets