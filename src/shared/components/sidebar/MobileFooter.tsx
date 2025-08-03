'use client';

import useConversation from '@/app/(app)/(chat)/(comp)/hooks/useConversation';
import useRoutes from '@/app/hooks/useRoutes';
import MobileFooterItem from './MobileFooterItem';
import Avatar from '@/shared/components/status&sidebar/Avatar';
import { useState } from 'react';
import SettingsModal from './SettingsModal';
import { User } from '@prisma/client';

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

  if (isOpen) return null;

  return (
    <>
      <div className="fixed justify-between w-full bottom-0 z-40 flex items-center bg-background/50 backdrop-blur-sm border-t border-border lg:hidden transition-colors duration-300">
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
        
        
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          currentUser={currentUser}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </>
  );
};

export default MobileFooter;