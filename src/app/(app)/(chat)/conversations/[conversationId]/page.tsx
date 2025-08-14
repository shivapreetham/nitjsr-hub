import getConversationById from '@/app/(app)/(chat)/(comp)/serverActions/getConversationById';
import getMessages from '@/app/(app)/(chat)/(comp)/serverActions/getMessages';
import EmptyState from '@/app/(app)/(chat)/(comp)/components/EmptyState';
import Header from './components/Header';
import Body from './components/Body';
import Form from './components/Form';
import CallIntegration from './components/CallIntegration';
import { MessagesProvider } from '@/context/MessagesProvider';
import { ReplyProvider } from '@/context/ReplyProvider';
import getCurrentUser from '@/app/(shared)/serverActions/getCurrentUser';

const ConversationId = async ( {params}:{params :any}) => {
  const cparams = await params;
  const  conversationId = await cparams.conversationId;
  const conversation = await getConversationById(conversationId);
  const messages = await getMessages(conversationId);
  const currentUser = await getCurrentUser();

  if (!conversation) {
    return (
      <div className="lg:pl-60 h-full">
        <div className="h-full flex flex-col bg-background theme-transition">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="lg:pl-60 h-full">
      <div className="h-full flex flex-col bg-[#efeae2] dark:bg-[#0b141a] theme-transition">
        <CallIntegration conversationId={conversationId} />
        <MessagesProvider initialMessages={messages} currentUserId={currentUser?.id}>
          <ReplyProvider>
            <div className="shadow-sm bg-white dark:bg-gray-900">
              <Header conversation={conversation} />
            </div>
            <div className="flex-1 overflow-y-auto">
              <Body conversation={conversation as any} />
            </div>
            <div className="border-t border-border shadow-card bg-white dark:bg-gray-900">
              <Form conversation={conversation} />
            </div>
          </ReplyProvider>
        </MessagesProvider>
      </div>
    </div>
  );
};

export default ConversationId;