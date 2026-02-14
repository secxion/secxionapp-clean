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
          setTimeout(() => navigate('/login'), 2500);
        } else {
          notifyUser.error(
            data.message || 'Invalid or expired token.',
            'Verification Error',
          );
        }
      } catch (err) {
        notifyUser.error('Something went wrong. Please try again.', 'Error');
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
        setTimeout(() => navigate('/login'), 2500);
      } else {
        notifyUser.error(
          message || 'Invalid or expired token. Please request a new link.',
          'Verification Error',
        );
      }
      setLoading(false);
      return;
    }

    if (token) verify();
    else {
      notifyUser.error('No token provided', 'Error');
      setLoading(false);
    }
  }, [token, status, message, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading ? (
        <p className="text-lg font-semibold animate-pulse">
          Verifying your email...
        </p>
      ) : (
        <p className="text-lg font-semibold">Redirecting...</p>
      )}
    </div>
  );
};

export default VerifyEmail;
