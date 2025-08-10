'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/app/hooks/use-toast';
import { ApiResponse } from '@/shared/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { verifySchema } from '@/shared/schemas/verifySchema';
import { Loader2, Sparkles, Mail } from 'lucide-react';

export default function VerifyAccount() {
  const router = useRouter();
  const params = useParams<{ email: string }>();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.post<ApiResponse>(`/api/authentication/auth-utils/verify-code`, {
        email: params.email,
        code: data.code,
      });

      toast({
        title: 'Success',
        description: response.data.message,
      });

      router.replace('/sign-in');
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Verification Failed',
        description: axiosError.response?.data.message ?? 'An error occurred. Please try again.',
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
              NIT JSR hub
            </h1>
            <Sparkles className="absolute -right-8 -top-4 text-primary animate-bounce" />
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <p className="text-lg text-foreground/80">Verify Your Account</p>
            <p className="text-sm text-muted-foreground">
              We've sent a verification code to {params.email}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-foreground/90">Verification Code</FormLabel>
                  <Input 
                    {...field} 
                    className="bg-background/50 border-primary/20 hover:border-primary/30 transition-all duration-300 rounded-xl text-center text-lg tracking-wider"
                    placeholder="Enter code"
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
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?{' '}
            <Link href='/sign-up'>
            <button >
              Back to sign-up
            </button>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}