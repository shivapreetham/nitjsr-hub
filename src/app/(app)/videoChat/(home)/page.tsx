"use client";

import { useState, useMemo, useCallback } from "react";
import MeetingTypeList from '@/app/(app)/videoChat/components/MeetingTypeList';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/hooks/use-toast';
import { useCurrentUserContext } from '@/context/CurrentUserProvider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Video, Calendar, Clock, Users } from 'lucide-react';

const Home = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { currentUser } = useCurrentUserContext();

  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showAllPrevious, setShowAllPrevious] = useState(false);
  const [activeTab, setActiveTab] = useState("meetings");

  // Memoize time and date formatting
  const { time, date } = useMemo(() => {
    const now = new Date();
    return {
      time: now.toLocaleTimeString('en-India', { hour: '2-digit', minute: '2-digit' }),
      date: new Intl.DateTimeFormat('en-india', { dateStyle: 'full' }).format(now)
    };
  }, []);

  // Personal room setup
  const meetingId = currentUser?.id;
  
  const meetingLink = useMemo(() => 
    `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingId}?personal=true`,
    [meetingId]
  );

  const startPersonalRoom = useCallback(async () => {
    if (!currentUser) return;
    router.push(`videoChat/meeting/${meetingId}?personal=true`);
  }, [currentUser, meetingId, router]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(meetingLink);
    toast({ title: 'Link Copied' });
  }, [meetingLink, toast]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to access video chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Video Chat</h1>
              <p className="text-muted-foreground mt-1">{time} • {date}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs 
          defaultValue="meetings" 
          className="w-full" 
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto mb-8">
            <TabsTrigger value="meetings" className="flex items-center gap-2">
              <Video size={16} />
              Start Meeting
            </TabsTrigger>
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <Users size={16} />
              Personal Room
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Calendar size={16} />
              Your Meetings
            </TabsTrigger>
            <TabsTrigger value="recordings" className="flex items-center gap-2">
              <Clock size={16} />
              Recordings
            </TabsTrigger>
          </TabsList>

          {/* Meeting options section */}
          <TabsContent value="meetings" className="mt-0">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Start or join a meeting</h2>
              <p className="text-muted-foreground">Create a new meeting or join an existing one</p>
            </div>
            <MeetingTypeList />
          </TabsContent>

          {/* Personal Room Section */}
          <TabsContent value="personal" className="mt-0">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users size={24} className="text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">Your Personal Meeting Room</h2>
                    <p className="text-muted-foreground">A dedicated space for your meetings</p>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Meeting Name</p>
                        <p className="text-foreground">{`${currentUser?.username}'s Meeting Room`}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Meeting ID</p>
                        <p className="text-foreground font-mono">{meetingId}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Invite Link</p>
                        <p className="text-foreground text-sm truncate">{meetingLink}</p>
                      </div>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={copyLink}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button 
                      onClick={startPersonalRoom}
                      className="flex-1"
                    >
                      <Video size={16} className="mr-2" />
                      Start Meeting
                    </Button>
                    <Button
                      variant="outline"
                      onClick={copyLink}
                    >
                      Copy Invitation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Upcoming and Previous Meetings Section */}
          <TabsContent value="upcoming" className="mt-0">
            <div className="space-y-8">
              {/* Upcoming Meetings */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Upcoming Meetings</h2>
                </div>
                
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar size={48} className="text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No upcoming meetings scheduled</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Previous Meetings */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Previous Meetings</h2>
                </div>
                
                <Card>
                  <CardContent className="p-8 text-center">
                    <Clock size={48} className="text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No previous meetings found</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Recordings Section */}
          <TabsContent value="recordings" className="mt-0">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Meeting Recordings</h2>
              <p className="text-muted-foreground">Access and review all your recorded meetings</p>
            </div>
            <Card>
              <CardContent className="p-8 text-center">
                <Clock size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recordings available</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Home;
