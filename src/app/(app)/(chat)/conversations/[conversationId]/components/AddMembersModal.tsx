'use client';

import { Dialog } from '@headlessui/react';
import { User } from '@prisma/client';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Select from '@/app/(app)/(chat)/(comp)/components/input/Select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface AddMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  currentMembers: User[];
}

const AddMembersModal = ({
  isOpen,
  onClose,
  conversationId,
  currentMembers
}: AddMembersModalProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/chat/get-users');
        const allUsers = response.data;

        const availableUsers = allUsers.filter((user: User) => 
          !currentMembers.some(member => member.id === user.id)
        );
        
        setUsers(availableUsers);
      } catch (error) {
        toast.error('Failed to fetch users');
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, currentMembers]);

  const userOptions: Option[] = users.map((user) => ({
    value: user.id,
    label: user.username || user.email,
  }));

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      await Promise.all(
        selectedOptions.map(option =>
          axios.post(`/api/chat/conversations/${conversationId}/members`, {
            userId: option.value
          })
        )
      );

      toast.success('Members added successfully');
      router.refresh();
      onClose();
      setSelectedOptions([]);
    } catch (error) {
      toast.error('Failed to add members');
      console.error('Error adding members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
      
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform rounded-lg bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-lg font-semibold">
                Add Members
              </Dialog.Title>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <IoClose className="h-5 w-5" />
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Select
                label="Select members"
                value={selectedOptions}
                onChange={setSelectedOptions}
                options={userOptions}
                // isDisabled={isLoading}
                // isMulti
              />
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || selectedOptions.length === 0}
              >
                Add Selected
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default AddMembersModal;