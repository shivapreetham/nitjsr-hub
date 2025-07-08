"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  MessageCircle, 
  Lock, 
  Bot, 
  School,
  UserCheck,
  MessagesSquare,
  Video,
  Calendar,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12 bg-gradient-to-b from-background via-secondary/5 to-background">
        {/* Hero Section */}
        <section className="text-center mb-16 space-y-8">
          <div className="relative inline-block">
            <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/80">
              NIT JSR Hub
            </h1>
            <Sparkles className="absolute -right-8 -top-4 text-primary animate-bounce" />
          </div>
          
          <div className="space-y-3">
            <p className="text-2xl md:text-3xl text-foreground/90 font-medium">
              Exclusive Social Platform for NIT Jamshedpur
            </p>
            <p className="text-lg md:text-xl text-muted-foreground italic">
              Everything you need for campus life in one place
            </p>
          </div>

          {/* Main CTA */}
          <div className="flex gap-6 justify-center mt-8">
            <Link href="/sign-in">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 rounded-xl">
                Join Now
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="px-8 py-6 text-lg border-primary/20 hover:bg-primary/5 rounded-xl hover:border-primary/40 transition-all duration-300"
            >
              Learn More
            </Button>
          </div>
        </section>

        {/* Main Features */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Verified Community */}
          <Card className="row-span-1 bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <School className="text-primary h-6 w-6" />
                Verified Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80 leading-relaxed">
                Exclusive to NIT Jamshedpur students. Every account is verified with institute credentials.
              </p>
            </CardContent>
          </Card>

          {/* Main Features */}
          <Card className="row-span-2 col-span-1 md:col-span-2 bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <MessagesSquare className="text-primary h-6 w-6" />
                Platform Features
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <MessageCircle className="text-primary w-8 h-8" />
                <h3 className="font-semibold text-lg">Smart Chat</h3>
                <p className="text-muted-foreground leading-relaxed">
                  AI-powered messaging system
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Video className="text-primary w-8 h-8" />
                <h3 className="font-semibold text-lg">Anonymous Video</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Identity-hidden video calls
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Calendar className="text-primary w-8 h-8" />
                <h3 className="font-semibold text-lg">Attendance Tracker</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Monitor your class attendance
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <ShoppingBag className="text-primary w-8 h-8" />
                <h3 className="font-semibold text-lg">Campus Marketplace</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Buy and sell second-hand items
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <Card className="row-span-1 bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Bot className="text-primary h-6 w-6" />
                AI Assistance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80 leading-relaxed">
                Get help with your messages and tasks with our integrated AI assistant.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Featured Services */}
        <div className="w-full max-w-6xl mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-foreground/90">Featured Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Smart Chat */}
            <Card className="bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <MessageCircle className="text-primary h-6 w-6" />
                  Smart Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/80 leading-relaxed">
                  Chat with friends using our AI-powered messaging system. Create groups, share content, and more.
                </p>
                <div className="flex justify-end">
                  <Link href="/conversations">
                    <Button variant="outline" className="flex items-center gap-2 text-primary">
                      <span>Start chatting</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Anonymous Video */}
            <Card className="bg-gray-800 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-gray-700 hover:border-gray-600 rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-white">
                  <Video className="text-white h-6 w-6" />
                  Anonymous Video
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Voice and video chat with identity hidden. Exciting filters included for privacy and fun.
                </p>
                <div className="flex justify-end">
                  <Link href="/videoChat">
                    <Button variant="outline" className="flex items-center gap-2 text-white border-gray-600">
                      <span>Start a call</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Attendance & Marketplace */}
        <div className="w-full max-w-6xl mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Attendance Tracker */}
            <Card className="bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Calendar className="text-primary h-6 w-6" />
                  Attendance Tracker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/80 leading-relaxed">
                  Monitor attendance, compete with classmates, and track your daily progress.
                </p>
                <div className="mb-4">
                  <div className="flex justify-between text-foreground/80 text-sm mb-1">
                    <span>Your attendance</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: "85%" }}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Link href="/attendance">
                    <Button variant="outline" className="flex items-center gap-2 text-primary">
                      <span>View details</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Campus Marketplace */}
            <Card className="bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <ShoppingBag className="text-primary h-6 w-6" />
                  Campus Marketplace
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/80 leading-relaxed">
                  Buy and sell second-hand items exclusively for NIT Jamshedpur students.
                </p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-100 rounded-lg p-2 aspect-square flex items-center justify-center shadow-sm">
                    <span className="text-foreground/80 text-xs font-medium">Laptop</span>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-2 aspect-square flex items-center justify-center shadow-sm">
                    <span className="text-foreground/80 text-xs font-medium">Books</span>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-2 aspect-square flex items-center justify-center shadow-sm">
                    <span className="text-foreground/80 text-xs font-medium">Furniture</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Link href="/market">
                    <Button variant="outline" className="flex items-center gap-2 text-primary">
                      <span>Browse marketplace</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-12 mb-16">
          {[
            { icon: UserCheck, label: "Verified Users", value: "1000+" },
            { icon: MessageCircle, label: "Daily Messages", value: "500+" },
            { icon: Lock, label: "Secure Platform", value: "100%" }
          ].map((stat, idx) => (
            <div key={idx} className="text-center group">
              <stat.icon className="w-10 h-10 text-primary/80 group-hover:text-primary mx-auto mb-3 transition-colors duration-300" />
              <p className="font-bold text-2xl text-foreground/90 mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </main>
      <div className="w-full max-w-4xl mx-auto px-4 mb-8">
       <p className="text-sm text-red-500/90 text-center font-medium border border-red-500/20 rounded-lg p-3 bg-red-500/5">
       ⚠️ Disclaimer: All communications on this platform are monitored. Any form of harassment, hate speech, or malicious content will result in immediate account termination and may lead to disciplinary action.
      </p>
      </div>
      <footer className="text-center p-8 bg-background/50 backdrop-blur-sm text-muted-foreground border-t border-primary/10">
        <p className="text-sm">
          © 2025 NIT JSR Hub. All rights reserved.
        </p>
      </footer>
    </div>
  );
}