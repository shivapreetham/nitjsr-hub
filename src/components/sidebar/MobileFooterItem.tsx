'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { IconType } from 'react-icons';

interface MobileFooterItemProps {
  href: string;
  icon: IconType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  isPrimary?: boolean;
}

const MobileFooterItem: React.FC<MobileFooterItemProps> = ({
  icon: Icon,
  href,
  label,
  active,
  onClick,
  isPrimary
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        'group flex flex-col items-center justify-center text-xs gap-1 font-medium p-2 rounded-xl m-1 flex-1',
        'text-muted-foreground hover:text-foreground transition-all duration-200',
        active ? 'bg-primary/20 text-primary shadow-sm' : 'hover:bg-secondary/70 hover-lift',
        isPrimary ? 'bg-accent text-accent-foreground hover:bg-accent/90 hover:text-accent-foreground' : '',
        !active && !isPrimary && 'glass-card'
      )}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span className="text-[10px]">{label}</span>
    </Link>
  );
};

export default MobileFooterItem;