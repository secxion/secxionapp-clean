import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share, Plus } from 'lucide-react';

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Don't show if already installed
    if (standalone) return;

    // Check if dismissed recently (within 7 days)
    const dismissedAt = localStorage.getItem('installPromptDismissed');
    if (dismissedAt) {
      const daysSinceDismissed =
        (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return;
    }

    // Detect iOS
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // For Android/Chrome - capture the install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a short delay for better UX
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // For iOS - show instructions after delay
    if (iOS) {
      setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // Don't render if already installed
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
        >
          <div className="bg-gray-900 border border-yellow-600/30 rounded-2xl p-4 shadow-2xl shadow-black/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-xl flex items-center justify-center">
                  <Download className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    Install Secxion
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Get the app experience
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {isIOS ? (
              // iOS Instructions
              <div className="space-y-3">
                <p className="text-gray-300 text-sm">
                  Install this app on your iPhone:
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span className="bg-gray-800 p-1.5 rounded">
                    <Share className="w-4 h-4 text-blue-400" />
                  </span>
                  <span>
                    Tap <strong className="text-white">Share</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span className="bg-gray-800 p-1.5 rounded">
                    <Plus className="w-4 h-4 text-white" />
                  </span>
                  <span>
                    Then <strong className="text-white">Add to Home Screen</strong>
                  </span>
                </div>
                <button
                  onClick={handleDismiss}
                  className="w-full mt-2 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors"
                >
                  Got it
                </button>
              </div>
            ) : (
              // Android/Chrome Install Button
              <div className="space-y-3">
                <p className="text-gray-300 text-sm">
                  Quick access from your home screen. Works offline!
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleInstall}
                    className="flex-1 py-2.5 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Install App
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
