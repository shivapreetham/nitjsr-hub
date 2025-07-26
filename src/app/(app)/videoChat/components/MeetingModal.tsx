"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  handleClick: () => void;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  buttonClassName?: string;
  className?: string;
  icon?: React.ReactNode;
}

const MeetingModal: React.FC<MeetingModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  handleClick,
  buttonText = "Confirm",
  buttonIcon,
  buttonClassName = "",
  className = "",
  icon,
}) => {
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { 
        duration: 0.2 
      } 
    }
  };
  
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          onClick={onClose}
        >
          <motion.div
            className={clsx("rounded-2xl p-6 shadow-2xl", className)}
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
              <motion.button 
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="h-8 w-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <i className="fa-solid fa-times"></i>
              </motion.button>
            </div>
            
            {icon && (
              <motion.div 
                className="mb-4 flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                {icon}
              </motion.div>
            )}
            
            <div>{children}</div>
            
            <motion.button
              onClick={handleClick}
              className={clsx(
                "mt-6 w-full py-3 rounded-xl font-medium flex items-center justify-center shadow-md",
                buttonClassName || "bg-blue-500 text-white"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {buttonIcon && <span className="mr-2">{buttonIcon}</span>}
              {buttonText}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MeetingModal;