# Components Guide

## Component Architecture

This project uses a structured component architecture with shared UI components, feature-specific components, and reusable hooks.

---

## UI Components (`src/components/ui/`)

Based on **shadcn/ui** and **Radix UI** primitives.

### Core UI Components

#### `Button`
```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
}
```

#### `Input`
```typescript
interface InputProps {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  error?: boolean
}
```

#### `Dialog`
Modal dialog component with overlay and close functionality.

#### `Card`
Container component with consistent styling and shadow.

#### `Avatar`
User avatar component with fallback initials.

#### `Badge`
Small status indicator component.

#### `Tabs`
Tab navigation component with content panels.

---

## Feature Components

### Chat Components (`src/app/(app)/(chat)/(comp)/components/`)

#### `ConversationBox`
**Purpose**: Main chat interface container
**Location**: `ConversationBox.tsx`

```typescript
interface ConversationBoxProps {
  conversationId: string
  initialMessages: Message[]
  users: User[]
}
```

**Features**:
- Message display and scrolling
- Real-time message updates
- Typing indicators
- Message reactions

#### `ConversationList`
**Purpose**: List of user's conversations
**Location**: `ConversationList.tsx`

```typescript
interface ConversationListProps {
  conversations: FullConversationType[]
  title?: string
}
```

**Features**:
- Conversation previews
- Last message display
- Unread message indicators
- Real-time updates

#### `MessageBox`
**Purpose**: Individual message display
**Location**: `MessageBox.tsx`

```typescript
interface MessageBoxProps {
  message: FullMessageType
  isLast?: boolean
}
```

**Features**:
- Message content rendering
- Timestamp display
- Read status indicators
- Image/file support

#### `GroupChatModal`
**Purpose**: Group creation interface
**Location**: `GroupChatModal.tsx`

```typescript
interface GroupChatModalProps {
  isOpen: boolean
  onClose: () => void
  users: User[]
}
```

### Marketplace Components (`src/app/(app)/market/(comp)/components/`)

#### `ProductCard`
**Purpose**: Product display in grid/list view
**Location**: `products/ProductCard.tsx`

```typescript
interface ProductCardProps {
  product: Product
  onClick?: () => void
  showActions?: boolean
}
```

**Features**:
- Product image carousel
- Price and title display
- Interest button
- Seller information

#### `ProductFilters`
**Purpose**: Search and filtering interface
**Location**: `ui/ProductFilters.tsx`

```typescript
interface ProductFiltersProps {
  onFilterChange: (filters: FilterOptions) => void
  categories: string[]
}
```

#### `MarketplaceHeader`
**Purpose**: Module header with search
**Location**: `ui/MarketplaceHeader.tsx`

**Features**:
- Search input
- Category filters
- Sort options
- Create product button

### Attendance Components (`src/app/(app)/attendance/(comp)/components/`)

#### `AttendanceCharts`
**Purpose**: Data visualization
**Location**: `AttendanceCharts.tsx`

```typescript
interface AttendanceChartsProps {
  data: AttendanceData
  timeframe: 'week' | 'month' | 'semester'
}
```

**Features**:
- Line charts for trends
- Bar charts for subject comparison
- Pie charts for overall statistics

#### `CalendarGrid`
**Purpose**: Calendar view of attendance
**Location**: `../calendar/(comps)/components/CalendarGrid.tsx`

```typescript
interface CalendarGridProps {
  data: CalendarData
  month: number
  year: number
  onDateClick: (date: Date) => void
}
```

#### `LeaderboardTable`
**Purpose**: Student rankings display
**Location**: `../leaderboard/(comp)/components/LeaderboardTable.tsx`

```typescript
interface LeaderboardTableProps {
  data: LeaderboardEntry[]
  currentUserId: string
}
```

### Video Chat Components (`src/app/(app)/videoChat/components/`)

#### `MeetingRoom`
**Purpose**: Main video call interface
**Location**: `MeetingRoom.tsx`

**Features**:
- Stream.io integration
- Camera/microphone controls
- Screen sharing
- Participant management

#### `CallList`
**Purpose**: List of past and upcoming calls
**Location**: `CallList.tsx`

```typescript
interface CallListProps {
  type: 'upcoming' | 'ended' | 'recordings'
}
```

