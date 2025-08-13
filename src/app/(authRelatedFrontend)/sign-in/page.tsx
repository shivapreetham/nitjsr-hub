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
import { Sparkles, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';

export default function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });
  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn('credentials', {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });

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

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/home'
      });
      
      if (result?.error) {
        toast({
          title: 'Google Sign-in Failed',
          description: result.error.includes('NIT JSR institute email') 
            ? 'Please use your NIT JSR institute email (@nitjsr.ac.in)'
            : 'Failed to sign in with Google',
          variant: 'destructive',
        });
      } else if (result?.url) {
        router.replace(result.url);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong with Google sign-in',
        variant: 'destructive',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-background via-background/50 to-secondary/20">
      <div className="w-full max-w-md p-8 space-y-8 bg-card/80 backdrop-blur-lg rounded-xl shadow-xl border border-border/50 hover:border-border transition-all duration-300">
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              NIT JSR Hub
            </h1>
            <Sparkles className="absolute -right-6 -top-2 text-primary animate-bounce" size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-semibold text-foreground">Welcome Back!</p>
            <p className="text-sm text-muted-foreground">Sign in to access your student portal</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="identifier" className="text-foreground font-medium flex items-center gap-2">
                    <Mail size={16} className="text-primary" />
                    Email/Username
                  </FormLabel>
                  <Input 
                    {...field} 
                    id="identifier" 
                    name="identifier" 
                    className="bg-background/70 backdrop-blur-sm border-border/50 focus:border-primary hover:border-border transition-all duration-200" 
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
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="password" className="text-foreground font-medium flex items-center gap-2">
                    <Lock size={16} className="text-primary" />
                    Password
                  </FormLabel>
                  <div className="relative">
                    <Input 
                      {...field} 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      className="bg-background/70 backdrop-blur-sm border-border/50 focus:border-primary hover:border-border transition-all duration-200 pr-10" 
                      placeholder="Enter your password" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
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

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <div className="space-y-3">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            variant="outline"
            className="w-full"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in with Google...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>
          
          {/* College Email Notice */}
          <div className="text-center p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium flex items-center justify-center gap-2">
              📧 <span>Google sign-in requires your college email</span>
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Please use your <span className="font-mono bg-blue-100 dark:bg-blue-900/50 px-1 rounded">@nitjsr.ac.in</span> email address
            </p>
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground mt-4 space-y-2 bg-muted/20 backdrop-blur-sm p-4 rounded-lg border border-border/50">
          <p className="flex items-center justify-center gap-2">🧪 <span className="font-medium text-primary">Test Credentials</span></p>
          <p className="text-xs text-muted-foreground">
            (Disclaimer: You might not have access to all features)
          </p>
          <div className="space-y-1">
            <p className="flex items-center justify-between">
              <span>Email:</span>
              <code className="bg-muted px-2 py-1 rounded text-foreground font-mono text-xs">2023ugcs117@nitjsr.ac.in</code>
            </p>
            <p className="flex items-center justify-between">
              <span>Password:</span>
              <code className="bg-muted px-2 py-1 rounded text-foreground font-mono text-xs">123456</code>
            </p>
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Not a member?{' '}
            <Link 
              href="/sign-up" 
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Sign Up
            </Link>
          </p>
          <Link 
            href="/forgot-password" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
}