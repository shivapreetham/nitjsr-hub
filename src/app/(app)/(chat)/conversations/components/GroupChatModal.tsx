'use client'

import React from 'react';
import Modal from '@/components/chat/Modal';
import Input from '@/components/chat/input/Input';
import Select from '@/components/chat/input/Select';
import { User } from '@prisma/client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { GroupChatFormData, groupChatSchema } from '@/shared/schemas/groupChatSchema';
import debounce from 'lodash/debounce';
import {Option} from '@/components/chat/input/Select';
import {  useSession } from 'next-auth/react';

interface GroupChatModalProps {
  isOpen?: boolean;
  onClose: () => void;
  users: User[];
}

const GroupChatModal: React.FC<GroupChatModalProps> = ({ isOpen, onClose, users }) => {
  const router = useRouter();

  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<GroupChatFormData>({
    resolver: zodResolver(groupChatSchema),
    defaultValues: {
      name: '',
      members: [],
      isAnonymous: false,
      isGroup: true,
    },
  });

  const members = watch('members');
  const isAnonymous = watch('isAnonymous');
  const groupName = watch('name');

  const checkGroupName = useCallback(
    debounce(async (name: string) => {
      if (name.length < 3) return;
      
      setIsCheckingName(true);
      try {
        const response = await axios.get(`/api/zod-check/check-groupname-unique?name=${encodeURIComponent(name)}`);
        if (!response.data.success) {
          setNameError('This group name is already taken');
        } else {
          setNameError(null);
        }
      } catch (error:any) {
        setNameError('Error checking group name');
      } finally {
        setIsCheckingName(false);
      }
    }, 500),
    [] // No dependencies needed as it's using closure values
  );

  // Watch for group name changes
  useEffect(() => {
    if (groupName) {
      checkGroupName(groupName);
    }
    return () => {
      checkGroupName.cancel();
    };
  }, [groupName, checkGroupName]);

  const onSubmit = async (data: GroupChatFormData) => {
    if (nameError) return;
    
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        members: data.members.map(id => ({ value: id }))
      };
      
      await axios.post('/api/chat/conversations', payload);
      router.refresh();
      onClose();
      toast.success('Group chat created!');
      router.push('/conversations');
    } catch (error: any) {
      toast.error('Failed to create group chat');
    } finally {
      setIsLoading(false);
    }
  };

  const userOptions: Option[] = users.map((user) => ({
    label: user.username,
    value: user.id,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">
            {isAnonymous ? "Create Anonymous Group" : "Create Group Chat"}
          </CardTitle>
          <CardDescription>
            {isAnonymous 
              ? "Create a private space where identities remain hidden" 
              : "Start a conversation with multiple people"}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <Input<GroupChatFormData>
              label={isAnonymous ? "Group Alias" : "Group Name"}
              id="name"
              register={register}
              errors={errors}
              disabled={isLoading}
              required
              error={nameError}
              loading={isCheckingName}
            />
            
            <Select
              disabled={isLoading}
              label="Add Members"
              options={userOptions}
              onChange={(value) => setValue('members', value.map(v => v.value), { 
                shouldValidate: true 
              })}
              value={userOptions.filter(option => 
                members.includes(option.value)
              )}
            />

            <div className="flex items-center space-x-2">
              <Switch
                id="isAnonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => 
                  setValue('isAnonymous', checked)
                }
              />
              <Label htmlFor="isAnonymous" className="text-sm">
                Enable Anonymous Mode
              </Label>
            </div>

            {isAnonymous && (
              <div className="rounded-lg bg-secondary/50 p-4 border border-secondary">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-secondary-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-secondary-foreground">
                      Anonymous Mode Features
                    </p>
                    <ul className="text-sm space-y-1 text-secondary-foreground/90">
                      <li>• Messages sent without revealing identities</li>
                      <li>• Hidden profile information</li>
                      <li>• Enhanced privacy for open discussions</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={onClose}
              type="button"
            >
              Cancel
            </Button>
            <Button disabled={isLoading} type="submit">
              {isAnonymous ? "Create Anonymous Group" : "Create Group"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Modal>
  );
};

export default GroupChatModal;