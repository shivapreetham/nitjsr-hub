import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

// Define MongoDB user type
interface MongoDBUser {
  _id: string;
  email: string;
  // Add other user fields you have in your MongoDB schema
  name?: string;
  image?: string;
}

// Update conversation type for MongoDB
interface MongoConversationType {
  users: MongoDBUser[];
  // Add other conversation fields you have
}

const useOtherUser:any = (
  conversation: MongoConversationType | null | undefined
) => {
  const session = useSession();

  const otherUser = useMemo(() => {
    const currentUserEmail = session?.data?.user?.email;

    // Add null checks
    if (!conversation || !conversation.users || !Array.isArray(conversation.users)) {
      return null;
    }

    const otherUser = conversation.users.filter(
      (user) => user.email !== currentUserEmail
    );

    return otherUser[0] || null;
  }, [session?.data?.user?.email, conversation?.users]);

  return otherUser;
};

export default useOtherUser;