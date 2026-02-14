import React, { useEffect, useState } from 'react';
import SummaryApi from '../common';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { notifyUser } from '../utils/toastConfig';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const status = searchParams.get('status');
  const message = searchParams.get('message');
  const [loading, setLoading] = useState(true);
  const [displayMessage, setDisplayMessage] = useState('');
  const [showLoginCta, setShowLoginCta] = useState(false);
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
          setTimeout(() => navigate('/login'), 2500);
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
        }
      } catch (err) {
        notifyUser.error('Something went wrong. Please try again.', 'Error');
        setDisplayMessage('Something went wrong. Please try again.');
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
        setTimeout(() => navigate('/login'), 2500);
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
      }
      setLoading(false);
      return;
    }

    if (token) verify();
    else {
      notifyUser.error('No token provided', 'Error');
      setDisplayMessage('No verification token provided.');
      setShowLoginCta(true);
      setLoading(false);
    }
  }, [token, status, message, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      {loading ? (
        <p className="text-lg font-semibold animate-pulse">
          Verifying your email...
        </p>
      ) : (
        <>
          <p className="text-lg font-semibold">
            {displayMessage || 'Verification complete.'}
          </p>
          {showLoginCta && (
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default VerifyEmail;
