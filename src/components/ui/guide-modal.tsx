'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  MessageCircle, 
  ShoppingCart, 
  Video, 
  Calendar,
  Settings,
  Users,
  Upload,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';

interface GuideStep {
  id: number;
  title: string;
  description: string;
  content: React.ReactNode;
  icon: React.ReactNode;
}

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: GuideStep[] = [
    {
      id: 0,
      title: "Welcome to NIT JSR Hub!",
      description: "Your all-in-one student platform",
      icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
      content: (
        <div className="space-y-4">
          <div className="text-center space-y-3">
            <div className="inline-block p-3 bg-primary/10 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Welcome aboard!</h3>
            <p className="text-muted-foreground">
              Let's take a quick tour of your new student platform. This guide will help you get started with all the amazing features.
            </p>
          </div>
          
          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Real-time messaging</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Student marketplace</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <Video className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Video conferencing</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Attendance tracking</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: "Real-time Chat",
      description: "Connect with your classmates instantly",
      icon: <MessageCircle className="h-6 w-6 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Messaging Features
              </CardTitle>
              <CardDescription>Stay connected with your college community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium">✨ What you can do:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Send messages, images, videos, and files</li>
                  <li>• Create and manage group chats</li>
                  <li>• See typing indicators and read receipts</li>
                  <li>• Share media files up to 5MB</li>
                </ul>
              </div>
              
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  💡 <strong>Tip:</strong> Use the chat to communicate with sellers in the marketplace!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 2,
      title: "Student Marketplace",
      description: "Buy and sell items with fellow students",
      icon: <ShoppingCart className="h-6 w-6 text-green-500" />,
      content: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Marketplace Features
              </CardTitle>
              <CardDescription>Your peer-to-peer trading platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium">🛒 What you can do:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• List items for sale with photos</li>
                  <li>• Browse and search for products</li>
                  <li>• Express interest in items you want</li>
                  <li>• Chat directly with sellers</li>
                </ul>
              </div>
              
              <div className="p-3 bg-green-50/50 dark:bg-green-950/30 rounded-lg border border-green-200/50 dark:border-green-800/50">
                <p className="text-xs text-green-700 dark:text-green-300">
                  💡 <strong>Tip:</strong> Upload clear photos and detailed descriptions for better sales!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 3,
      title: "Video Conferencing",
      description: "Host and join video calls seamlessly",
      icon: <Video className="h-6 w-6 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Call Features
              </CardTitle>
              <CardDescription>Connect face-to-face with your peers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium">📹 What you can do:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Start instant video calls from chat</li>
                  <li>• Schedule meetings for later</li>
                  <li>• High-quality audio and video</li>
                  <li>• View call history and recordings</li>
                </ul>
              </div>
              
              <div className="p-3 bg-purple-50/50 dark:bg-purple-950/30 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  💡 <strong>Tip:</strong> Use video calls for study groups and project discussions!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 4,
      title: "Attendance Tracking",
      description: "Monitor your class attendance automatically",
      icon: <Calendar className="h-6 w-6 text-orange-500" />,
      content: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Attendance Features
              </CardTitle>
              <CardDescription>Stay on top of your academic attendance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium">📊 What you can do:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• View attendance in calendar format</li>
                  <li>• See analytics and trends</li>
                  <li>• Compare with leaderboard</li>
                  <li>• Get automated data updates</li>
                </ul>
              </div>
              
              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                      Important: NIT Credentials Required
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      You need to provide your college portal credentials in Settings to enable attendance tracking.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 5,
      title: "Getting Started",
      description: "Essential setup steps",
      icon: <Settings className="h-6 w-6 text-indigo-500" />,
      content: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Setup Checklist
              </CardTitle>
              <CardDescription>Complete these steps to unlock all features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
                  <div className="flex-1">
                    <p className="font-medium">Update Your Profile</p>
                    <p className="text-xs text-muted-foreground">Add your course, branch, and batch details</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
                  <div className="flex-1">
                    <p className="font-medium">Set NIT Credentials (Optional)</p>
                    <p className="text-xs text-muted-foreground">Required only for attendance tracking</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
                  <div className="flex-1">
                    <p className="font-medium">Explore the Platform</p>
                    <p className="text-xs text-muted-foreground">Start chatting and exploring the marketplace</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="flex items-center gap-3">
            {currentStepData.icon}
            <div>
              <h2 className="text-xl font-semibold">{currentStepData.title}</h2>
              <p className="text-sm text-muted-foreground font-normal">{currentStepData.description}</p>
            </div>
          </DialogTitle>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-2 pt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-primary' 
                    : 'bg-secondary'
                }`}
              />
            ))}
          </div>
          
          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              {currentStep + 1} of {steps.length}
            </Badge>
          </div>
        </DialogHeader>

        <div className="py-4">
          {currentStepData.content}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {currentStep === steps.length - 1 ? (
              <Button onClick={handleComplete} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Complete Guide
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex items-center gap-2">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GuideModal;