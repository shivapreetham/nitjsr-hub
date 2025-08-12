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
import { signIn } from 'next-auth/react';

export default function SignUpForm() {
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
      const response = await axios.post<ApiResponse>('/api/auth-utils/sign-up', data);
      
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

  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true);
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/home'
      });
      
      if (result?.error) {
        toast({
          title: 'Google Sign-up Failed',
          description: result.error.includes('NIT JSR institute email') 
            ? 'Please use your NIT JSR institute email (@nitjsr.ac.in)'
            : 'Failed to sign up with Google',
          variant: 'destructive',
        });
      } else if (result?.url) {
        router.replace(result.url);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong with Google sign-up',
        variant: 'destructive',
      });
    } finally {
      setIsGoogleLoading(false);
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
            <strong>Sign up options:</strong> Create an account with email/password or use Google OAuth with your NIT JSR email. NIT credentials are optional and can be added later from your profile.
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

            {/* Optional NIT Credentials Section */}
            <div className="space-y-6">
              <div className="flex items-center">
                <h2 className="text-lg font-medium">NIT Attendance Credentials</h2>
                <span className="ml-2 px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">Optional</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-2 h-6 w-6 p-0">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Optional: Add these now or later from your profile to access attendance features</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-muted-foreground">Skip this section if you prefer to add attendance credentials later from your profile</p>

              <FormField
                name="NITUsername"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-foreground/90">
                      NIT Username 
                      <span className="text-muted-foreground text-xs ml-2">(Registration Number) - Optional</span>
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
                      <span className="text-muted-foreground text-xs ml-2">(Usually your registered phone number) - Optional</span>
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

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-primary/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <Button
          onClick={handleGoogleSignUp}
          disabled={isGoogleLoading}
          variant="outline"
          className="w-full bg-background/50 border-primary/20 hover:border-primary/30 transition-all duration-300 rounded-xl py-6"
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing up with Google...
            </>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </Button>

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