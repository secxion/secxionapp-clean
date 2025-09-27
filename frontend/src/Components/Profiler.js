import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { User, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { cn } from '../lib/utils';
import './Profiler.css';

const Profiler = () => {
  const user = useSelector((state) => state.user.user);
  const [isVisible, setIsVisible] = useState(true);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="profiler-container"
          >
            <div className="profile-picture-container">
              {user?.profilePic ? (
                <img
                  src={user.profilePic}
                  alt="Profile"
                  className="profile-picture"
                />
              ) : (
                <div className="default-profile-picture">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <a href="/profile" className="user-name">
              {user?.name}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleVisibility}
        className={cn(
          'fixed top-60 transform -translate-y-1/2',
          isVisible ? 'left-[-5px]' : 'right-[-5px]',
          'z-50',
          'rounded-full',
          'bg-white/20 hover:bg-white/30',
          'text-gray-600 hover:text-white',
          'transition-all duration-300',
          'shadow-lg',
        )}
        aria-label={isVisible ? 'Hide profile' : 'Show profile'}
      >
        {isVisible ? (
          <ChevronLeft className="w-6 h-6" />
        ) : (
          <ChevronRight className="w-6 h-6" />
        )}
      </Button>
    </div>
  );
};

export default Profiler;
