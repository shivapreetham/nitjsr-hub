'use client';

import { ApiResponse } from '@/shared/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDebounceCallback } from 'usehooks-ts';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import axios, { AxiosError } from 'axios';
import { Loader2, Sparkles, CheckCircle2, XCircle, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signUpSchema } from '@/shared/schemas/signUpSchema';
import { useToast } from '@/app/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function SignUpForm() {
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debounced = useDebounceCallback(setUsername, 500);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      NITUsername: '',
      NITPassword: '',
    },
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage('');
        try {
          const response = await axios.get<ApiResponse>(
            `/api/zod-check/check-username-unique?username=${username}`
          );
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data.message ?? 'Error checking username'
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [username]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Main signup API call
      const response = await axios.post<ApiResponse>('/api/authentication/auth-utils/sign-up', data);
      
      // Group management API call (non-blocking)
      try {
        await fetch('/api/chat/group-management', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch (groupError) {
        console.error('Error adding to groups:', groupError);
        // Don't block the signup process
      }
  
      toast({
        title: 'Success',
        description: response.data.message,
      });

      router.replace(`/verify/${data.email}`);
    } catch (error) {
      console.error('Error during sign-up:', error);
      const axiosError = error as AxiosError<ApiResponse>;

      const errorMessage =
        axiosError.response?.data.message ??
        'There was a problem with your sign-up. Please try again.';

      toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-background via-secondary/5 to-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-background/50 backdrop-blur-sm rounded-xl shadow-xl border border-primary/20 hover:border-primary/30 transition-all duration-300">
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/80">
              NIT JSR Hub 
            </h1>
            <Sparkles className="absolute -right-8 -top-4 text-primary animate-bounce" />
          </div>
          <p className="text-lg text-foreground/80">Begin Your Journey</p>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-6">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>App vs. NIT Credentials:</strong> First create your app account with a username and password of your choice. Then provide your NIT attendance portal credentials separately.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* App Credentials Section */}
            <div className="space-y-6 pb-6 border-b border-primary/10">
              <h2 className="text-lg font-medium">App Credentials</h2>
              <p className="text-sm text-muted-foreground">Choose your login details for NIT JSR Hub</p>
              
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-foreground/90">Username</FormLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        className="bg-background/50 border-primary/20 hover:border-primary/30 transition-all duration-300 rounded-xl pr-10"
                        placeholder="Choose your username"
                        onChange={(e) => {
                          field.onChange(e);
                          debounced(e.target.value);
                        }}
                      />
                      {isCheckingUsername && (
                        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-primary/70" />
                      )}
                      {!isCheckingUsername && usernameMessage && (
                        <div className="absolute right-3 top-3">
                          {usernameMessage === 'Username is unique' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {!isCheckingUsername && usernameMessage && (
                      <p className={`text-sm ${usernameMessage === 'Username is unique' ? 'text-green-500' : 'text-red-500'}`}>
                        {usernameMessage}
                      </p>
                    )}
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-foreground/90">Email</FormLabel>
                    <Input
                      {...field}
                      className="bg-background/50 border-primary/20 hover:border-primary/30 transition-all duration-300 rounded-xl"
                      placeholder="Your college email (e.g., 2020ugcs001@nitjsr.ac.in)"
                    />
                    <p className="text-sm text-muted-foreground">
                      We will send you a verification code
                    </p>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-foreground/90">Password</FormLabel>
                    <Input
                      type="password"
                      {...field}
                      className="bg-background/50 border-primary/20 hover:border-primary/30 transition-all duration-300 rounded-xl"
                      placeholder="Create a strong password"
                    />
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            {/* NIT Credentials Section */}
            <div className="space-y-6">
              <div className="flex items-center">
                <h2 className="text-lg font-medium">NIT Attendance Credentials</h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-2 h-6 w-6 p-0">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">These are the same credentials you use to log into the NIT attendance portal</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-muted-foreground">Enter your NIT attendance portal login details</p>

              <FormField
                name="NITUsername"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-foreground/90">
                      NIT Username 
                      <span className="text-muted-foreground text-xs ml-2">(Registration Number)</span>
                    </FormLabel>
                    <Input
                      {...field}
                      className="bg-background/50 border-primary/20 hover:border-primary/30 transition-all duration-300 rounded-xl"
                      placeholder="Your registration number (e.g., 2020UGCS001)"
                    />
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                name="NITPassword"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-foreground/90">
                      NIT Password
                      <span className="text-muted-foreground text-xs ml-2">(Usually your registered phone number)</span>
                    </FormLabel>
                    <Input
                      type="password"
                      {...field}
                      className="bg-background/50 border-primary/20 hover:border-primary/30 transition-all duration-300 rounded-xl"
                      placeholder="Your NIT attendance portal password"
                    />
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 rounded-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Already a member?{' '}
            <Link 
              href="/sign-in" 
              className="text-primary/90 hover:text-primary transition-colors duration-300"
            >
              Sign in
            </Link>
          </p>
          <p className="text-xs text-muted-foreground/70">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}