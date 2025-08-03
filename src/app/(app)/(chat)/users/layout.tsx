import { Metadata } from 'next';
import getUsers from '@/app/(shared)/serverActions/getUsers';
import Sidebar from '@/shared/components/sidebar/Sidebar';
import UserList from './components/UserList';

export const metadata: Metadata = {
  title: 'All Users - NIT JSR Hub',
  description: 'Connect with NIT Jamshedpur students',
};

export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const users = await getUsers();

  return (
    <Sidebar>
      <div className=" h-full">
        <UserList users={users} />
        {children}
      </div>
    </Sidebar>
  );
}
