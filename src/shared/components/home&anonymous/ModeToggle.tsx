'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface ModeToggleProps {
  isExpanded?: boolean;
}

export function ModeToggle({ isExpanded }: ModeToggleProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={clsx(
        'flex items-center gap-x-3 rounded-xl text-sm font-medium transition-all duration-300',
        'backdrop-blur-sm glass-card hover-lift',
        isExpanded ? 'p-3 justify-start w-full' : 'p-3 justify-center',
        isDark 
          ? 'bg-accent/20 text-accent-foreground hover:bg-accent/30' 
          : 'bg-accent/20 text-accent-foreground hover:bg-accent/30'
      )}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <>
          <Sun size={20} className="shrink-0 text-yellow-300" aria-hidden="true" />
          {isExpanded && (
            <motion.span 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
              className="whitespace-nowrap font-medium"
            >
              Light Mode
            </motion.span>
          )}
        </>
      ) : (
        <>
          <Moon size={20} className="shrink-0 text-indigo-500" aria-hidden="true" />
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
              className="whitespace-nowrap font-medium"
            >
              Dark Mode
            </motion.span>
          )}
        </>
      )}
    </motion.button>
  );
}