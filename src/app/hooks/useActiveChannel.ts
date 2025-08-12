'use client';
// hooks/useActiveChannel.ts
import { Channel, Members } from 'pusher-js';
import { useState, useEffect } from 'react';
import { pusherClient } from '@/lib/pusher';
import useActiveList from './useActiveList';
import { useSession } from 'next-auth/react';

const useActiveChannel = () => {
  const { data: session } = useSession();
  const { set, add, remove, updateStatus } = useActiveList();
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

  useEffect(() => {
    if (!session?.user?.email) return;

    const channel = pusherClient.subscribe('presence-messenger') as Channel;
    setActiveChannel(channel);

    channel.bind('pusher:subscription_succeeded', (members: Members) => {
      // console.log('Subscription succeeded:', members.count, 'members');
      const initialMembers: any[] = [];
      members.each((member: Record<string, any>) => {
        // console.log('Member info:', member.info);
        initialMembers.push({
          id: member.id,
          email: member.id,
          lastSeen: member.info?.lastSeen ? new Date(member.info.lastSeen) : new Date(),
          activeStatus: member.info?.activeStatus || false
        });
      });
      set(initialMembers);
    });

    channel.bind('pusher:member_added', (member: Record<string, any>) => {
      // console.log('Member added with info:', member.info);
      add({
        id: member.id,
        email: member.id,
        lastSeen: member.info?.lastSeen ? new Date(member.info.lastSeen) : new Date(),
        activeStatus: true
      });
    });
    channel.bind('pusher:member_removed', (member: Record<string, any>) => {
      updateStatus(member.id, {
        activeStatus: false,
        lastSeen: new Date()
      });
      remove(member.id);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe('presence-messenger');
    };
  }, [session?.user?.email, add, remove, set, updateStatus]);

  return activeChannel;
};

export default useActiveChannel;
