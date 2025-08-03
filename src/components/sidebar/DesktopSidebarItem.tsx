'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { IconType } from 'react-icons';

interface DesktopSidebarItemProps {
  href: string;
  label: string;
  icon: IconType;
  active?: boolean;
  onClick?: () => void;
  isPrimary?: boolean;
  isExpanded: boolean;
  compact?: boolean;
}

const DesktopSidebarItem: React.FC<DesktopSidebarItemProps> = ({
  label,
  icon: Icon,
  href,
  active,
  onClick,
  isPrimary,
  compact
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <li onClick={handleClick} title={label} className={clsx("w-full", compact && "list-none")}>
      <Link
        href={href}
        className={clsx(
          'group flex items-center gap-x-3 rounded-xl text-sm font-medium transition-all duration-200 w-full backdrop-blur-sm',
          compact ? 'p-2' : 'p-3 justify-center',
          active ? 'bg-primary text-primary-foreground shadow-md' : 'text-foreground hover:bg-secondary/70',
          isPrimary && !active ? 'bg-accent text-accent-foreground hover:bg-accent/90' : '',
          !active && !isPrimary && 'glass-card'
        )}
      >
        <Icon className={clsx(
          'shrink-0',
          isPrimary || active ? 'h-5 w-5' : 'h-5 w-5',
          href.includes('theme') && !active && !isPrimary && 'text-accent'
        )} aria-hidden="true" />
      </Link>
    </li>
  );
};

export default DesktopSidebarItem;