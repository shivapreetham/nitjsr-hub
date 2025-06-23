"use client";

import Link from "next/link";
import { ArrowRight, MessageSquare, Video, Calendar, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("featured");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white p-4 flex flex-col items-center">
      <div className="w-full max-w-7xl relative">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 font-sans">
            NIT JSR Hub
          </h1>
        </div>

        {/* Desktop Layout - Unchanged */}
        <div className="hidden md:grid grid-cols-5 gap-0 relative h-[600px]">
          {/* === CENTER CIRCLE (overlapping both rows) === */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative">
              {/* Halo around circle */}
              <div className="w-48 h-48 bg-gray-300 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              {/* Main circle */}
              <div className="w-36 h-36 bg-blue-700 rounded-full flex items-center justify-center shadow-lg relative z-10">
                <div className="text-white font-bold text-center">
                  <div className="text-xl">GET</div>
                  <div className="text-xl">STARTED</div>
                  <div className="text-xl">NOW</div>
                </div>
              </div>
            </div>
          </div>

          {/* === TOP LEFT (col 1) => Smart Chat === */}
          <div className="col-span-1 bg-white border-2 border-blue-500 shadow-md p-6 rounded-tl-xl">
            <MessageSquare className="text-blue-600 mb-4 h-10 w-10" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Smart Chat</h2>
            <p className="text-slate-600 mb-4">
              Chat with friends using our AI-powered messaging system
            </p>
            <Link
              href="/conversations"
              className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
            >
              Start chatting <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {/* === TOP CENTER (col 2-4) => Banner === */}
          <div className="col-span-3 bg-gray-300 shadow-md p-6 flex flex-col items-center justify-center">
            <h3 className="text-xl font-medium text-slate-800 mb-2 text-center">
              Get your app for NIT Jamshedpur
            </h3>
            <p className="text-slate-600 text-center">
              Integrate with ours, let&apos;s get big together
            </p>
          </div>

          {/* === TOP RIGHT (col 5) => Anonymous Video === */}
          <div className="col-span-1 bg-gray-500 shadow-md p-6 rounded-tr-xl">
            <Video className="text-white mb-4 h-10 w-10" />
            <h2 className="text-xl font-bold text-white mb-2">Anonymous Video</h2>
            <p className="text-gray-200 mb-4">
              Voice and videoChat with identity hidden, exciting filters included
            </p>
            <Link
              href="/videoChat"
              className="inline-flex items-center text-white font-medium hover:text-gray-200"
            >
              Start a call <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {/* === BOTTOM ROW (col-span-5) => 2 flexible columns side by side === */}
          <div className="col-span-5 flex">
            {/* Bottom Left => Attendance Tracker */}
            <div className="flex-1 bg-gray-200 shadow-md p-6 rounded-bl-xl">
              <Calendar className="text-blue-600 mb-4 h-10 w-10" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Attendance Tracker
              </h2>
              <p className="text-slate-600 mb-4">
                Monitor attendance, compete with classmates, and track your daily progress
              </p>
              <div className="mb-4">
                <div className="flex justify-between text-slate-700 text-sm mb-1">
                  <span>Your attendance</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "85%" }}
                  />
                </div>
              </div>
              <Link
                href="/attendance"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
              >
                View details <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Bottom Right => Campus Marketplace */}
            <div className="flex-1 bg-white shadow-md p-6 rounded-br-xl">
              <div className="flex justify-end">
                <ShoppingBag className="text-blue-600 mb-4 h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2 text-right">
                Campus Marketplace
              </h2>
              <p className="text-slate-600 mb-4 text-right">
                Buy and sell second-hand items exclusively for NIT Jamshedpur students
              </p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-100 rounded-lg p-2 aspect-square flex items-center justify-center shadow-sm">
                  <span className="text-slate-700 text-xs font-medium">Laptop</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-2 aspect-square flex items-center justify-center shadow-sm">
                  <span className="text-slate-700 text-xs font-medium">Books</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-2 aspect-square flex items-center justify-center shadow-sm">
                  <span className="text-slate-700 text-xs font-medium">Furniture</span>
                </div>
              </div>
              <div className="flex justify-end">
                <Link
                  href="/market"
                  className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
                >
                  Browse marketplace <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden">
          {/* Mobile Action Button */}
          <div className="fixed bottom-6 right-6 z-50">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center shadow-lg"
            >
              {mobileMenuOpen ? (
                <X className="text-white h-8 w-8" />
              ) : (
                <Menu className="text-white h-8 w-8" />
              )}
            </button>
          </div>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 bg-blue-700 bg-opacity-95 z-40 flex items-center justify-center">
              <div className="w-full max-w-sm">
                <div className="grid grid-cols-2 gap-4 p-4">
                  <Link href="/conversations" className="bg-white rounded-xl p-4 flex flex-col items-center shadow-lg" onClick={() => setMobileMenuOpen(false)}>
                    <MessageSquare className="text-blue-700 mb-2 h-10 w-10" />
                    <span className="text-blue-700 font-medium text-lg">Smart Chat</span>
                  </Link>
                  
                  <Link href="/videoChat" className="bg-white rounded-xl p-4 flex flex-col items-center shadow-lg" onClick={() => setMobileMenuOpen(false)}>
                    <Video className="text-blue-700 mb-2 h-10 w-10" />
                    <span className="text-blue-700 font-medium text-lg">Anonymous Video</span>
                  </Link>
                  
                  <Link href="/attendance" className="bg-white rounded-xl p-4 flex flex-col items-center shadow-lg" onClick={() => setMobileMenuOpen(false)}>
                    <Calendar className="text-blue-700 mb-2 h-10 w-10" />
                    <span className="text-blue-700 font-medium text-lg">Attendance</span>
                  </Link>
                  
                  <Link href="/market" className="bg-white rounded-xl p-4 flex flex-col items-center shadow-lg" onClick={() => setMobileMenuOpen(false)}>
                    <ShoppingBag className="text-blue-700 mb-2 h-10 w-10" />
                    <span className="text-blue-700 font-medium text-lg">Marketplace</span>
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
                className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === "featured" ? "bg-blue-700 text-white" : "bg-gray-100 text-slate-600"}`}
                onClick={() => setActiveTab("featured")}
              >
                Featured
              </button>
              <button 
                className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === "services" ? "bg-blue-700 text-white" : "bg-gray-100 text-slate-600"}`}
                onClick={() => setActiveTab("services")}
              >
                Services
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px] bg-white rounded-b-2xl">
              {/* Featured Tab Content */}
              {activeTab === "featured" && (
                <div className="p-4">
                  {/* Hero Card */}
                  <div className="bg-blue-700 text-white rounded-2xl p-6 mb-6 relative overflow-hidden shadow-lg">
                    <div className="relative z-10">
                      <h2 className="text-2xl font-bold mb-2">Welcome to NIT JSR Hub</h2>
                      <p className="mb-4 text-blue-100">Everything you need for campus life in one place</p>
                      <div className="flex">
                        <button className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium shadow-md">
                          Get Started
                        </button>
                      </div>
                    </div>
                    {/* Background pattern */}
                    <div className="absolute right-0 bottom-0 opacity-10">
                      <div className="w-32 h-32 rounded-full border-8 border-white"></div>
                    </div>
                  </div>

                  {/* Attendance Card */}
                  <div className="bg-gray-100 rounded-2xl p-4 mb-6 shadow-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">Your Attendance</h3>
                        <p className="text-slate-600 text-sm mb-2">Were you present today?! : YES</p>
                      </div>
                      <Calendar className="text-blue-600 h-6 w-6" />
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-slate-700 text-sm mb-1">
                        <span>Overall</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: "85%" }}
                        />
                      </div>
                    </div>
                    <Link
                      href="/attendance"
                      className="mt-3 inline-flex items-center text-blue-600 text-sm font-medium"
                    >
                      View details <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>

                  {/* Top Services */}
                  <h3 className="font-bold text-slate-800 text-lg mb-3">Popular Services</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Link href="/conversations" className="bg-white border border-blue-200 rounded-xl p-3 shadow-sm flex flex-col items-center">
                      <MessageSquare className="text-blue-600 mb-2 h-8 w-8" />
                      <span className="text-slate-800 font-medium text-sm">Smart Chat</span>
                    </Link>
                    <Link href="/videoChat" className="bg-gray-600 rounded-xl p-3 shadow-sm flex flex-col items-center">
                      <Video className="text-white mb-2 h-8 w-8" />
                      <span className="text-white font-medium text-sm">Anonymous Video</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Services Tab Content */}
              {activeTab === "services" && (
                <div className="p-4">
                  <div className="mb-6">
                    <h3 className="font-bold text-slate-800 text-lg mb-3">All Services</h3>
                    <div className="space-y-4">
                      {/* Smart Chat */}
                      <Link href="/conversations" className="block">
                        <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm flex items-center">
                          <div className="bg-blue-100 rounded-full p-2 mr-4">
                            <MessageSquare className="text-blue-600 h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800">Smart Chat</h4>
                            <p className="text-sm text-slate-600">AI-powered messaging system</p>
                          </div>
                          <ArrowRight className="text-blue-600 h-4 w-4" />
                        </div>
                      </Link>

                      {/* Anonymous Video */}
                      <Link href="/videoChat" className="block">
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center">
                          <div className="bg-gray-600 rounded-full p-2 mr-4">
                            <Video className="text-white h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800">Anonymous Video</h4>
                            <p className="text-sm text-slate-600">Identity-hidden videoChat calls</p>
                          </div>
                          <ArrowRight className="text-blue-600 h-4 w-4" />
                        </div>
                      </Link>

                      {/* Attendance Tracker */}
                      <Link href="/attendance" className="block">
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center">
                          <div className="bg-blue-100 rounded-full p-2 mr-4">
                            <Calendar className="text-blue-600 h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800">Attendance Tracker</h4>
                            <p className="text-sm text-slate-600">Monitor your class attendance</p>
                          </div>
                          <ArrowRight className="text-blue-600 h-4 w-4" />
                        </div>
                      </Link>

                      {/* Campus Marketplace */}
                      <Link href="/market" className="block">
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center">
                          <div className="bg-blue-100 rounded-full p-2 mr-4">
                            <ShoppingBag className="text-blue-600 h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800">Campus Marketplace</h4>
                            <p className="text-sm text-slate-600">Buy and sell second-hand items</p>
                          </div>
                          <ArrowRight className="text-blue-600 h-4 w-4" />
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Marketplace Categories */}
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-3">Marketplace Categories</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-100 rounded-lg p-3 aspect-square flex flex-col items-center justify-center shadow-sm">
                        <span className="text-slate-700 text-xs font-medium">Laptop</span>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 aspect-square flex flex-col items-center justify-center shadow-sm">
                        <span className="text-slate-700 text-xs font-medium">Books</span>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 aspect-square flex flex-col items-center justify-center shadow-sm">
                        <span className="text-slate-700 text-xs font-medium">Furniture</span>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 aspect-square flex flex-col items-center justify-center shadow-sm">
                        <span className="text-slate-700 text-xs font-medium">Notes</span>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 aspect-square flex flex-col items-center justify-center shadow-sm">
                        <span className="text-slate-700 text-xs font-medium">Electronics</span>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 aspect-square flex flex-col items-center justify-center shadow-sm">
                        <span className="text-slate-700 text-xs font-medium">All Items</span>
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
          <p className="text-slate-700">
            Want to add a feature?{" "}
            <Link href="/suggest" className="text-blue-600 hover:underline">
              Let us know
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

