"use client";

import React from 'react';

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
    <div 
      className={`flex cursor-pointer flex-col gap-4 rounded-lg p-6 transition-all hover:shadow-md ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50">
          {icon}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {description}
        </p>
      </div>
    </div>
  );
};

export default HomeCard;