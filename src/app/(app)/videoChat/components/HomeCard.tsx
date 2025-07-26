"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface HomeCardProps {
  className?: string;
  title: string;
  description: string;
  handleClick?: () => void;
  icon: React.ReactNode;
}

const HomeCard: React.FC<HomeCardProps> = ({ 
  className = "", 
  title, 
  description, 
  handleClick,
  icon
}) => {
  return (
    <motion.div 
      className={`flex cursor-pointer flex-col gap-4 rounded-xl p-6 transition-all ${className}`}
      onClick={handleClick}
      whileHover={{ 
        y: -5, 
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <motion.div 
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 backdrop-filter backdrop-blur-sm shadow-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {icon}
        </motion.div>
        <motion.div 
          className="h-8 w-8 rounded-full bg-white/30 backdrop-filter backdrop-blur-sm"
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <div>
        <motion.h3 
          className="text-base font-medium text-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {title}
        </motion.h3>
        <motion.p 
          className="text-sm text-gray-600 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {description}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default HomeCard;