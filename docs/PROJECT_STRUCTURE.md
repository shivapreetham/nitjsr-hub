# NIT-JSR-Hub Project Structure

## Overview
This is a Next.js 15 application using the App Router architecture with TypeScript, Tailwind CSS, Prisma ORM, and various third-party integrations for chat, video calling, and file storage.

## Root Directory Structure

```
nit-jsr-hub-v1/
├── prisma/                    # Database schema and migrations
├── public/                    # Static assets
├── src/                       # Source code
├── docs/                      # Project documentation
├── TODO.txt                   # Task tracking file
├── package.json              # Dependencies and scripts
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── components.json           # UI components configuration
```

## Source Code Structure (`src/`)

### Application Routes (`src/app/`)

#### Main Application (`src/app/(app)/`)
- **Layout**: `layout.tsx` - Main app layout with navigation
- **Home**: `home/page.tsx` - Dashboard/landing page

#### Chat Module (`src/app/(app)/(chat)/`)
```
(chat)/
├── (comp)/                   # Shared chat components and hooks
│   ├── components/           # Reusable chat UI components
│   ├── hooks/               # Chat-related hooks
│   └── serverActions/       # Server actions for chat operations
├── conversations/           # Chat conversations routes
│   ├── [conversationId]/   # Individual conversation page
│   └── page.tsx            # Conversations list
└── users/                  # User management in chat context
```

#### Anonymous Messaging (`src/app/(app)/anonymous/`)
- Anonymous message dashboard and user profile pages
- JSON file for storing anonymous messages

#### Attendance System (`src/app/(app)/attendance/`)
```
attendance/
├── (comp)/                  # Shared attendance components
│   ├── components/         # Charts, stats, loading components
│   ├── hooks/             # Data fetching hooks
│   └── utils/             # Helper functions
├── calendar/              # Calendar view of attendance
├── leaderboard/           # Student attendance rankings
└── run/                   # Manual attendance refresh trigger
```

#### Marketplace (`src/app/(app)/market/`)
```
market/
├── (comp)/                 # Shared marketplace components
│   ├── components/        # Product cards, filters, etc.
│   ├── hooks/            # Marketplace data hooks
│   └── utils/            # Marketplace helper functions
├── [productId]/          # Individual product pages
│   ├── edit/            # Product editing
│   └── (comp)/          # Product-specific components
├── my-products/         # User's product listings
└── new/                 # Create new product
```

#### Video Chat (`src/app/(app)/videoChat/`)
- Integration with Stream.io for video conferencing
- Meeting rooms, scheduling, and call management

#### Authentication (`src/app/(authRelatedFrontend)/`)
- Sign up, sign in, password reset flows
- Email verification system

### API Routes (`src/app/api/`)

#### Shared APIs (`src/app/api/(shared)/`)
- Pusher authentication
- File upload handling
- User status management
- Username/groupname uniqueness validation

#### Feature-Specific APIs
- **Anonymous**: Message operations
- **Attendance**: Calendar data, leaderboards
- **Auth Utils**: Password reset, verification
- **Chat**: Real-time messaging, conversations, AI features
- **Products**: Marketplace CRUD operations

### Shared Code (`src/`)

#### Components (`src/components/`)
```
components/
├── home&anonymous/         # Home and anonymous message components
├── sidebar/               # Navigation sidebar components
├── status&sidebar/        # User status and sidebar utilities
└── ui/                   # Reusable UI components (shadcn/ui)
```

#### Context Providers (`src/context/`)
- Authentication state management
- Real-time messaging context
- Theme management
- Socket connections

#### Shared Utilities (`src/shared/`)
```
shared/
├── constants/            # Application constants
├── helpers/             # Utility functions (email, etc.)
├── schemas/             # Zod validation schemas
└── types/              # TypeScript type definitions
```

## Key Technologies & Integrations

### Frontend Stack
- **Next.js 15** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** components via shadcn/ui

### Backend & Database
- **Prisma ORM** with MongoDB
- **NextAuth.js** for authentication
- **API Routes** for backend functionality

### Real-time Features
- **Pusher** for chat messaging
- **Stream.io** for video calls
- **Socket.io** for some real-time features

### File Storage
- **Supabase** for image and file uploads

### External Services
- **Nodemailer** for email notifications
- **Chart.js** for data visualization
- **React Calendar** for attendance tracking

## Development Workflow

### Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint checking

### Database
- Prisma schema defines the data model
- MongoDB as the primary database
- Automatic schema generation on build

## Security Features
- NextAuth.js session management
- Input validation with Zod schemas
- Secure file upload handling
- Password hashing with bcryptjs

## Performance Optimizations
- Next.js App Router with automatic code splitting
- Image optimization for uploaded content
- React hooks for efficient state management
- Lazy loading of components where appropriate