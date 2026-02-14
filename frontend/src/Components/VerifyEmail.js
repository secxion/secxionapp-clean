import React, { useEffect, useState } from 'react';
import SummaryApi from '../common';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { notifyUser } from '../utils/toastConfig';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Mail, ArrowRight } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const status = searchParams.get('status');
  const message = searchParams.get('message');
  const [loading, setLoading] = useState(true);
  const [displayMessage, setDisplayMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`${SummaryApi.verifyEmail.url}?token=${token}`);
        const data = await res.json();

        if (data.success) {
          setDisplayMessage(
            data.message || 'Email verified successfully! You can now log in.',
          );
          setIsSuccess(true);
        } else {
          const fallbackMessage =
            data.message && data.message.toLowerCase().includes('invalid token')
              ? 'This link is invalid or already used.'
              : data.message || 'Invalid or expired token.';
          setDisplayMessage(fallbackMessage);
          setIsError(true);
        }
      } catch (err) {
        setDisplayMessage('Something went wrong verifying your email.');
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };

    if (status) {
      if (status === 'success') {
        setDisplayMessage(
          message || 'Email verified successfully! You can now log in.',
        );
        setIsSuccess(true);
      } else {
        const fallbackMessage =
          message && message.toLowerCase().includes('invalid token')
            ? 'This link is invalid or already used.'
            : message || 'Invalid or expired token.';
        setDisplayMessage(fallbackMessage);
        setIsError(true);
      }
      setLoading(false);
      return;
    }

    if (token) {
      verify();
    } else {
      setDisplayMessage('No verification token provided.');
      setIsError(true);
      setLoading(false);
    }
  }, [token, status, message]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center p-4">
      {/* Subtle background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 40, -20, 0],
            y: [0, 20, -20, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 20, 0],
            y: [0, -20, 20, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Main content */}
      <motion.div
        className="relative max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Card wrapper */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 sm:p-10 shadow-2xl">
          {loading ? (
            // Loading State
            <motion.div
              className="flex flex-col items-center justify-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="mb-6"
              >
                <Mail className="w-16 h-16 text-yellow-400" strokeWidth={1.5} />
              </motion.div>

              <h2 className="text-2xl font-bold text-white text-center mb-3">
                Verifying Email
              </h2>

              <p className="text-slate-300 text-center">
                Please wait while we verify your email address...
              </p>
            </motion.div>
          ) : isSuccess ? (
            // Success State
            <motion.div
              className="flex flex-col items-center justify-center py-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="mb-6"
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-green-500/30 rounded-full blur-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <CheckCircle2
                    className="w-20 h-20 text-green-400 relative"
                    strokeWidth={1.5}
                  />
                </div>
              </motion.div>

              <motion.h2
                className="text-3xl font-bold text-white text-center mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                Email Verified!
              </motion.h2>

              <motion.p
                className="text-slate-300 text-center mb-8 leading-relaxed text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                {displayMessage}
              </motion.p>

              <motion.div
                className="w-full h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-8"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.35, duration: 0.6 }}
              />

              <motion.button
                onClick={() => navigate('/login')}
                className="w-full relative group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-lg blur group-hover:blur-lg transition-all duration-300" />
                <div className="relative px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center gap-2 text-white font-semibold text-lg">
                  Sign In <ArrowRight className="w-5 h-5" />
                </div>
              </motion.button>
            </motion.div>
          ) : (
            // Error State
            <motion.div
              className="flex flex-col items-center justify-center py-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="mb-6"
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-red-500/30 rounded-full blur-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <AlertCircle
                    className="w-20 h-20 text-red-400 relative"
                    strokeWidth={1.5}
                  />
                </div>
              </motion.div>

              <motion.h2
                className="text-3xl font-bold text-white text-center mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                Verification Failed
              </motion.h2>

              <motion.p
                className="text-slate-300 text-center mb-8 leading-relaxed text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                {displayMessage}
              </motion.p>

              <motion.div
                className="w-full h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-8"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.35, duration: 0.6 }}
              />

              <motion.button
                onClick={() => navigate('/login')}
                className="w-full relative group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg blur group-hover:blur-lg transition-all duration-300" />
                <div className="relative px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center gap-2 text-gray-900 font-semibold text-lg">
                  Back to Login <ArrowRight className="w-5 h-5" />
                </div>
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <motion.p
          className="text-center text-slate-500 text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          © 2024 Secxion. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
