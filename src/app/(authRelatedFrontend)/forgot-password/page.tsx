'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/app/hooks/use-toast';
import axios, { AxiosError } from 'axios';
import { forgotPasswordSchema } from '@/schemas/forgotPasswordSchema';


export default function ForgotPasswordForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    try {
      await axios.post('/api/forgot-password', data);
      
      toast({
        title: 'Success',
        description: 'If an account exists with this email, you will receive a password reset code.',
      });

      router.replace(`/reset-password/${data.email}`);
    } catch (error) {
      console.error('Error requesting password reset:', error);
      const axiosError = error as AxiosError<{ message: string }>;

      toast({
        title: 'Failed to Send Reset Email',
        description: axiosError.response?.data.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-background via-secondary/5 to-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-background/50 backdrop-blur-sm rounded-xl shadow-xl border border-primary/20 hover:border-primary/30 transition-all duration-300">
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/80">
              Reset Password
            </h1>
            <Sparkles className="absolute -right-8 -top-4 text-primary animate-bounce" />
          </div>
          <p className="text-lg text-foreground/80">Enter your email to reset your password</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel htmlFor="email" className="text-foreground/90">
                    Email Address
                  </FormLabel>
                  <Input 
                    {...field} 
                    id="email" 
                    name="email" 
                    className="bg-background/50 border-primary/20 hover:border-primary/30 transition-all duration-300 rounded-xl" 
                    placeholder="Enter your registered email" 
                  />
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 rounded-xl"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Send Reset Code'
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Remember your password?{' '}
            <Link 
              href="/sign-in" 
              className="text-primary/90 hover:text-primary transition-colors duration-300"
            >
              Sign in
            </Link>
          </p>
          <p className="text-xs text-muted-foreground/70">
            You will receive a verification code via email to reset your password
          </p>
        </div>
      </div>
    </div>
  );
}