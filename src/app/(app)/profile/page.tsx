'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/app/hooks/use-toast';
import { nitCredentialsSchema } from '@/shared/schemas/signUpSchema';
import { 
  User, 
  Mail, 
  Key, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Settings, 
  BookOpen,
  AlertCircle 
} from 'lucide-react';

type NitCredentialsForm = z.infer<typeof nitCredentialsSchema>;

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isStartingScraping, setIsStartingScraping] = useState(false);

  const form = useForm<NitCredentialsForm>({
    resolver: zodResolver(nitCredentialsSchema),
    defaultValues: {
      NITUsername: '',
      NITPassword: '',
    },
  });

  useEffect(() => {
    if (session?.user) {
      form.setValue('NITUsername', session.user.NITUsername || '');
      form.setValue('NITPassword', session.user.NITPassword || '');
    }
  }, [session, form]);

  const onSubmit = async (data: NitCredentialsForm) => {
    try {
      setIsUpdating(true);
      
      const response = await fetch('/api/auth/update-nit-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update credentials');
      }

      // Update session to reflect new credentials
      await update({
        ...session,
        user: {
          ...session?.user,
          NITUsername: data.NITUsername,
          NITPassword: data.NITPassword,
          hasNitCredentials: true,
        },
      });

      toast({
        title: 'Success',
        description: 'NIT credentials updated successfully',
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update credentials',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartScraping = async () => {
    try {
      setIsStartingScraping(true);
      const response = await fetch('/api/start-scraping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session?.user?.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start scraping');
      }

      toast({
        title: 'Success',
        description: 'Scraping request sent successfully!',
      });
    } catch (error) {
      console.error('Error starting scraping:', error);
      toast({
        title: 'Error',
        description: 'Failed to start scraping. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsStartingScraping(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account information and NIT attendance credentials
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Username</label>
                  <p className="text-foreground">{session.user.username}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-foreground">{session.user.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                  <div className="flex items-center gap-2">
                    {session.user.isVerified ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Verified
                        </Badge>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <Badge variant="destructive">Not Verified</Badge>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">NIT Credentials</label>
                  <div className="flex items-center gap-2">
                    {session.user.hasNitCredentials ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Configured
                        </Badge>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                          Not Configured
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* NIT Credentials Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  NIT Attendance Portal Credentials
                </CardTitle>
                <CardDescription>
                  These credentials are used to access your attendance data from the NIT attendance portal.
                  {!session.user.hasNitCredentials && (
                    <span className="block mt-2 text-orange-600 dark:text-orange-400">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      You need to add these credentials to access attendance features.
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      name="NITUsername"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NIT Username (Registration Number)</FormLabel>
                          <Input
                            {...field}
                            placeholder="e.g., 2020UGCS001"
                            className="bg-background/50"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="NITPassword"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NIT Password</FormLabel>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Your NIT attendance portal password"
                            className="bg-background/50"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating Credentials...
                        </>
                      ) : (
                        <>
                          <Settings className="mr-2 h-4 w-4" />
                          Update NIT Credentials
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Scraping Section */}
            {session.user.hasNitCredentials && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Attendance Data Scraping
                  </CardTitle>
                  <CardDescription>
                    Start the scraping process to collect your latest attendance data from the NIT portal.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleStartScraping}
                    disabled={isStartingScraping}
                    variant="outline"
                    className="w-full"
                  >
                    {isStartingScraping ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting Scraping Process...
                      </>
                    ) : (
                      <>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Start Attendance Scraping
                      </>
                    )}
                  </Button>
                  
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> This will send your email to the scraping server to collect your attendance data.
                      The process may take a few minutes to complete.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}