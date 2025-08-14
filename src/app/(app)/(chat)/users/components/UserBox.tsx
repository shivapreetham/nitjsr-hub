'use client';

import Avatar from '@/components/status&sidebar/Avatar';
import TheOneLoader from '@/components/shared/TheOneLoader';
import { User } from '@prisma/client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

interface UserBoxProps {
  user: User;
}

const UserBox: React.FC<UserBoxProps> = ({ user }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(() => {
    setIsLoading(true);
    axios
      .post('/api/chat/conversations', { userId: user.id })
      .then((data) => router.push(`/conversations/${data.data.id}`))
      .finally(() => setIsLoading(false));
  }, [user, router]);

  return (
    <>
      <TheOneLoader show={isLoading} />
      <div
        title="Start a chat"
        onClick={handleClick}
        className="w-full relative flex items-center space-x-3 bg-card p-3 
          hover:bg-secondary/50 rounded-lg cursor-pointer shadow-card 
          "
      >
        <Avatar user={user} />
        <div className="min-w-0 flex-1">
          <div className="focus:outline-none">
            <p className="text-sm font-medium text-foreground">{user.username}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserBox;