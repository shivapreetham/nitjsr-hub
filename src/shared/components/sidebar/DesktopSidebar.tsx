'use client';

import { useState } from 'react';
import { User } from '@prisma/client';
import useRoutes from '@/app/hooks/useRoutes';
import DesktopSidebarItem from './DesktopSidebarItem';
import Avatar from '@/shared/components/status&sidebar/Avatar';
import SettingsModal from './SettingsModal';
import { ModeToggle } from '@/shared/components/home&anonymous/ModeToggle';
import { useTheme } from 'next-themes';
import Image from 'next/image';

interface DesktopSidebarProps {
  currentUser: User;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ currentUser }) => {
  const { routes} = useRoutes();
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Organize routes by position
  const topRoutes = routes.filter(route => route.position === 'top');
  const middleRoutes = routes.filter(route => route.position === 'middle');
  const bottomRoutes = routes.filter(route => route.position === 'bottom');

  return (
    <>
      <SettingsModal
        currentUser={currentUser}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
      <div 
        className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-20 lg:overflow-y-auto lg:border-r lg:border-border/30 lg:pb-4 lg:flex lg:flex-col justify-between transition-all duration-300 ease-in-out glass-card"
        style={{ 
          background: isDark 
            ? "linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(20, 30, 50, 0.85) 100%)" 
            : "linear-gradient(180deg, rgba(255, 255, 255, 0.75) 0%, rgba(245, 247, 250, 0.85) 100%)",
          backdropFilter: "blur(12px)",
          boxShadow: isDark 
            ? "0 4px 20px rgba(0, 0, 0, 0.25)" 
            : "0 4px 20px rgba(0, 0, 0, 0.05)"
        }}
      >
        
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
              onClick={() => setIsOpen(true)}
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