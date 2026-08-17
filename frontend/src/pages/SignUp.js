import React, { useState, useEffect } from 'react';
import {
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaEnvelope,
  FaInbox,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import uploadImage from '../helpers/uploadImage';
import SummaryApi from '../common';
import { notifyUser } from '../utils/toastConfig';
import { motion, AnimatePresence } from 'framer-motion';
import signupBackground from './signupbk.png';
import Navigation from '../Components/Navigation';
import SecxionLogo from '../Assets/optimized/secxion-logo-112.png';
import NFTBadge from '../Components/NFTBadge';
import { toUserSafeMessage } from '../utils/userSafeMessage';
import BackButton from '../Components/BackButton';

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [csrfToken, setCsrfToken] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('signupData');
    return saved
      ? JSON.parse(saved)
      : {
          email: '',
          password: '',
          name: '',
          confirmPassword: '',
          profilePic: '',
          tag: '',
          telegramNumber: '',
        };
  });

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('signupData', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    fetchCsrfToken();
    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchCsrfToken = async () => {
    try {
      const response = await fetch(`${SummaryApi.baseURL}/api/csrf-token`, {
        method: 'GET',
        credentials: 'include',
      });
      const result = await response.json();
      if (result.success && result.csrfToken) {
        setCsrfToken(result.csrfToken);
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password) => password.length >= 6;
  const isValidTelegram = (number) => /^(\+?\d{7,15})$/.test(number);

  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob.size > 2 * 1024 * 1024) {
                canvas.toBlob(
                  (smallerBlob) => {
                    resolve(smallerBlob);
                  },
                  'image/jpeg',
                  0.7,
                );
              } else {
                resolve(blob);
              }
            },
            'image/jpeg',
            0.9,
          );
        };
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleUploadPic = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      notifyUser.error('No file selected.', 'Upload Error');
      return;
    }
    setUploading(true);
    try {
      let imageToUpload = file;
      if (file.size > 1 * 1024 * 1024) {
        const resizedBlob = await resizeImage(file);
        imageToUpload = new File([resizedBlob], file.name, {
          type: resizedBlob.type,
          lastModified: Date.now(),
        });
      }
      if (imageToUpload.size > 2 * 1024 * 1024) {
        notifyUser.error(
          'Even after processing, the image is too large. Please choose a different image.',
          'Upload Error',
        );
        setUploading(false);
        return;
      }
      const uploadedImage = await uploadImage(imageToUpload);
      setData((prev) => ({ ...prev, profilePic: uploadedImage.url }));
      notifyUser.success(
        'Your avatar successfully uploaded! 📸',
        'Upload Success',
      );
    } catch (error) {
      console.error('Upload or resize error:', error);
      notifyUser.error(
        'Failed to process or upload image. Please try again.',
        'Upload Error',
      );
    } finally {
      setUploading(false);
    }
  };

  const goToStep = (s) => setStep(s);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.name) {
      notifyUser.error('Please enter your name.', 'Validation Error');
      return setStep(1);
    }
    if (!data.email || !isValidEmail(data.email)) {
      notifyUser.error(
        'Please enter a valid email address.',
        'Validation Error',
      );
      return setStep(2);
    }
    if (data.telegramNumber && !isValidTelegram(data.telegramNumber)) {
      notifyUser.error(
        'Please enter a valid Telegram number (7-15 digits, optional leading +).',
        'Validation Error',
      );
      return setStep(3);
    }
    if (!isValidPassword(data.password)) {
      notifyUser.error(
        'Password must be at least 6 characters long.',
        'Validation Error',
      );
      return setStep(4);
    }
    if (data.password !== data.confirmPassword) {
      notifyUser.error('Passwords do not match.', 'Validation Error');
      return setStep(4);
    }
    if (!data.profilePic) {
      notifyUser.error('Please upload a profile picture.', 'Validation Error');
      return setStep(5);
    }
    if (!agreedToTerms) {
      notifyUser.error(
        'You must agree to the terms and conditions to sign up.',
        'Validation Error',
      );
      return setStep(5);
    }
    setLoading(true);
    try {
      const response = await fetch(SummaryApi.signUP.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (response.ok) {
        localStorage.removeItem('signupData');
        setShowEmailModal(true);
      } else {
        const backendMessage = responseData.message
          ? String(responseData.message).toLowerCase()
          : '';

        // Check if email already exists
        if (response.status === 409 && backendMessage.includes('email')) {
          notifyUser.error(
            'This email is already registered. Please use a different email or log in.',
            'Registration Error',
          );
          setStep(2);
        } else if (
          response.status === 409 &&
          (backendMessage.includes('display name') ||
            backendMessage.includes('name'))
        ) {
          // Check if display name already exists
          notifyUser.error(
            responseData?.message ||
              'This display name is already taken. Please choose a different one.',
            'Registration Error',
          );
          setStep(1);
        } else {
          // Generic error handling
          notifyUser.error(
            toUserSafeMessage(
              responseData?.message,
              'Signup failed. Please try again.',
            ),
            'Registration Error',
          );
        }
      }
    } catch (error) {
      console.error('Network or API error:', error);
      notifyUser.error(
        toUserSafeMessage(
          error?.message,
          'Signup failed due to a network error. Please check your connection and try again.',
        ),
        'Network Error',
      );
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <section
      className="inset-0 min-h-screen flex flex-col justify-between z-50 bg-cover bg-center"
      style={{ backgroundImage: `url(${signupBackground})` }}
    >
      {/* Email Verification Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full border border-green-500/30 shadow-2xl"
            >
              {/* Success Icon */}
              <div className="flex justify-center mb-4">
                <div className="bg-green-500/20 p-4 rounded-full">
                  <FaEnvelope className="text-green-400 text-4xl" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-center text-green-400 mb-2">
                🎉 Signup Successful!
              </h2>

              {/* Message */}
              <p className="text-gray-300 text-center mb-6">
                We've sent a verification link to{' '}
                <span className="text-yellow-400 font-medium">
                  {data.email}
                </span>
              </p>

              {/* Instructions */}
              <div className="bg-gray-800/50 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex items-start space-x-3">
                  <FaInbox className="text-blue-400 text-lg mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">
                    Check your{' '}
                    <span className="text-white font-medium">Inbox</span> for
                    the verification email
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <FaExclamationTriangle className="text-yellow-400 text-lg mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">
                    If not found, check your{' '}
                    <span className="text-yellow-400 font-medium">Spam</span> or{' '}
                    <span className="text-yellow-400 font-medium">Junk</span>{' '}
                    folder
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
              >
                Go to Login
              </button>

              <p className="text-gray-500 text-xs text-center mt-4">
                Didn't receive the email? Check spam or try signing up again.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navigation currentPage="dashboard" />

      {/* Static background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
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
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-yellow-700/10 rotate-45"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-yellow-800/10 to-yellow-700/10 transform rotate-12"></div>
      </div>

      <div className="absolute inset-0 bg-black/70 z-0"></div>

      <div className="relative z-10 flex items-center justify-center mt-11 grow px-4 py-8">
        <div className="w-full max-w-lg p-8 sm:p-10 shadow-2xl rounded-3xl border border-white/5 bg-black/40 backdrop-blur-2xl">
          {/* Back Button */}
          <BackButton
            fallbackTo="/"
            className="mb-8"
            label="Back"
            ariaLabel="Go back"
          />
          <div className="flex items-center justify-center mb-4">
            <a href="/" className="relative">
              <div className="flex py-1 flex-col justify-center">
                <div className="relative py-2 sm:mx-auto">
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

          <h2 className="text-xl font-bold font-spaceGrotesk mb-6 text-center text-white tracking-wider uppercase">
            Register
          </h2>
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className={`h-1.5 flex-1 mx-1 rounded-full transition-all duration-500 ${
                  n <= step
                    ? 'bg-brand-gold shadow-[0_0_10px_#D4AF37]'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="overflow-hidden">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4"
                >
                  <InputField
                    label="Display Name"
                    name="name"
                    value={data.name}
                    onChange={handleOnChange}
                    required
                    placeholder="Your unique username or display name"
                  />
                  <InputField
                    label="Tag (Optional)"
                    name="tag"
                    value={data.tag}
                    onChange={handleOnChange}
                    placeholder="e.g., ProTrader, CryptoEnthusiast"
                  />
                  <div className="flex justify-between mt-6">
                    <div />
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="btn-next bg-brand-gold hover:bg-brand-gold-dark text-brand-dark-base font-black font-spaceGrotesk py-3 px-8 rounded-xl transition shadow-lg active:scale-95 text-xs uppercase tracking-widest"
                    >
                      Next →
                    </button>
                  </div>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4"
                >
                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={data.email}
                    onChange={handleOnChange}
                    required
                    placeholder="example@mail.com"
                  />
                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="btn-back bg-white/5 hover:bg-white/10 text-gray-500 border border-white/10 font-black font-spaceGrotesk py-3 px-8 rounded-xl transition active:scale-95 text-xs uppercase tracking-widest"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      className="btn-next bg-brand-gold hover:bg-brand-gold-dark text-brand-dark-base font-black font-spaceGrotesk py-3 px-8 rounded-xl transition shadow-lg active:scale-95 text-xs uppercase tracking-widest"
                    >
                      Next →
                    </button>
                  </div>
                </motion.div>
              )}
              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4"
                >
                  <InputField
                    label="Telegram (Optional)"
                    name="telegramNumber"
                    value={data.telegramNumber}
                    onChange={handleOnChange}
                    placeholder="+1XXXXXXXXXX"
                  />
                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="btn-back bg-white/5 hover:bg-white/10 text-gray-500 border border-white/10 font-black font-spaceGrotesk py-3 px-8 rounded-xl transition active:scale-95 text-xs uppercase tracking-widest"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep(4)}
                      className="btn-next bg-brand-gold hover:bg-brand-gold-dark text-brand-dark-base font-black font-spaceGrotesk py-3 px-8 rounded-xl transition shadow-lg active:scale-95 text-xs uppercase tracking-widest"
                    >
                      Next →
                    </button>
                  </div>
                </motion.div>
              )}
              {step === 4 && (
                <motion.div
                  key="step4"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4"
                >
                  <PasswordField
                    label="Password"
                    name="password"
                    value={data.password}
                    onChange={handleOnChange}
                    show={showPassword}
                    toggle={() => setShowPassword((prev) => !prev)}
                  />
                  <PasswordField
                    label="Confirm Password"
                    name="confirmPassword"
                    value={data.confirmPassword}
                    onChange={handleOnChange}
                    show={showConfirmPassword}
                    toggle={() => setShowConfirmPassword((prev) => !prev)}
                  />
                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      className="btn-back bg-white/5 hover:bg-white/10 text-gray-500 border border-white/10 font-black font-spaceGrotesk py-3 px-8 rounded-xl transition active:scale-95 text-xs uppercase tracking-widest"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep(5)}
                      className="btn-next bg-brand-gold hover:bg-brand-gold-dark text-brand-dark-base font-black font-spaceGrotesk py-3 px-8 rounded-xl transition shadow-lg active:scale-95 text-xs uppercase tracking-widest"
                    >
                      Next →
                    </button>
                  </div>
                </motion.div>
              )}
              {step === 5 && (
                <motion.div
                  key="step5"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[10px] font-black font-spaceGrotesk text-brand-gold uppercase tracking-[0.2em] mb-4">
                      Profile Photo
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadPic}
                        className="flex-1 p-3 border border-white/10 bg-black/20 text-xs rounded-xl
                                   text-gray-100
                                   file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                                   file:text-[10px] file:font-black file:bg-brand-gold file:text-brand-dark-base
                                   file:uppercase file:tracking-widest
                                   hover:file:bg-brand-gold-light transition-all"
                      />
                      {uploading && (
                        <FaSpinner className="animate-spin text-brand-gold text-xl" />
                      )}
                    </div>
                  </div>
                  {data.profilePic && (
                    <div className="flex justify-center my-6">
                      <div className="p-1 rounded-full bg-brand-gold/20 border border-brand-gold/30">
                        <img
                          src={data.profilePic}
                          alt="Profile Preview"
                          className="h-24 w-24 rounded-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/5 mt-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-5 h-5 text-brand-gold border-white/10 rounded-lg focus:ring-brand-gold bg-black/20 checked:bg-brand-gold transition-all"
                      />
                    </div>
                    <label
                      htmlFor="terms"
                      className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-widest"
                    >
                      I agree to the{' '}
                      <Link
                        to="/terms"
                        className="text-brand-gold hover:text-white transition-colors underline underline-offset-4"
                      >
                        Terms of Service
                      </Link>
                    </label>
                  </div>
                  <div className="flex justify-between mt-10">
                    <button
                      type="button"
                      onClick={() => goToStep(4)}
                      className="btn-back bg-white/5 hover:bg-white/10 text-gray-500 border border-white/10 font-black font-spaceGrotesk py-3 px-8 rounded-xl transition active:scale-95 text-xs uppercase tracking-widest"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={
                        loading ||
                        uploading ||
                        !data.profilePic ||
                        !agreedToTerms
                      }
                      className="bg-brand-gold hover:bg-brand-gold-dark text-brand-dark-base font-black font-spaceGrotesk py-3 px-10 rounded-xl transition shadow-brand-gold disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 text-xs uppercase tracking-[0.2em]"
                    >
                      {loading
                        ? 'PROCESSING...'
                        : uploading
                          ? 'UPLOADING...'
                          : 'Complete Signup'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-yellow-500 hover:underline font-medium"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Feature NFTBadge above footer */}
      <div className="flex justify-center mt-6">
        <NFTBadge />
      </div>

      <footer className="relative z-10 mt-2 text-center text-xs text-gray-400 p-3 bg-black/50 backdrop-blur-sm shadow-inner sm:shadow-none">
        Contact Us | © {new Date().getFullYear()} secxion.com
        <br />
        {clock.toLocaleDateString()} {clock.toLocaleTimeString()}
      </footer>
      <style>{`
        @keyframes animate-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: animate-scroll 30s linear infinite;
        }
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </section>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
}) => (
  <div className="group">
    <label
      htmlFor={name}
      className="block text-xs font-bold font-spaceGrotesk text-brand-gold uppercase tracking-widest mb-2 transition-colors group-focus-within:text-white"
    >
      {label}
    </label>
    <div className="flex items-center bg-black/20 border border-white/10 rounded-xl focus-within:border-brand-gold/50 transition-all duration-300">
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full p-4 bg-transparent text-sm rounded-xl focus:ring-0 focus:outline-none text-gray-100 placeholder-gray-500"
      />
    </div>
  </div>
);

const PasswordField = ({ label, name, value, onChange, show, toggle }) => (
  <div className="group">
    <label
      htmlFor={name}
      className="block text-xs font-bold font-spaceGrotesk text-brand-gold uppercase tracking-widest mb-2 transition-colors group-focus-within:text-white"
    >
      {label}
    </label>
    <div className="relative flex items-center w-full bg-black/20 border border-white/10 rounded-xl focus-within:border-brand-gold/50 transition-all duration-300">
      <input
        id={name}
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={`Enter security code`}
        required
        className="flex-1 p-4 bg-transparent outline-none text-gray-100 placeholder-gray-500 text-sm rounded-xl"
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-4 text-gray-500 hover:text-brand-gold transition-colors"
      >
        {show ? (
          <FaEyeSlash className="h-5 w-5" />
        ) : (
          <FaEye className="h-5 w-5" />
        )}
      </button>
    </div>
  </div>
);

export default SignUp;
