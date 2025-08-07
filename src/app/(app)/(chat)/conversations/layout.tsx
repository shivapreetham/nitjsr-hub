import Sidebar from '@/components/sidebar/Sidebar';
import ConversationList from '../(comp)/components/ConversationList';
import getConversations from '@/app/(app)/(chat)/(comp)/serverActions/getConversations';
import getUsers from '@/app/(shared)/serverActions/getUsers';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Conversations - NIT JSR Hub',
  description: 'Chat with NIT Jamshedpur students',
};

export default async function ConversationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const conversations = await getConversations();
  const users = await getUsers();
  console.log("conversations that i have", conversations)
  // console.log("users that i have", users)

  return (
    <Sidebar>
      <div className="h-full w-full">
        <ConversationList users={users} initialConversations={conversations} />
        {children}
      </div>
    </Sidebar>
  );
}
