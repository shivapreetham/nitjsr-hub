"use client";

import Link from "next/link";
import { ArrowRight, MessageSquare, Video, Calendar, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [activeTab, setActiveTab] = useState("featured");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center">
      <div className="w-full max-w-7xl relative">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-sans">
            NIT JSR Hub
          </h1>
        </div>

        {/* Desktop Layout - Unchanged */}
        <div className="hidden md:grid grid-cols-5 gap-0 relative h-[600px]">
          {/* === CENTER CIRCLE (overlapping both rows) === */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative">
              {/* Halo around circle */}
              <div className="w-48 h-48 bg-muted rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              {/* Main circle */}
              <div className="w-36 h-36 bg-primary rounded-full flex items-center justify-center shadow-lg relative z-10">
                <div className="text-primary-foreground font-bold text-center">
                  <div className="text-xl">GET</div>
                  <div className="text-xl">STARTED</div>
                  <div className="text-xl">NOW</div>
                </div>
              </div>
            </div>
          </div>

          {/* === TOP LEFT (col 1) => Smart Chat === */}
          <Card className="col-span-1 border-2 border-primary shadow-md p-6 rounded-tl-xl">
            <CardContent className="p-0">
              <MessageSquare className="text-primary mb-4 h-10 w-10" />
              <h2 className="text-xl font-bold text-foreground mb-2">Smart Chat</h2>
              <p className="text-muted-foreground mb-4">
                Chat with friends using our AI-powered messaging system
              </p>
              <Link
                href="/conversations"
                className="inline-flex items-center text-primary font-medium hover:text-primary/80"
              >
                Start chatting <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          {/* === TOP CENTER (col 2-4) => Banner === */}
          <div className="col-span-3 bg-muted shadow-md p-6 flex flex-col items-center justify-center">
            <h3 className="text-xl font-medium text-foreground mb-2 text-center">
              Get your app for NIT Jamshedpur
            </h3>
            <p className="text-muted-foreground text-center">
              Integrate with ours, let&apos;s get big together
            </p>
          </div>

          {/* === TOP RIGHT (col 5) => Anonymous Video === */}
          <div className="col-span-1 bg-muted shadow-md p-6 rounded-tr-xl">
            <Video className="text-foreground mb-4 h-10 w-10" />
            <h2 className="text-xl font-bold text-foreground mb-2">Anonymous Video</h2>
            <p className="text-muted-foreground mb-4">
              Voice and videoChat with identity hidden, exciting filters included
            </p>
            <Link
              href="/videoChat"
              className="inline-flex items-center text-primary font-medium hover:text-primary/80"
            >
              Start a call <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {/* === BOTTOM ROW (col-span-5) => 2 flexible columns side by side === */}
          <div className="col-span-5 flex">
            {/* Bottom Left => Attendance Tracker */}
            <div className="flex-1 bg-muted shadow-md p-6 rounded-bl-xl">
              <Calendar className="text-primary mb-4 h-10 w-10" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                Attendance Tracker
              </h2>
              <p className="text-muted-foreground mb-4">
                Monitor attendance, compete with classmates, and track your daily progress
              </p>
              <div className="mb-4">
                <div className="flex justify-between text-foreground text-sm mb-1">
                  <span>Your attendance</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-muted/50 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: "85%" }}
                  />
                </div>
              </div>
              <Link
                href="/attendance"
                className="inline-flex items-center text-primary font-medium hover:text-primary/80"
              >
                View details <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Bottom Right => Campus Marketplace */}
            <Card className="flex-1 shadow-md p-6 rounded-br-xl">
              <CardContent className="p-0">
                <div className="flex justify-end">
                  <ShoppingBag className="text-primary mb-4 h-10 w-10" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2 text-right">
                  Campus Marketplace
                </h2>
                <p className="text-muted-foreground mb-4 text-right">
                  Buy and sell second-hand items exclusively for NIT Jamshedpur students
                </p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-muted rounded-lg p-2 aspect-square flex items-center justify-center shadow-sm">
                    <span className="text-foreground text-xs font-medium">Laptop</span>
                  </div>
                  <div className="bg-muted rounded-lg p-2 aspect-square flex items-center justify-center shadow-sm">
                    <span className="text-foreground text-xs font-medium">Books</span>
                  </div>
                  <div className="bg-muted rounded-lg p-2 aspect-square flex items-center justify-center shadow-sm">
                    <span className="text-foreground text-xs font-medium">Furniture</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Link
                    href="/market"
                    className="inline-flex items-center text-primary font-medium hover:text-primary/80"
                  >
                    Browse marketplace <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="md:hidden">
          {/* Mobile Action Button */}
          <div className="fixed bottom-6 right-6 z-50">
            <Button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg"
            >
              {mobileMenuOpen ? (
                <X className="text-primary-foreground h-8 w-8" />
              ) : (
                <Menu className="text-primary-foreground h-8 w-8" />
              )}
            </Button>
          </div>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 bg-primary bg-opacity-95 z-40 flex items-center justify-center">
              <div className="w-full max-w-sm">
                <div className="grid grid-cols-2 gap-4 p-4">
                  <Link href="/conversations" className="bg-card rounded-xl p-4 flex flex-col items-center shadow-lg" onClick={() => setMobileMenuOpen(false)}>
                    <MessageSquare className="text-primary mb-2 h-10 w-10" />
                    <span className="text-primary font-medium text-lg">Smart Chat</span>
                  </Link>
                  
                  <Link href="/videoChat" className="bg-card rounded-xl p-4 flex flex-col items-center shadow-lg" onClick={() => setMobileMenuOpen(false)}>
                    <Video className="text-primary mb-2 h-10 w-10" />
                    <span className="text-primary font-medium text-lg">Anonymous Video</span>
                  </Link>
                  
                  <Link href="/attendance" className="bg-card rounded-xl p-4 flex flex-col items-center shadow-lg" onClick={() => setMobileMenuOpen(false)}>
                    <Calendar className="text-primary mb-2 h-10 w-10" />
                    <span className="text-primary font-medium text-lg">Attendance</span>
                  </Link>
                  
                  <Link href="/market" className="bg-card rounded-xl p-4 flex flex-col items-center shadow-lg" onClick={() => setMobileMenuOpen(false)}>
                    <ShoppingBag className="text-primary mb-2 h-10 w-10" />
                    <span className="text-primary font-medium text-lg">Marketplace</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Main Interface with Tab Navigation */}
          <div className="mt-4 rounded-t-2xl overflow-hidden shadow-lg">
            {/* Tab Navigation */}
            <div className="flex rounded-t-2xl overflow-hidden">
              <button 
                className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === "featured" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                onClick={() => setActiveTab("featured")}
              >
                Featured
              </button>
              <button 
                className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === "services" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                onClick={() => setActiveTab("services")}
              >
                Services
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px] bg-card rounded-b-2xl">
              {/* Featured Tab Content */}
              {activeTab === "featured" && (
                <div className="p-4">
                  {/* Hero Card */}
                  <div className="bg-primary text-primary-foreground rounded-2xl p-6 mb-6 relative overflow-hidden shadow-lg">
                    <div className="relative z-10">
                      <h2 className="text-2xl font-bold mb-2">Welcome to NIT JSR Hub</h2>
                      <p className="mb-4 text-primary-foreground/80">Everything you need for campus life in one place</p>
                      <div className="flex">
                        <Button className="bg-card text-card-foreground px-4 py-2 rounded-lg font-medium shadow-md">
                          Get Started
                        </Button>
                      </div>
                    </div>
                    {/* Background pattern */}
                    <div className="absolute right-0 bottom-0 opacity-10">
                      <div className="w-32 h-32 rounded-full border-8 border-card"></div>
                    </div>
                  </div>

                  {/* Attendance Card */}
                  <Card className="mb-6 shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-foreground text-lg">Your Attendance</h3>
                          <p className="text-muted-foreground text-sm mb-2">Were you present today?! : YES</p>
                        </div>
                        <Calendar className="text-primary h-6 w-6" />
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-foreground text-sm mb-1">
                          <span>Overall</span>
                          <span className="font-medium">85%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: "85%" }}
                          />
                        </div>
                      </div>
                      <Link
                        href="/attendance"
                        className="mt-3 inline-flex items-center text-primary text-sm font-medium"
                      >
                        View details <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </CardContent>
                  </Card>

                  {/* Top Services */}
                  <h3 className="font-bold text-foreground text-lg mb-3">Popular Services</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Link href="/conversations" className="bg-card border border-primary/20 rounded-xl p-3 shadow-sm flex flex-col items-center">
                      <MessageSquare className="text-primary mb-2 h-8 w-8" />
                      <span className="text-foreground font-medium text-sm">Smart Chat</span>
                    </Link>
                    <Link href="/videoChat" className="bg-muted rounded-xl p-3 shadow-sm flex flex-col items-center">
                      <Video className="text-foreground mb-2 h-8 w-8" />
                      <span className="text-foreground font-medium text-sm">Anonymous Video</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Services Tab Content */}
              {activeTab === "services" && (
                <div className="p-4">
                  <div className="mb-6">
                    <h3 className="font-bold text-foreground text-lg mb-3">All Services</h3>
                    <div className="space-y-4">
                      {/* Smart Chat */}
                      <Link href="/conversations" className="block">
                        <Card className="border border-primary/20 shadow-sm">
                          <CardContent className="p-4 flex items-center">
                            <div className="bg-primary/10 rounded-full p-2 mr-4">
                              <MessageSquare className="text-primary h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-foreground">Smart Chat</h4>
                              <p className="text-sm text-muted-foreground">AI-powered messaging system</p>
                            </div>
                            <ArrowRight className="text-primary h-4 w-4" />
                          </CardContent>
                        </Card>
                      </Link>

                      {/* Anonymous Video */}
                      <Link href="/videoChat" className="block">
                        <Card className="border border-border shadow-sm">
                          <CardContent className="p-4 flex items-center">
                            <div className="bg-muted rounded-full p-2 mr-4">
                              <Video className="text-foreground h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-foreground">Anonymous Video</h4>
                              <p className="text-sm text-muted-foreground">Identity-hidden videoChat calls</p>
                            </div>
                            <ArrowRight className="text-primary h-4 w-4" />
                          </CardContent>
                        </Card>
                      </Link>

                      {/* Attendance Tracker */}
                      <Link href="/attendance" className="block">
                        <Card className="border border-border shadow-sm">
                          <CardContent className="p-4 flex items-center">
                            <div className="bg-primary/10 rounded-full p-2 mr-4">
                              <Calendar className="text-primary h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-foreground">Attendance Tracker</h4>
                              <p className="text-sm text-muted-foreground">Monitor your class attendance</p>
                            </div>
                            <ArrowRight className="text-primary h-4 w-4" />
                          </CardContent>
                        </Card>
                      </Link>

                      {/* Campus Marketplace */}
                      <Link href="/market" className="block">
                        <Card className="border border-border shadow-sm">
                          <CardContent className="p-4 flex items-center">
                            <div className="bg-primary/10 rounded-full p-2 mr-4">
                              <ShoppingBag className="text-primary h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-foreground">Campus Marketplace</h4>
                              <p className="text-sm text-muted-foreground">Buy and sell second-hand items</p>
                            </div>
                            <ArrowRight className="text-primary h-4 w-4" />
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  </div>

                  {/* Marketplace Categories */}
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-3">Marketplace Categories</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-muted rounded-lg p-3 aspect-square flex flex-col items-center justify-center shadow-sm">
                        <span className="text-foreground text-xs font-medium">Laptop</span>
                      </div>
                      <div className="bg-muted rounded-lg p-3 aspect-square flex flex-col items-center justify-center shadow-sm">
                        <span className="text-foreground text-xs font-medium">Books</span>
                      </div>
                      <div className="bg-muted rounded-lg p-3 aspect-square flex flex-col items-center justify-center shadow-sm">
                        <span className="text-foreground text-xs font-medium">Furniture</span>
                      </div>
                      <div className="bg-muted rounded-lg p-3 aspect-square flex flex-col items-center justify-center shadow-sm">
                        <span className="text-foreground text-xs font-medium">Notes</span>
                      </div>
                      <div className="bg-muted rounded-lg p-3 aspect-square flex flex-col items-center justify-center shadow-sm">
                        <span className="text-foreground text-xs font-medium">Electronics</span>
                      </div>
                      <div className="bg-muted rounded-lg p-3 aspect-square flex flex-col items-center justify-center shadow-sm">
                        <span className="text-foreground text-xs font-medium">All Items</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer / Suggestion Link */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Want to add a feature?{" "}
            <Link href="/suggest" className="text-primary hover:underline">
              Let us know
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

