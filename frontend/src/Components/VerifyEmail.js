import React, { useEffect, useState } from 'react';
import SummaryApi from '../common';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { notifyUser } from '../utils/toastConfig';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  Mail,
  Loader,
  ArrowRight,
} from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const status = searchParams.get('status');
  const message = searchParams.get('message');
  const [loading, setLoading] = useState(true);
  const [displayMessage, setDisplayMessage] = useState('');
  const [showLoginCta, setShowLoginCta] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`${SummaryApi.verifyEmail.url}?token=${token}`);
        const data = await res.json();

        if (data.success) {
          notifyUser.success(
            data.message || 'Email verified successfully!',
            'Success',
          );
          setDisplayMessage(
            data.message || 'Email verified successfully! You can now log in.',
          );
          setShowLoginCta(true);
          setIsSuccess(true);
        } else {
          notifyUser.error(
            data.message || 'Invalid or expired token.',
            'Verification Error',
          );
          const fallbackMessage =
            data.message && data.message.toLowerCase().includes('invalid token')
              ? 'This link is invalid or already used. If you already verified, please log in.'
              : data.message ||
                'Invalid or expired token. Please request a new link.';
          setDisplayMessage(fallbackMessage);
          setShowLoginCta(true);
          setIsError(true);
        }
      } catch (err) {
        notifyUser.error('Something went wrong. Please try again.', 'Error');
        setDisplayMessage('Something went wrong. Please try again.');
        setIsError(true);
        setShowLoginCta(true);
      } finally {
        setLoading(false);
      }
    };

    if (status) {
      if (status === 'success') {
        notifyUser.success(
          message || 'Email verified successfully! You can now log in.',
          'Success',
        );
        setDisplayMessage(
          message || 'Email verified successfully! You can now log in.',
        );
        setShowLoginCta(true);
        setIsSuccess(true);
      } else {
        notifyUser.error(
          message || 'Invalid or expired token. Please request a new link.',
          'Verification Error',
        );
        const fallbackMessage =
          message && message.toLowerCase().includes('invalid token')
            ? 'This link is invalid or already used. If you already verified, please log in.'
            : message || 'Invalid or expired token. Please request a new link.';
        setDisplayMessage(fallbackMessage);
        setShowLoginCta(true);
        setIsError(true);
      }
      setLoading(false);
      return;
    }

    if (token) verify();
    else {
      notifyUser.error('No token provided', 'Error');
      setDisplayMessage('No verification token provided.');
      setShowLoginCta(true);
      setIsError(true);
      setLoading(false);
    }
  }, [token, status, message, navigate]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-600/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, -50, 0],
            y: [0, 30, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 50, 0],
            y: [0, -30, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Main container */}
      <motion.div
        className="relative max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-10 shadow-2xl">
          {loading ? (
            // Loading State
            <motion.div
              className="flex flex-col items-center justify-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="mb-6"
              >
                <Mail className="w-16 h-16 text-yellow-400" />
              </motion.div>

              <h2 className="text-2xl font-bold text-white text-center mb-4">
                Verifying Email
              </h2>

              <div className="flex items-center justify-center gap-1">
                <motion.div
                  className="w-2 h-2 bg-yellow-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
                <motion.div
                  className="w-2 h-2 bg-yellow-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-yellow-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>

              <p className="text-gray-300 text-sm mt-4 text-center">
                Please wait while we verify your email address...
              </p>
            </motion.div>
          ) : isSuccess ? (
            // Success State
            <motion.div
              className="flex flex-col items-center justify-center py-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="mb-6"
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-green-400/20 rounded-full blur-lg"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <CheckCircle2 className="w-20 h-20 text-green-400 relative" />
                </div>
              </motion.div>

              <motion.h2
                className="text-3xl font-bold text-white text-center mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                Email Verified!
              </motion.h2>

              <motion.p
                className="text-gray-300 text-center mb-6 leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {displayMessage ||
                  'Your email has been successfully verified. You can now log in to your account.'}
              </motion.p>

              <motion.div
                className="w-full h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full mb-6"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.4, duration: 1 }}
              />

              {showLoginCta && (
                <motion.button
                  onClick={() => navigate('/login')}
                  className="w-full relative group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-xl blur group-hover:blur-[6px] transition-all duration-300" />
                  <div className="relative px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center gap-2 text-white font-semibold">
                    Sign In Now <ArrowRight className="w-5 h-5" />
                  </div>
                </motion.button>
              )}
            </motion.div>
          ) : (
            // Error State
            <motion.div
              className="flex flex-col items-center justify-center py-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="mb-6"
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-red-400/20 rounded-full blur-lg"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <AlertCircle className="w-20 h-20 text-red-400 relative" />
                </div>
              </motion.div>

              <motion.h2
                className="text-3xl font-bold text-white text-center mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                Verification Failed
              </motion.h2>

              <motion.p
                className="text-gray-300 text-center mb-6 leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {displayMessage ||
                  'We could not verify your email. The link may have expired or is invalid.'}
              </motion.p>

              <motion.div
                className="w-full h-1 bg-gradient-to-r from-red-400 to-red-600 rounded-full mb-6"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.4, duration: 1 }}
              />

              <motion.p
                className="text-xs text-gray-400 text-center mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                Please request a new verification link if needed.
              </motion.p>

              {showLoginCta && (
                <motion.button
                  onClick={() => navigate('/login')}
                  className="w-full relative group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl blur group-hover:blur-[6px] transition-all duration-300" />
                  <div className="relative px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center gap-2 text-gray-900 font-semibold">
                    Back to Login <ArrowRight className="w-5 h-5" />
                  </div>
                </motion.button>
              )}
            </motion.div>
          )}
        </div>

        {/* Footer text */}
        <motion.p
          className="text-center text-gray-500 text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          Secxion © 2024. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
