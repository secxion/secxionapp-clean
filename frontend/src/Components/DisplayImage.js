import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const DisplayImage = ({ imgUrl, onClose }) => {
  // Add keyboard event handler for ESC key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!imgUrl) {
    return null;
  }

  const viewer = (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      >
        <motion.button
          onClick={onClose}
          className="absolute right-4 top-16 z-10 inline-flex h-11 w-11 min-w-11 max-w-11 items-center justify-center rounded-xl border-2 border-white/20 bg-red-600 p-0 text-white shadow-2xl transition-colors hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/50 sm:right-6"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 0, scale: 0 }}
          transition={{ duration: 0.2 }}
          aria-label="Close full image"
        >
          <FaTimes className="h-5 w-5 shrink-0" />
        </motion.button>

        <div className="relative">
          {/* Image Container */}
          <motion.div
            className="relative max-h-[calc(100dvh-8rem)] max-w-[95vw] overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="flex items-center justify-center p-4">
              <motion.img
                src={imgUrl}
                alt="Full size preview"
                className="max-h-[calc(100dvh-10rem)] max-w-[calc(100vw-3rem)] rounded-lg object-contain shadow-lg"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                loading="lazy"
              />
            </div>

            {/* Image Info Bar */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Image Preview</span>
                </div>
                <div className="text-xs text-gray-300">
                  Click outside or press ESC to close
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Keyboard hint */}
          <motion.div
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm border border-white/20"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <span className="flex items-center space-x-2">
              <kbd className="bg-white/20 px-2 py-1 rounded text-xs">ESC</kbd>
              <span>to close</span>
            </span>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(viewer, document.body);
};

export default DisplayImage;
