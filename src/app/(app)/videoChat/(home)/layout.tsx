import { Metadata } from 'next';
import { ReactNode } from 'react';

// import Navbar from '@/components/videoChat/Navbar';
// import Sidebar from '@/components/videoChat/Sidebar';

export const metadata: Metadata = {
  title: 'Video Chat - NIT JSR Hub',
  description: 'Anonymous video chat for NIT Jamshedpur students',
};

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <main className="relative">
      {/* <Navbar /> */}
      <div className="flex">
        {/* <Sidebar /> */}

        <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-10 max-md:pb-10 sm:px-14">
          <div className="w-full">{children}</div>
        </section>
      </div>
    </main>
  );
};

export default RootLayout;
