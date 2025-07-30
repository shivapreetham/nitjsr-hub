"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import MeetingTypeList from '@/app/(app)/videoChat/components/MeetingTypeList';
import { useRouter } from 'next/navigation';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useToast } from '@/app/hooks/use-toast';
import { useCurrentUserContext } from '@/context/CurrentUserProvider';
import { Button } from '@/components/ui/button';
import { useGetCallById } from '@/app/hooks/useGetCallById';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useGetCalls } from '@/app/hooks/useGetCalls';
import Loader from '@/app/(app)/videoChat/components/Loader';
import CallList from '@/app/(app)/videoChat/components/CallList';

const Home = () => {
  const now = new Date();
  const router = useRouter();
  const client = useStreamVideoClient();
  const { toast } = useToast();
  const { currentUser } = useCurrentUserContext();
  const { endedCalls, upcomingCalls, isLoading } = useGetCalls();

  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showAllPrevious, setShowAllPrevious] = useState(false);
  const [activeTab, setActiveTab] = useState("meetings");

  // Time and date formatting
  const time = now.toLocaleTimeString('en-India', { hour: '2-digit', minute: '2-digit' });
  const date = new Intl.DateTimeFormat('en-india', { dateStyle: 'full' }).format(now);

  // Personal room setup
  const meetingId = currentUser?.id;
  const { call } = useGetCallById(meetingId!);
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingId}?personal=true`;

  const startPersonalRoom = async () => {
    if (!client || !currentUser) return;
    const newCall = client.call('default', meetingId!);
    if (!call) {
      await newCall.getOrCreate({ data: { starts_at: new Date().toISOString() } });
    }
    router.push(`videoChat/meeting/${meetingId}?personal=true`);
  };

  // Get limited upcoming and previous calls
  const limitedUpcomingCalls = upcomingCalls?.slice(0, showAllUpcoming ? upcomingCalls.length : 2) || [];
  const limitedEndedCalls = endedCalls?.slice(0, showAllPrevious ? endedCalls.length : 2) || [];

  // Check if we have upcoming meetings
  const hasUpcomingMeeting = upcomingCalls && upcomingCalls.length > 0;
  const nextMeeting = hasUpcomingMeeting ? upcomingCalls[0] : null;
  const nextMeetingTime = nextMeeting?.state?.startsAt?.toLocaleTimeString('en-India', { hour: '2-digit', minute: '2-digit' });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (isLoading || !currentUser) return <Loader />;

  return (
    <motion.section 
      className="min-h-screen p-6 md:p-8 bg-blue-50/20 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Top Banner */}
      <div className="h-[200px] md:h-[220px] w-full rounded-3xl bg-gradient-to-r from-blue-600/80 to-indigo-700/80 relative overflow-hidden shadow-2xl border border-blue-200">
        {/* Animated background elements */}
        <motion.div 
          className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-white opacity-10"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute left-1/4 bottom-0 h-32 w-32 rounded-full bg-white opacity-5"
          animate={{ 
            y: [-10, 10, -10],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="flex h-full flex-col justify-between p-6 md:p-8 lg:p-10 z-10 relative">
          {hasUpcomingMeeting && (
            <motion.div 
              className="max-w-[300px] rounded-full py-2 px-4 text-center text-sm font-normal bg-white/20 backdrop-blur-md text-white border border-blue-100 shadow-lg"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-calendar-check text-white/80"></i>
                Upcoming Meeting at: {nextMeetingTime}
              </div>
            </motion.div>
          )}
          
          <motion.div 
            className="flex flex-col gap-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              {time}
            </h1>
            <p className="text-base md:text-lg font-medium text-white/80">
              {date}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tabs for navigation */}
      <Tabs 
        defaultValue="meetings" 
        className="w-full mt-6" 
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsList className="grid grid-cols-4 bg-blue-100/50 rounded-xl p-1 mb-6 backdrop-blur-sm border border-blue-200">
          <TabsTrigger 
            value="meetings" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            Start Meeting
          </TabsTrigger>
          <TabsTrigger 
            value="personal" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            Personal Room
          </TabsTrigger>
          <TabsTrigger 
            value="upcoming" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            Your Meetings
          </TabsTrigger>
          <TabsTrigger 
            value="recordings" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            Recordings
          </TabsTrigger>
        </TabsList>

        {/* Meeting options section */}
        <TabsContent value="meetings" className="mt-0">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.h2 
              variants={itemVariants}
              className="text-xl font-semibold text-blue-800 mb-5"
            >
              Start or join a meeting
            </motion.h2>
            <MeetingTypeList />
          </motion.div>
        </TabsContent>

        {/* Personal Room Section */}
        <TabsContent value="personal" className="mt-0">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/30 backdrop-blur-md rounded-xl p-6 shadow-lg border border-blue-200"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-xl font-semibold text-blue-800 mb-5"
            >
              Your Personal Meeting Room
            </motion.h2>
            
            <div className="flex flex-col gap-6 mb-6">
              <motion.div variants={itemVariants} className="flex flex-col gap-1">
                <h3 className="text-sm font-medium text-blue-600">Topic</h3>
                <p className="text-base font-semibold text-blue-800">{`${currentUser?.username}'s Meeting Room`}</p>
              </motion.div>
              
              <motion.div variants={itemVariants} className="flex flex-col gap-1">
                <h3 className="text-sm font-medium text-blue-600">Meeting ID</h3>
                <p className="text-base font-semibold text-blue-800">{meetingId}</p>
              </motion.div>
              
              <motion.div variants={itemVariants} className="flex flex-col gap-1">
                <h3 className="text-sm font-medium text-blue-600">Invite Link</h3>
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-blue-800 truncate">{meetingLink}</p>
                  <button 
                    className="text-blue-500 hover:text-blue-600"
                    onClick={() => {
                      navigator.clipboard.writeText(meetingLink);
                      toast({ title: 'Link Copied' });
                    }}
                  >
                    <i className="fa-solid fa-copy"></i>
                  </button>
                </div>
              </motion.div>
            </div>
            
            <motion.div variants={itemVariants} className="flex gap-4">
              <Button 
                onClick={startPersonalRoom}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:opacity-90 transition-all duration-300 py-5 px-6 shadow-md"
              >
                <i className="fa-solid fa-video mr-2"></i>
                Start Meeting
              </Button>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(meetingLink);
                  toast({ title: 'Link Copied' });
                }}
                className="bg-white border border-blue-200 text-blue-800 rounded-lg hover:bg-blue-50 transition-all duration-300 py-5 px-6 shadow-sm"
              >
                <i className="fa-solid fa-copy mr-2"></i>
                Copy Invitation
              </Button>
            </motion.div>
          </motion.div>
        </TabsContent>

        {/* Upcoming and Previous Meetings Section */}
        <TabsContent value="upcoming" className="mt-0">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Upcoming Meetings */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-blue-800">Upcoming Meetings</h2>
                {upcomingCalls && upcomingCalls.length > 2 && (
                  <button 
                    className="text-blue-500 text-sm font-medium hover:underline"
                    onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                  >
                    {showAllUpcoming ? 'Show Less' : 'Show All'}
                  </button>
                )}
              </div>
              
              {limitedUpcomingCalls && limitedUpcomingCalls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {limitedUpcomingCalls.map((meeting) => (
                    <motion.div
                      key={meeting.id}
                      variants={itemVariants}
                      className="bg-white/30 backdrop-blur-md rounded-xl p-5 shadow-md border border-blue-100 hover:shadow-lg transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <i className="fa-solid fa-calendar text-blue-500"></i>
                          </div>
                          <div>
                            <h3 className="font-medium text-blue-800">
                              {meeting.state?.custom?.description || 'Scheduled Meeting'}
                            </h3>
                            <p className="text-sm text-blue-600">
                              {meeting.state?.startsAt?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={() => router.push(`/meeting/${meeting.id}`)}
                          className="bg-blue-500 text-white text-sm py-1 px-3 rounded-lg hover:bg-blue-600"
                        >
                          Join
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-blue-50 rounded-xl p-8 text-center">
                  <p className="text-blue-600">No upcoming meetings scheduled</p>
                </div>
              )}
            </motion.div>
            
            {/* Previous Meetings */}
            <motion.div variants={itemVariants}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-blue-800">Previous Meetings</h2>
                {endedCalls && endedCalls.length > 2 && (
                  <button 
                    className="text-blue-500 text-sm font-medium hover:underline"
                    onClick={() => setShowAllPrevious(!showAllPrevious)}
                  >
                    {showAllPrevious ? 'Show Less' : 'Show All'}
                  </button>
                )}
              </div>
              
              {limitedEndedCalls && limitedEndedCalls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {limitedEndedCalls.map((meeting) => (
                    <motion.div
                      key={meeting.id}
                      variants={itemVariants}
                      className="bg-white/30 backdrop-blur-md rounded-xl p-5 shadow-md border border-blue-100 hover:shadow-lg transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <i className="fa-solid fa-history text-blue-500"></i>
                          </div>
                          <div>
                            <h3 className="font-medium text-blue-800">
                              {meeting.state?.custom?.description || 'Past Meeting'}
                            </h3>
                            <p className="text-sm text-blue-600">
                              {meeting.state?.startsAt?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={() => router.push(`/meeting/${meeting.id}`)}
                          className="bg-blue-200 text-blue-800 text-sm py-1 px-3 rounded-lg hover:bg-blue-300"
                        >
                          View
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-blue-50 rounded-xl p-8 text-center">
                  <p className="text-blue-600">No previous meetings found</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        </TabsContent>

        {/* Recordings Section */}
        <TabsContent value="recordings" className="mt-0">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-br from-blue-100/70 to-blue-50/70 rounded-2xl p-6 shadow-md border border-blue-200 mb-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                  <i className="fa-solid fa-film text-white text-lg"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                    Your Meeting Recordings
                  </h2>
                  <p className="text-blue-600">
                    Access and review all your recorded meetings
                  </p>
                </div>
              </div>
              
              <div className="relative overflow-hidden rounded-xl border border-blue-200 bg-white/30 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10"></div>
                
                <div className="p-4 relative z-10">
                  <CallList type="recordings" />
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 h-16 w-16 rounded-bl-full bg-gradient-to-br from-blue-100 to-indigo-100 opacity-50"></div>
                <div className="absolute bottom-0 left-0 h-20 w-20 rounded-tr-full bg-gradient-to-tr from-blue-100 to-indigo-100 opacity-50"></div>
              </div>
            </motion.div>
            
            {/* Quick actions */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="bg-white/30 backdrop-blur-md rounded-xl p-4 shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <i className="fa-solid fa-download text-blue-500"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-800">Download Recordings</h3>
                    <p className="text-sm text-blue-600">Save locally for offline access</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/30 backdrop-blur-md rounded-xl p-4 shadow-md border-l-4 border-indigo-500 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <i className="fa-solid fa-share-alt text-indigo-500"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-800">Share Recordings</h3>
                    <p className="text-sm text-blue-600">Send to team members or colleagues</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/30 backdrop-blur-md rounded-xl p-4 shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <i className="fa-solid fa-cog text-purple-500"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-800">Recording Settings</h3>
                    <p className="text-sm text-blue-600">Manage storage and preferences</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.section>
  );
};

export default Home;
