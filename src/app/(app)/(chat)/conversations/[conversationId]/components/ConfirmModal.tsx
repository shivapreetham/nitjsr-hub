'use client';

import Modal from '@/app/(app)/(chat)/(comp)/components/Modal';
import useConversation from '@/app/(app)/(chat)/(comp)/hooks/useConversation';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiAlertTriangle } from 'react-icons/fi';
import { Dialog } from '@headlessui/react';
import Button from '@/app/(app)/(chat)/(comp)/components/Button';

interface ConfirmModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { conversationId } = useConversation();
  const [isLoading, setIsLoading] = useState(false);

  const onDelete = useCallback(() => {
    setIsLoading(true);

    axios
      .delete(`/api/chat/conversations/${conversationId}`)
      .then(() => {
        onClose();
        router.push('/conversations');
        toast.success('Chat deleted!');
      })
      .catch(() => toast.error('Something went wrong!'))
      .finally(() => setIsLoading(false));
  }, [conversationId, onClose, router]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="theme-transition bg-card dark:bg-card/95 p-6 rounded-lg shadow-card">
        <div className="sm:flex sm:items-center">
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-destructive/10 sm:mx-0 sm:h-10 sm:w-10">
            <FiAlertTriangle className="h-6 w-6 text-destructive" />
          </div>

          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <Dialog.Title
              as="h3"
              className="text-lg font-semibold leading-6 text-foreground"
            >
              Delete Conversation
            </Dialog.Title>

            <div className="mt-2">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this chat? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
          <Button 
            disabled={isLoading} 
            onClick={onDelete}
            
          >
            Delete
          </Button>
          <Button 
            disabled={isLoading} 
            onClick={onClose}
            
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;