---

## Shared Components (`src/components/`)

### Navigation Components (`src/components/sidebar/`)

#### `DesktopSidebar`
**Purpose**: Desktop navigation sidebar
**Location**: `DesktopSidebar.tsx`

**Features**:
- Route navigation
- Active state indicators
- User profile access
- Settings modal

#### `MobileFooter`
**Purpose**: Mobile navigation footer
**Location**: `MobileFooter.tsx`

**Features**:
- Bottom navigation bar
- Icon-based navigation
- Responsive design

### Status Components (`src/components/status&sidebar/`)

#### `Avatar`
**Purpose**: User avatar with online status
**Location**: `Avatar.tsx`

```typescript
interface AvatarProps {
  user?: User
  size?: 'sm' | 'md' | 'lg'
  showOnlineStatus?: boolean
}
```

#### `ActiveStatus`
**Purpose**: Real-time user status updates
**Location**: `ActiveStatus.tsx`

**Features**:
- Pusher integration
- Online/offline indicators
- Presence management

---

## Hooks (`src/app/hooks/` and feature-specific)

### Chat Hooks (`src/app/(app)/(chat)/(comp)/hooks/`)

#### `useConversation`
**Purpose**: Conversation state management
**Location**: `useConversation.ts`

```typescript
const useConversation = () => {
  const conversationId = useMemo(() => {
    // Extract conversation ID from URL
  }, [params.conversationId])

  return {
    conversationId,
    isOpen: !!conversationId
  }
}
```

### Global Hooks (`src/app/hooks/`)

#### `useActiveList`
**Purpose**: Online users management
**Location**: `useActiveList.ts`

```typescript
const useActiveList = () => {
  const [members, setMembers] = useState<string[]>([])

  return {
    members,
    add: (id: string) => setMembers(current => [...current, id]),
    remove: (id: string) => setMembers(current => current.filter(memberId => memberId !== id)),
    set: (ids: string[]) => setMembers(ids)
  }
}
```

#### `useRoutes`
**Purpose**: Navigation routes configuration
**Location**: `useRoutes.ts`

```typescript
const useRoutes = () => {
  const pathname = usePathname()
  
  const routes = useMemo(() => [
    {
      label: 'Chat',
      href: '/conversations',
      icon: HiChat,
      active: pathname === '/conversations'
    },
    // ... other routes
  ], [pathname])

  return routes
}
```

---

## Context Providers (`src/context/`)

### `AuthProvider`
**Purpose**: Authentication state management
**Location**: `AuthProvider.tsx`

```typescript
interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (credentials: SignInData) => Promise<void>
  signOut: () => Promise<void>
}
```

### `SocketProvider`
**Purpose**: Socket.io connection management
**Location**: `SocketProvider.tsx`

### `StreamClientProvider`
**Purpose**: Stream.io client setup
**Location**: `StreamClientProvider.tsx`

---

## Component Best Practices

### 1. File Organization
```
components/
├── ComponentName/
│   ├── index.tsx          # Main component
│   ├── ComponentName.tsx  # Implementation
│   ├── types.ts          # TypeScript interfaces
│   └── styles.module.css # Component styles (if needed)
```

### 2. Props Interface
```typescript
interface ComponentProps {
  // Required props first
  data: DataType
  onAction: () => void
  
  // Optional props with defaults
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  
  // Children/content
  children?: React.ReactNode
}
```

### 3. Error Boundaries
Critical components include error boundaries for graceful error handling.

### 4. Loading States
Components handle loading states with skeleton placeholders or spinners.

### 5. Responsive Design
All components are responsive using Tailwind CSS breakpoints.

### 6. Accessibility
Components follow ARIA guidelines and keyboard navigation standards.

---

## Custom Hooks Patterns

### Data Fetching Hook
```typescript
const useApiData = <T>(endpoint: string) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch logic
  }, [endpoint])

  return { data, loading, error, refetch }
}
```

### Form Hook
```typescript
const useFormValidation = <T>(schema: ZodSchema<T>) => {
  const [values, setValues] = useState<T>()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (data: T) => {
    // Validation logic
  }

  return { values, errors, validate, setValues }
}
```