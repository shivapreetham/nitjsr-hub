import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { HiChat } from 'react-icons/hi';
import { signOut } from 'next-auth/react';
import useConversation from '../(app)/(chat)/(comp)/hooks/useConversation';
import { 
  HiArrowLeftOnRectangle, 
  HiUsers, 
  HiHome,
  HiVideoCamera,
  HiCalendar,
  HiChartBar,
  HiClipboardDocumentCheck,
  HiInboxStack,
  HiOutlineSparkles
} from 'react-icons/hi2';
import { IconType } from 'react-icons';

// Define proper types to fix TypeScript errors
interface RouteItem {
  label: string;
  href: string;
  icon: IconType;
  active?: boolean;
  onClick?: () => void;
  position: 'top' | 'middle' | 'bottom';
  isPrimary?: boolean;
}

const useRoutes = () => {
  const pathname = usePathname();
  const { conversationId } = useConversation();
  
  // Determine which section we're in
  const isVideoChat = pathname?.startsWith('/videoChat') || pathname?.startsWith('/omegle');
  const isAttendance = pathname?.startsWith('/attendance');
  
  // Common routes that appear in all sections
  const commonRoutes = useMemo<RouteItem[]>(
    () => [
      {
        label: 'Logout',
        href: '/', 
        onClick: async () => {
          await signOut({ callbackUrl: '/' });
        },
        icon: HiArrowLeftOnRectangle,
        position: 'bottom'
      },
      {
        label: 'Home',
        href: '/home',
        icon: HiHome,
        active: pathname === '/home',
        position: 'top',
        isPrimary: true
      },
    ],
    [pathname]
  );

  // Main application routes
  const mainRoutes = useMemo<RouteItem[]>(
    () => [
      {
        label: 'Chat',
        href: '/conversations',
        icon: HiChat,
        active: pathname === '/conversations' || !!conversationId,
        position: 'middle'
      },
      {
        label: 'Users',
        href: '/users',
        icon: HiUsers,
        active: pathname === '/users',
        position: 'middle'
      },
      {
        label: 'Dashboard',
        href: '/anonymous/dashboard',
        icon: HiInboxStack,
        active: pathname === '/anonymous/dashboard',
        position: 'middle'
      },
    ],
    [pathname, conversationId]
  );

  // Video chat routes
  const videoChatRoutes = useMemo<RouteItem[]>(
    () => [
      {
        label: 'Video Chat',
        href: '/videoChat/',
        icon: HiVideoCamera,
        active: pathname === '/videoChat/' || pathname === '/videoChat',
        position: 'middle'
      },
      {
        label: 'Omegle',
        href: '/omegle',
        icon: HiOutlineSparkles,
        active: pathname === '/omegle' || pathname?.startsWith('/omegle/'),
        position: 'middle'
      },
    ],
    [pathname]
  );

  // Attendance routes
  const attendanceRoutes = useMemo<RouteItem[]>(
    () => [
      {
        label: 'My Attendance',
        href: '/attendance',
        icon: HiClipboardDocumentCheck,
        active: pathname === '/attendance' || pathname === '/attendance/',
        position: 'middle'
      },
      {
        label: 'Leaderboard',
        href: '/attendance/leaderboard',
        icon: HiChartBar,
        active: pathname === '/attendance/leaderboard',
        position: 'middle'
      },
      {
        label: 'Calendar',
        href: '/attendance/calendar',
        icon: HiCalendar,
        active: pathname === '/attendance/calendar',
        position: 'middle'
      },
    ],
    [pathname]
  );

  // Select appropriate routes based on current path
  const sectionRoutes = useMemo(() => {
    if (isVideoChat) return videoChatRoutes;
    if (isAttendance) return attendanceRoutes;
    return mainRoutes;
  }, [isVideoChat, isAttendance, videoChatRoutes, attendanceRoutes, mainRoutes]);

  // Combine and sort routes
  const allRoutes = useMemo(() => {
    const routes = [...commonRoutes, ...sectionRoutes];
    return routes.sort((a, b) => {
      const positionOrder = { top: 0, middle: 1, bottom: 2 };
      return positionOrder[a.position] - positionOrder[b.position];
    });
  }, [commonRoutes, sectionRoutes]);

  return {
    routes: allRoutes,
    isVideoChat,
    isAttendance
  };
};

export default useRoutes;