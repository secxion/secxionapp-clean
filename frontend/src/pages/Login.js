import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SummaryApi from '../common';
import Context from '../Context';
import loginBackground from './loginbk.png';
import thumbsUpGif from './thumbsup.gif';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Navigation from '../Components/Navigation';

import SecxionLogo from '../app/slogo.png';
import NFTBadge from '../Components/NFTBadge';

const Button = ({
  children,
  className = '',
  variant = 'default',
  style = {},
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg';
  const variantClasses = {
    default:
      'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 hover:from-yellow-600 hover:to-yellow-800 text-gray-900 focus:ring-yellow-500 backdrop-blur-xl',
    ghost:
      'bg-white/10 hover:bg-yellow-700/10 text-yellow-400 border border-yellow-500 focus:ring-yellow-500 backdrop-blur-xl',
    secondary:
      'bg-gray-800 hover:bg-gray-700 text-gray-100 focus:ring-yellow-500 backdrop-blur-xl',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
};

const getBubbleStyle = (bubbleIn, index) =>
  bubbleIn ? { animationDelay: `${index * 0.05}s` } : {};

const Login = () => {
  const [data, setData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { fetchUserDetails } = useContext(Context);
  const navigate = useNavigate();
  const [verificationVisible, setVerificationVisible] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [targetValue, setTargetValue] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [sliderSignature, setSliderSignature] = useState('');
  const [verifying, setVerifying] = useState(false);

  const [bubbleIn, setBubbleIn] = useState(false);
  useEffect(() => {
    setBubbleIn(true);
  }, []);

  useEffect(() => {
    if (verificationVisible) fetchSliderTarget();
  }, [verificationVisible]);

  const fetchSliderTarget = async () => {
    try {
      const res = await fetch(SummaryApi.sliderVerification.url, {
        method: SummaryApi.sliderVerification.method,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch verification challenge.');
      const { target, signature } = await res.json();
      setTargetValue(target);
      setSliderSignature(signature);
      setSliderValue(0);
      setIsVerified(false);
    } catch (error) {
      console.error('Error fetching slider target:', error);
      toast.error('Failed to load verification challenge. Please try again.');
    }
  };

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    setSliderValue(val);
    setIsVerified(Math.abs(val - targetValue) <= 3);
  };

  const handleVerificationComplete = async () => {
    if (!isVerified) {
      toast.error('Please complete the verification challenge.');
      return;
    }
    setVerifying(true);
    setErrorMessage('');

    try {
      const response = await fetch(SummaryApi.signIn.url, {
        method: SummaryApi.signIn.method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          sliderValue,
          targetValue,
          slider: { value: sliderValue, signature: sliderSignature },
        }),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setVerificationVisible(false);
        toast.success(
          <div className="flex items-center gap-2">
            <img src={thumbsUpGif} alt="success" className="w-6 h-6" />
            <span>{result.message || 'Login Successful!'}</span>
          </div>,
        );
        await fetchUserDetails();
        navigate('/home');
      } else {
        setErrorMessage(result.message || 'Login failed. Please try again.');
        toast.error(result.message || 'Verification failed. Please try again.');
        setVerificationVisible(true);
        fetchSliderTarget();
      }
    } catch (error) {
      console.error('Login verification error:', error);
      setErrorMessage(
        'An unexpected error occurred during login. Please try again.',
      );
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setFormSubmitting(false);
      setVerifying(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    setResending(true);
    try {
      const res = await fetch(SummaryApi.resendVEmail.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      const result = await res.json();
      result.success
        ? toast.success(
            'Verification email sent successfully! Please check your inbox.',
          )
        : toast.error(result.message || 'Failed to resend verification email.');
    } catch (error) {
      console.error('Resend email error:', error);
      toast.error('Error resending verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onLoginClick = (e) => {
    e.preventDefault();
    if (!data.email || !data.password) {
      toast.error('Please enter both email and password.');
      return;
    }
    setErrorMessage('');
    setVerificationVisible(true);
    setFormSubmitting(true);
  };

  return (
    <section
      className="login-page min-h-screen flex items-center justify-center relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      <Navigation currentPage="signin" />

      {/* Logo background overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Fix: Use absolute positioning and z-index for logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 w-[500px] h-[500px] flex items-center justify-center">
          <img
            src={SecxionLogo}
            alt="Secxion Logo Background"
            className="w-full h-full object-contain opacity-10 select-none pointer-events-none"
            style={{
              filter: 'blur(2px)',
              mixBlendMode: 'screen',
            }}
          />
        </div>
        {/* ...existing geometric backgrounds... */}
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-yellow-700/20 rotate-45 animate-spin [animation-duration:20s]"></div>
        <div className="absolute top-1/4 right-20 w-20 h-20 bg-gradient-to-r from-yellow-900/40 to-yellow-800/40 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-40 h-40 border-4 border-yellow-700/20 rounded-full animate-bounce [animation-duration:3s]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-yellow-700/20 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-yellow-800/30 to-yellow-700/30 transform rotate-12 animate-pulse"></div>
      </div>

      <div className="absolute inset-0 bg-black/70 z-0"></div>

      <div className="shape-lines relative bg-gradient-to-br from-gray-900/80 to-gray-800/70 bg-opacity-95 p-6 sm:p-8 mt-10 w-full max-w-md rounded-2xl shadow-2xl z-10 backdrop-blur-xl border border-yellow-700/20">
        <div className="flex items-center justify-center mb-4">
          <a href="/" className="relative">
            <div className="flex py-1 flex-col justify-center">
              <div
                className={`relative py-2 sm:mx-auto ${bubbleIn ? 'bubble-pop' : ''}`}
                style={getBubbleStyle(bubbleIn, 4)}
              >
                <div>
                  {/* Replace shimmer logo with Secxion logo */}
                  <img
                    src={SecxionLogo}
                    alt="Secxion Official Logo"
                    className="w-14 h-14 object-contain rounded-2xl"
                    style={{ display: 'block' }}
                  />
                </div>
              </div>
            </div>
          </a>
        </div>

        <div className="text-center mb-6">
          <h1
            className={`text-2xl font-bold text-yellow-400 ${bubbleIn ? 'bubble-pop' : ''}`}
            style={getBubbleStyle(bubbleIn, 6)}
          >
            Welcome Back!
          </h1>
          <p className="text-sm text-gray-300 mt-1">Login to your account</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onLoginClick}>
          <div>
            <label
              htmlFor="email"
              className="block text-yellow-200 font-extrabold mb-1"
            >
              Email
            </label>
            <div className="relative flex items-center w-full rounded-lg border-2 border-yellow-600 bg-gray-800 focus-within:ring-2 focus-within:ring-yellow-500">
              <input
                id="email"
                name="email"
                type="email"
                value={data.email}
                onChange={handleInputChange}
                placeholder="(case sensitive)you@example.com"
                className="w-full p-3 pr-12 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-0"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-yellow-200 font-extrabold mb-1"
            >
              Password
            </label>
            <div className="relative flex items-center w-full p-1 rounded-lg border-2 border-yellow-600 bg-gray-800 focus-within:ring-2 focus-within:ring-yellow-500">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={data.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="flex-1 bg-transparent outline-none text-gray-100 placeholder-gray-400"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={`absolute right-3 top-3 text-yellow-500 hover:text-yellow-400 ${bubbleIn ? 'bubble-pop' : ''}`}
                tabIndex={-1}
                style={getBubbleStyle(bubbleIn, 7)}
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5" />
                ) : (
                  <FaEye className="h-5 w-5" />
                )}
              </button>
            </div>
            <Link
              to="/reset"
              className="block text-right text-sm text-yellow-500 hover:underline mt-1"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={formSubmitting}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
              formSubmitting
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : ''
            } ${bubbleIn ? 'bubble-pop' : ''}`}
            style={getBubbleStyle(bubbleIn, 8)}
          >
            {formSubmitting ? 'Verifying...' : 'Login'}
          </Button>
        </form>

        {errorMessage && (
          <div className="mt-4 text-center text-red-400 text-sm">
            <p>{errorMessage}</p>
            {errorMessage.toLowerCase().includes('verify') && (
              <Button
                onClick={handleResendVerificationEmail}
                disabled={resending}
                variant="ghost"
                className={`mt-2 text-yellow-500 hover:underline font-medium hover:text-yellow-400 ${bubbleIn ? 'bubble-pop' : ''}`}
                style={getBubbleStyle(bubbleIn, 9)}
              >
                {resending ? 'Resending...' : 'Resend Verification Email'}
              </Button>
            )}
          </div>
        )}

        <p className="mt-6 text-center text-gray-300 text-sm">
          Don’t have an account?{' '}
          <Link
            to="/sign-up"
            className="text-yellow-500 hover:underline font-medium hover:text-yellow-400"
          >
            Sign up
          </Link>
        </p>

        <div className="mt-6 text-center text-xs text-gray-500">
          <Link
            to="/contact-us"
            className="hover:text-yellow-400 transition-colors"
          >
            Contact Us
          </Link>
          <span className="mx-2 text-gray-600">|</span>
          <a
            href="https://secxion.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            © {new Date().getFullYear()} secxion.com
          </a>
        </div>
      </div>

      {/* Move NFTBadge to a fixed footer */}
      <footer className="w-full flex justify-center items-center py-4 absolute bottom-0 left-0 z-20 bg-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <NFTBadge />
        </div>
      </footer>

      {/* Verification Modal */}
      {verificationVisible && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/70 p-6 rounded-xl border-2 border-yellow-700 shadow-lg w-full max-w-sm text-gray-100 backdrop-blur-xl">
            <h2 className="text-lg font-bold mb-2 text-center text-yellow-200">
              Human Verification
            </h2>
            <div className="text-sm text-gray-300 mb-4 text-center space-y-3">
              Slide to match{' '}
              <span className="font-semibold text-yellow-500 px-1 border-2 border-yellow-700 rounded-md">
                {targetValue}
              </span>
              <div className="text-center text-sm mb-3">
                <span className="text-gray-400">Current: </span>
                <span className="font-bold text-yellow-400 px-1">
                  {sliderValue}
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={handleSliderChange}
              className="w-full h-2 accent-yellow-500 mb-4 cursor-pointer"
            />
            <Button
              onClick={handleVerificationComplete}
              disabled={!isVerified || verifying}
              className={`w-full py-2 rounded-md font-semibold transition shadow-md hover:shadow-lg ${
                isVerified ? '' : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              } ${bubbleIn ? 'bubble-pop' : ''}`}
              style={getBubbleStyle(bubbleIn, 10)}
            >
              {verifying ? 'Logging in...' : 'Verify & Login'}
            </Button>
            <Button
              onClick={() => {
                setVerificationVisible(false);
                setFormSubmitting(false);
              }}
              variant="secondary"
              className={`mt-3 w-full text-sm text-gray-400 hover:text-yellow-500 ${bubbleIn ? 'bubble-pop' : ''}`}
              style={getBubbleStyle(bubbleIn, 11)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Login;
