import ActiveStatus from '@/components/status&sidebar/ActiveStatus';
import { Metadata } from 'next';
import Sidebar from '@/components/sidebar/Sidebar';
import { CurrentUserProvider } from '@/core/lib/context/CurrentUserProvider';
import getCurrentUser from '@/app/(shared)/serverActions/getCurrentUser';
import StreamVideoProvider from '@/core/lib/context/StreamClientProvider';

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: 'NIT JSR Hub - Your goto website for NIT Jamshedpur',
  description: 'Your goto website for NIT Jamshedpur - Exclusive social platform for NIT Jamshedpur students',
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const currentUser = await getCurrentUser();

  return (
    <CurrentUserProvider currentUser={currentUser}>
      <StreamVideoProvider>
        <Sidebar>
          <div className="flex flex-col h-screen pb-5">
            {/* <Navbar /> */}
            {children}
            <ActiveStatus />
          </div>
        </Sidebar>
      </StreamVideoProvider>
    </CurrentUserProvider>
  );
}