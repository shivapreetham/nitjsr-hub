'use client';

import type { ApiResponse } from '@/shared/types/ApiResponse';
import type { z } from 'zod';

import React, { useState } from 'react';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, Send, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent, Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/app/hooks/use-toast';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { anonymousMessageSchema as messageSchema } from '@/shared/schemas/anonymousMessageSchema';
import { ModeToggle } from '@/components/home&anonymous/ModeToggle';
import { cn } from '@/app/lib/utils';

interface SendMessageState {
  isLoading: boolean;
  isLoadingSuggestions: boolean;
  messages: string[];
  topic: string;
  suggestionsVisible: boolean;
}

const INITIAL_MESSAGE_STRING = ` You've got that cool vibe; people notice it! || A little boost in confidence could go a long way! || I love how you bring your ideas to life—keep it up!`;

const parseMessages = (messageString: string): string[] => {
  return messageString.split('||').map((msg) => msg.trim());
};

export default function SendMessage(): JSX.Element {
  const { username } = useParams<{ username: string }>();
  const [state, setState] = useState<SendMessageState>({
    isLoading: false,
    isLoadingSuggestions: false,
    messages: parseMessages(INITIAL_MESSAGE_STRING),
    topic: '',
    suggestionsVisible: false,
  });

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: '',
    },
  });

  const messageContent = form.watch('content');

  const onSubmit = async (data: z.infer<typeof messageSchema>): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await axios.post<ApiResponse>('/api/anonymous/send-messages', {
        ...data,
        username,
      });
      toast({
        title: 'Success!',
        description: response.data.message,
        variant: 'default',
      });
      form.reset({ content: '' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message ?? 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const fetchSuggestedMessages = async (): Promise<void> => {
    if (!state.topic.trim()) return;
    setState((prev) => ({ ...prev, isLoadingSuggestions: true }));
    try {
      const response = await axios.post<ApiResponse>('/api/anonymous/suggest-messages', {
        topic: state.topic,
      });
      const newMessages = parseMessages(response.data.message);
      setState((prev) => ({
        ...prev,
        messages: newMessages,
        suggestionsVisible: true,
      }));
      toast({
        title: 'New suggestions ready!',
        description: 'Click any message to use it',
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: "Couldn't fetch suggestions",
        description: 'Please try a different topic',
        variant: 'destructive',
      });
    } finally {
      setState((prev) => ({ ...prev, isLoadingSuggestions: false }));
    }
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setState((prev) => ({ ...prev, topic: e.target.value }));
  };

  const useMessage = (message: string): void => {
    form.setValue('content', message);
    setState((prev) => ({ ...prev, suggestionsVisible: false }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background py-12 px-4">
      <Card className="mx-auto max-w-2xl border-primary/10">
        <CardContent className="p-6 space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Send a Message to <span className="text-primary">{username}</span>
            </h1>
            <p className="text-muted-foreground">Your message will be delivered anonymously</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Textarea
                          placeholder="Write something nice..."
                          className="min-h-[120px] resize-none bg-card/50 backdrop-blur-sm font-mono 
                                   border-primary/10 hover:border-primary/20 transition-all"
                          {...field}
                        />
                        <div className="absolute bottom-2 right-2">
                          <Button
                            type="submit"
                            size="sm"
                            disabled={state.isLoading || !messageContent}
                            className="rounded-full h-8 w-8 p-0"
                          >
                            {state.isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <div>
            <div
              className="flex items-center justify-between border-b border-primary/10 pb-2 mb-4 cursor-pointer"
              onClick={() =>
                setState((prev) => ({ ...prev, suggestionsVisible: !prev.suggestionsVisible }))
              }
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Message Suggestions</span>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  state.suggestionsVisible ? 'rotate-180' : ''
                )}
              />
            </div>

            {state.suggestionsVisible && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={state.topic}
                    onChange={handleTopicChange}
                    placeholder="Enter a topic for suggestions..."
                    className="bg-card/50 border-primary/10 hover:border-primary/20"
                  />
                  <Button
                    onClick={fetchSuggestedMessages}
                    disabled={!state.topic.trim() || state.isLoadingSuggestions}
                    size="sm"
                  >
                    {state.isLoadingSuggestions ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Suggest'
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  {state.messages.map((message, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className={cn(
                        'w-full justify-start font-mono text-sm h-auto whitespace-normal',
                        messageContent === message && 'bg-primary/10'
                      )}
                      onClick={() => useMessage(message)}
                    >
                      {message}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="text-center space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">Want to receive anonymous messages?</p>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/sign-up">
                Create your message board
                <ChevronDown className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="fixed top-4 right-4">
        <ModeToggle />
      </div>
    </div>
  );
}
