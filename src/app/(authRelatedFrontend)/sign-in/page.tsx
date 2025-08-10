'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/app/hooks/use-toast';
import { signInSchema } from '@/shared/schemas/signInSchema';
import { signIn } from 'next-auth/react';
import { Sparkles } from 'lucide-react';

export default function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });
  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    // console.log('Signing in with:', data);
    const result = await signIn('credentials', {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });
    // console.log('Sign in result:', result);
  

    if (!result) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again later.',
        variant: 'destructive',
      });
      return;
    }

    if (result.error) {
      if (result.error === 'CredentialsSignin') {
        toast({
          title: 'Login Failed',
          description: 'Incorrect username or password',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    } else if (result.url) {
      toast({
        title: 'Signed In',
        description: "You've successfully signed in!",
        variant: 'default',
      });
      router.replace('/home');
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
          <p className="text-lg text-foreground/80">Welcome Back!</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel htmlFor="identifier" className="text-foreground/90">
                    Email/Username
                  </FormLabel>
                  <Input 
                    {...field} 
                    id="identifier" 
                    name="identifier" 
                    className="bg-background/50 border-primary/20 hover:border-primary/30 transition-all duration-300 rounded-xl" 
                    placeholder="Enter your email or username" 
                  />
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel htmlFor="password" className="text-foreground/90">
                    Password
                  </FormLabel>
                  <Input 
                    {...field} 
                    id="password" 
                    type="password" 
                    name="password" 
                    className="bg-background/50 border-primary/20 hover:border-primary/30 transition-all duration-300 rounded-xl" 
                    placeholder="Enter your password" 
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
                'Sign In'
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center text-sm text-muted-foreground mt-4 space-y-1">
  <p>🧪 <span className="font-medium">Test Credentials</span> <br />
    <span className="text-xs text-muted-foreground">
      (Disclaimer: You might not have access to all features)
    </span>
  </p>
  <p>
    Email: <code className="bg-muted px-1 py-0.5 rounded text-foreground">2023ugcs117@nitjsr.ac.in</code>
  </p>
  <p>
    Password: <code className="bg-muted px-1 py-0.5 rounded text-foreground">123456</code>
  </p>
</div>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Not a member?{' '}
            <Link 
              href="/sign-up" 
              className="text-primary/90 hover:text-primary transition-colors duration-300"
            >
              Sign Up
            </Link>
          </p>
          <Link 
            href="/forgot-password" 
            className="text-sm text-muted-foreground hover:text-foreground/80 transition-colors duration-300"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
}