'use client';

import { useState, useEffect } from 'react';
import { User } from '@prisma/client';
import useRoutes from '@/app/hooks/useRoutes';
import DesktopSidebarItem from './DesktopSidebarItem';
import Avatar from '@/components/status&sidebar/Avatar';
import SettingsModal from './SettingsModal';
import { ModeToggle } from '@/components/home&anonymous/ModeToggle';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import GuideModal from '@/components/ui/guide-modal';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

interface DesktopSidebarProps {
  currentUser: User;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ currentUser }) => {
  const { routes} = useRoutes();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Removed auto-popup behavior - guide modal only opens when user clicks help button

  const handleGuideComplete = () => {
    localStorage.setItem('hasSeenGuide', 'true');
    setIsGuideOpen(false);
  };

  // Organize routes by position
  const topRoutes = routes.filter(route => route.position === 'top');
  const middleRoutes = routes.filter(route => route.position === 'middle');
  const bottomRoutes = routes.filter(route => route.position === 'bottom');

  return (
    <>
      <SettingsModal
        currentUser={currentUser}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onComplete={handleGuideComplete}
      />
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-20 lg:overflow-y-auto lg:pb-4 lg:flex lg:flex-col justify-between transition-all duration-300 ease-in-out glass-sidebar">
        
        <div className="flex items-center justify-center mt-6 mb-8">
          <div className="glass-card text-foreground font-bold text-lg w-10 h-10 flex items-center justify-center rounded-full">
          <Image 
              src="/logo_nit.png" 
              alt="Logo" 
              width={40}  // required
              height={40} // required
              className="w-10 h-10"
            />
          </div>
        </div>

        {/* Navigation sections */}
        <div className="flex flex-col justify-between h-full">
          <nav className="flex flex-col gap-2 px-2">
            {/* Top routes */}
            <ul role="list" className="flex flex-col items-center space-y-2 mb-6">
              {topRoutes.map((route) => (
                <DesktopSidebarItem
                  key={route.label}
                  href={route.href}
                  label={route.label}
                  icon={route.icon}
                  active={route.active}
                  onClick={route.onClick}
                  isPrimary={route.isPrimary}
                  isExpanded={false}
                />
              ))}
            </ul>

            {/* Middle routes - main navigation */}
            <ul role="list" className="flex flex-col items-center space-y-2">
              {middleRoutes.map((route) => (
                <DesktopSidebarItem
                  key={route.label}
                  href={route.href}
                  label={route.label}
                  icon={route.icon}
                  active={route.active}
                  onClick={route.onClick}
                  isExpanded={false}
                />
              ))}
            </ul>
          </nav>

          {/* Bottom section with divider - user controls */}
          <div className="mt-auto flex flex-col pt-4 border-t border-border/30">
            {/* Controls section - Theme toggle & bottom routes */}
            <div className="flex flex-col justify-center items-center mb-4">
              {/* Guide/Help button */}
              <div className="glass-card p-2 rounded-xl m-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsGuideOpen(true)}
                  className="h-6 w-6 p-0 hover:bg-orange-500/10 text-orange-500 hover:text-orange-600"
                  title="Help & Guide"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Theme toggle with consistent styling */}
              <div className="glass-card p-2 rounded-xl m-2">
                <ModeToggle isExpanded={false} />
              </div>
              
              {/* Bottom routes (like logout) with consistent styling */}
              <div className="flex flex-col space-y-2">
                {bottomRoutes.map((route) => (
                  <div key={route.label}>
                    <DesktopSidebarItem
                      href={route.href}
                      label={route.label}
                      icon={route.icon}
                      active={route.active}
                      onClick={route.onClick}
                      isExpanded={false}
                      compact={true}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* User profile - Consistently styled for both states */}
            <div
              onClick={() => setIsSettingsOpen(true)}
              className="cursor-pointer hover:bg-secondary/70 transition rounded-xl p-3 mx-2 mb-4 flex justify-center glass-card"
              title="Edit profile"
            >
              <div className="relative">
                <Avatar user={currentUser} />
                {/* <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-background"></span> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DesktopSidebar;