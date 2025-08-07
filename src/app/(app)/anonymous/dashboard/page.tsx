'use client';

import type { User } from 'next-auth';
import type { AnonymousMessage } from '@prisma/client';
import type { ApiResponse } from '@/shared/types/ApiResponse';
import type { AxiosError } from 'axios';

import { MessageCard } from '@/components/home&anonymous/AnonymousMessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/app/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Copy, Link2, Loader2, RefreshCcw, Settings2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AcceptAnonymousMessageSchema } from '@/shared/schemas/acceptAnonymousMessageSchema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function UserDashboard(): JSX.Element {
  const [messages, setMessages] = useState<AnonymousMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const { toast } = useToast();

  const handleDeleteMessage = (messageId: string): void => {
    setMessages(messages.filter((message) => message.id !== messageId));
  };

  const { data: session } = useSession();
  const form = useForm({
    resolver: zodResolver(AcceptAnonymousMessageSchema),
    defaultValues: {
      acceptMessages: false
    }
  });

  const { register, watch, setValue } = form;
  const acceptMessages: boolean = watch('acceptMessages');

  const fetchAcceptMessages = useCallback(async (): Promise<void> => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/anonymous/accept-messages');
      if (response.data.success && response.data.isAcceptingAnonymousMessages !== undefined) {
        setValue('acceptMessages', response.data.isAcceptingAnonymousMessages);
      } else {
        setValue('acceptMessages', false);
        if (!response.data.success) {
          throw new Error(response.data.message);
        }
      }
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to fetch message settings',
        variant: 'destructive',
      });
      setValue('acceptMessages', false);
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  const fetchMessages = useCallback(async (refresh: boolean = false): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/anonymous/get-messages');
      if (!response.data.success) {
        setMessages([]);
        if (refresh) {
          toast({
            title: 'No Messages',
            description: response.data.message,
          });
        }
        return;
      }
      setMessages(response.data.anonymousMessages || []);
      if (refresh) {
        toast({
          title: 'Success',
          description: 'Messages refreshed successfully',
        });
      }
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to fetch messages',
        variant: 'destructive',
      });
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!session?.user) return;
    fetchMessages();
    fetchAcceptMessages();
  }, [session, fetchAcceptMessages, fetchMessages]);

  const handleSwitchChange = async (): Promise<void> => {
    try {
      const response = await axios.post<ApiResponse>('/api/anonymous/accept-messages', {
        acceptAnonymousMessages: !acceptMessages,
      });
      
      if (response.data.success) {
        setValue('acceptMessages', !acceptMessages);
        toast({
          title: 'Success',
          description: response.data.message,
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to update message settings',
        variant: 'destructive',
      });
    }
  };

  if (!session?.user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link2 href="/sign-in">Sign In</Link2>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { username } = session.user as User;
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/anonymous/u/${username}`;

  const copyToClipboard = async (): Promise<void> => {
    await navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'URL Copied!',
      description: 'Profile URL has been copied to clipboard.',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back, <span className="text-primary">{username}</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your anonymous messages and preferences
            </p>
          </div>
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dashboard Settings</DialogTitle>
                <DialogDescription>Configure your messaging preferences</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-medium">Anonymous Messages</h4>
                    <p className="text-sm text-muted-foreground">
                      Allow others to send you anonymous messages
                    </p>
                  </div>
                  <Switch
                    {...register('acceptMessages')}
                    checked={acceptMessages}
                    onCheckedChange={handleSwitchChange}
                    disabled={isSwitchLoading}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Your Profile URL</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={profileUrl}
                      readOnly
                      className="flex-1 rounded-md border bg-secondary/10 px-3 py-2 text-sm"
                    />
                    <Button size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-8 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Anonymous Messages</CardTitle>
                <CardDescription>
                  {messages.length 
                    ? `You have ${messages.length} message${messages.length === 1 ? '' : 's'}`
                    : 'No messages yet'}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchMessages(true)}
                className="h-8 w-8"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            <Separator className="mb-4" />
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <MessageCard
                      key={message.id}
                      message={message}
                      onMessageDelete={handleDeleteMessage}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <p className="text-muted-foreground">
                      No messages to display. Share your profile link to receive anonymous messages.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={copyToClipboard}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Profile URL
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;