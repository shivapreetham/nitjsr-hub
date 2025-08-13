'use client';

import useConversation from '@/app/(app)/(chat)/(comp)/hooks/useConversation';
import useRoutes from '@/app/hooks/useRoutes';
import MobileFooterItem from './MobileFooterItem';
import Avatar from '@/components/status&sidebar/Avatar';
import { useState, useEffect } from 'react';
import SettingsModal from './SettingsModal';
import GuideModal from '@/components/ui/guide-modal';
import { User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

interface MobileFooterProps {
  currentUser: User;
}

// Define the RouteItem type based on what useRoutes returns
interface RouteItem {
  label: string;
  href: string;
  icon: any;
  active?: boolean;
  onClick?: () => void;
}

const MobileFooter: React.FC<MobileFooterProps> = ({ currentUser }) => {
  const { routes } = useRoutes(); // Extract routes from the object returned by useRoutes
  const { isOpen } = useConversation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Removed auto-popup behavior - guide modal only opens when user clicks help button

  const handleGuideComplete = () => {
    localStorage.setItem('hasSeenGuide', 'true');
    setIsGuideOpen(false);
  };

  if (isOpen) return null;

  return (
    <>
      <div className="fixed justify-between w-full bottom-0 z-40 flex items-center bg-card/80 backdrop-blur-xl border-t border-border/50 lg:hidden shadow-lg transition-all duration-300">
        {/* Profile Button */}
        <div 
          className="p-3 cursor-pointer"
          onClick={() => setIsSettingsOpen(true)}
        >
          <div className="relative">
            <Avatar user={currentUser} />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-primary rounded-full border-2 border-background" />
          </div>
        </div>
        
        {/* Navigation Items */}
        {routes.map((route: RouteItem) => (
          <MobileFooterItem
            key={route.label}
            href={route.href}
            icon={route.icon}
            active={route.active}
            onClick={route.onClick}
            label={route.label} // Added the missing label prop
          />
        ))}
        
        {/* Help Button */}
        <div className="p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsGuideOpen(true)}
            className="h-6 w-6 p-0 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
        
        
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          currentUser={currentUser}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
      
      {/* Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onComplete={handleGuideComplete}
      />
    </>
  );
};

export default MobileFooter;