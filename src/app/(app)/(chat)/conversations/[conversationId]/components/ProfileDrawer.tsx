'use client';

import Avatar from '@/components/status&sidebar/Avatar';
import useOtherUser from '@/app/hooks/useOtherUser';
import { Transition, Dialog } from '@headlessui/react';
import { Conversation, User } from '@prisma/client';
import { format } from 'date-fns';
import { useMemo, Fragment, useState } from 'react';
import { IoClose, IoPersonAdd, IoExitOutline, IoTrash } from 'react-icons/io5';
import AvatarGroup from '@/components/status&sidebar/AvatarGroup';
import useActiveList from '@/app/hooks/useActiveList';
import AddMembersModal from './AddMembersModal';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: Conversation & {
    users: User[];
  };
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const router = useRouter();
  const otherUser = useOtherUser(data);
  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
  const { members } = useActiveList();

  const joinedDate = useMemo(() => {
    return format(new Date(data.createdAt), 'PP');
  }, [data.createdAt]);

  const title = useMemo(() => {
    return data.isGroup ? data.name : (otherUser?.name || otherUser?.email);
  }, [data.isGroup, data.name, otherUser?.email, otherUser?.name]);

  const statusText = useMemo(() => {
    if (data.isGroup) {
      return `${data.users.length} members`;
    }
    
    const member = members.find(m => m.id === otherUser?._id);
    if (!member) return 'Offline';
    
    if (member.activeStatus) {
      return 'Active';
    }
    
    return `Last seen ${format(new Date(member.lastSeen), 'PPp')}`;
  }, [data, members, otherUser?._id]);

  const handleExitGroup = async () => {
    try {
      await axios.delete(`/api/chat/conversations/${data.id}/members`);
      onClose();
      router.push('/conversations');
      router.refresh();
      toast.success('Left the group successfully');
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave the group');
    }
  };

  const handleDeleteConversation = async () => {
    try {
      await axios.delete(`/api/chat/conversations/${data.id}`);
      onClose();
      router.push('/conversations');
      router.refresh();
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const MemberList = () => {
    return (
      <div className="space-y-4">
        {data.users.map((user) => {
          const memberStatus = members.find(m => m.id === user.id);
          return (
            <div key={user.id} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar user={user} />
                  {memberStatus?.activeStatus && (
                    <span 
                      className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card"
                      aria-label="Online status indicator"
                    />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {user.username || 'Unnamed User'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                  {memberStatus && (
                    <span className="text-xs text-muted-foreground">
                      {memberStatus.activeStatus 
                        ? 'Active now'
                        : `Last seen ${format(new Date(memberStatus.lastSeen), 'PPp')}`
                      }
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <AddMembersModal
        isOpen={isAddMembersModalOpen}
        onClose={() => setIsAddMembersModalOpen(false)}
        conversationId={data.id}
        currentMembers={data.users}
      />

      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                    <div className="flex h-full flex-col overflow-y-scroll bg-card shadow-card theme-transition">
                      <div className="px-4 sm:px-6 py-6">
                        <div className="flex items-start justify-end">
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              onClick={onClose}
                              className="rounded-md bg-secondary text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 theme-transition"
                            >
                              <span className="sr-only">Close panel</span>
                              <IoClose size={24} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="relative mt-6 flex-1 px-4 sm:px-6">
                        <div className="flex flex-col items-center">
                          <div className="mb-2">
                            {data.isGroup ? (
                              <AvatarGroup users={data.users} />
                            ) : (
                              <Avatar user={otherUser} />
                            )}
                          </div>

                          <div className="text-foreground font-medium">{title}</div>

                          <div className="text-sm text-muted-foreground">
                            {statusText}
                          </div>

                          <div className="flex gap-10 my-8">
                            {data.isGroup && !data.isAnonymous ? (
                              <>
                                <div
                                  onClick={() => setIsAddMembersModalOpen(true)}
                                  title="Add Members"
                                  className="flex flex-col gap-3 items-center cursor-pointer hover:opacity-75 theme-transition"
                                >
                                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-primary">
                                    <IoPersonAdd size={20} />
                                  </div>
                                  <div className="text-sm font-light text-muted-foreground">
                                    Add Members
                                  </div>
                                </div>

                                <div
                                  onClick={handleExitGroup}
                                  title="Exit Group"
                                  className="flex flex-col gap-3 items-center cursor-pointer hover:opacity-75 theme-transition"
                                >
                                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-destructive">
                                    <IoExitOutline size={20} />
                                  </div>
                                  <div className="text-sm font-light text-muted-foreground">
                                    Exit Group
                                  </div>
                                </div>
                              </>
                            ) : !data.isGroup && (
                              <div
                                onClick={handleDeleteConversation}
                                title="Delete Conversation"
                                className="flex flex-col gap-3 items-center cursor-pointer hover:opacity-75 theme-transition"
                              >
                                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-destructive">
                                  <IoTrash size={20} />
                                </div>
                                <div className="text-sm font-light text-muted-foreground">
                                  Delete
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="w-full pb-5 pt-5 sm:px-0 sm:pt-0">
                            <dl className="space-y-8 px-4 sm:space-y-6 sm:px-6">
                              {data.isGroup ? (
                                <div>
                                  <dt className="text-sm font-medium text-muted-foreground mb-4">
                                    Members
                                  </dt>
                                  <dd className="mt-1">
                                    <MemberList />
                                  </dd>
                                </div>
                              ) : (
                                <div>
                                  <dt className="text-sm font-medium text-muted-foreground sm:w-40 sm:flex-shrink-0">
                                    Email
                                  </dt>
                                  <dd className="mt-1 text-sm font-medium text-foreground sm:col-span-2">
                                    {otherUser?.email}
                                  </dd>
                                </div>
                              )}

                              <hr className="border-border" />
                              
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground sm:w-40 sm:flex-shrink-0">
                                  {data.isGroup ? 'Created' : 'Joined'}
                                </dt>
                                <dd className="mt-1 text-sm font-medium text-foreground sm:col-span-2">
                                  <time dateTime={joinedDate}>
                                    {joinedDate}
                                  </time>
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </> 
  );
};

export default ProfileDrawer;