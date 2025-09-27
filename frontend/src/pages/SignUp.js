import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import uploadImage from '../helpers/uploadImage';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import signupBackground from './signupbk.png';
import LogoShimmer from '../Components/LogoShimmer';
import Navigation from '../Components/Navigation';
import { ArrowLeft } from 'lucide-react';
import SecxionLogo from '../app/slogo.png';
import NFTBadge from '../Components/NFTBadge';

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [clock, setClock] = useState(new Date());

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
    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log('Current form step state:', step);
  }, [step]);

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
      toast.error('No file selected.');
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
        toast.error(
          'Even after processing, the image is too large. Please choose a different image.',
        );
        setUploading(false);
        return;
      }
      const uploadedImage = await uploadImage(imageToUpload);
      setData((prev) => ({ ...prev, profilePic: uploadedImage.url }));
      toast.success('Your avatar successfully uploaded! 📸');
    } catch (error) {
      console.error('Upload or resize error:', error);
      toast.error('Failed to process or upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const goToStep = (s) => setStep(s);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.name) {
      toast.error('Please enter your name.');
      return setStep(1);
    }
    if (!data.email || !isValidEmail(data.email)) {
      toast.error('Please enter a valid email address.');
      return setStep(2);
    }
    if (data.telegramNumber && !isValidTelegram(data.telegramNumber)) {
      toast.error(
        'Please enter a valid Telegram number (7-15 digits, optional leading +).',
      );
      return setStep(3);
    }
    if (!isValidPassword(data.password)) {
      toast.error('Password must be at least 6 characters long.');
      return setStep(4);
    }
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match.');
      return setStep(4);
    }
    if (!data.profilePic) {
      toast.error('Please upload a profile picture.');
      return setStep(5);
    }
    if (!agreedToTerms) {
      toast.error('You must agree to the terms and conditions to sign up.');
      return setStep(5);
    }
    setLoading(true);
    try {
      const response = await fetch(SummaryApi.signUP.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (response.ok) {
        localStorage.removeItem('signupData');
        toast.success(
          '🎉 Signup successful! Check your email inbox or spam for verification.',
        );
        setTimeout(() => navigate('/login'), 2500);
      } else {
        const backendMessage = responseData.message
          ? String(responseData.message).toLowerCase()
          : '';
        if (
          backendMessage.includes('email already exists') ||
          (backendMessage.includes('user with email') &&
            backendMessage.includes('already exists'))
        ) {
          toast.error(
            'This email is already registered. Please use a different email or log in.',
          );
          setStep(2);
        } else {
          toast.error(
            responseData?.message || 'Signup failed. Please try again.',
          );
        }
      }
    } catch (error) {
      console.error('Network or API error:', error);
      toast.error(
        '🚫 Signup failed due to a network error. Please check your connection and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Back button handler
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
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
      <Navigation currentPage="dashboard" />

      {/* Logo background overlay */}
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
        {/* Existing geometric backgrounds */}
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-yellow-700/20 rotate-45 animate-spin [animation-duration:20s]"></div>
        <div className="absolute top-1/4 right-20 w-20 h-20 bg-gradient-to-r from-yellow-900/40 to-yellow-800/40 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-40 h-40 border-4 border-yellow-700/20 rounded-full animate-bounce [animation-duration:3s]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-yellow-700/20 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-yellow-800/30 to-yellow-700/30 transform rotate-12 animate-pulse"></div>
      </div>

      <div className="absolute inset-0 bg-black/70 z-0"></div>

      <div className="relative z-10 flex items-center justify-center mt-11 grow px-4 py-8">
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/70 bg-opacity-95 w-full max-w-lg p-8 pt-4 py-2 shadow-2xl rounded-2xl backdrop-blur-xl border border-yellow-700/20">
          {/* Back Button */}
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 mb-4 text-yellow-400 hover:text-yellow-200 font-semibold transition-colors focus:outline-none"
            aria-label="Go back"
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
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

          <h2 className="text-xl font-bold mb-6 text-center text-gray-100">
            Sign Up Wizard
          </h2>
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className={`h-2 flex-1 mx-1 rounded-full transition-all ${
                  n <= step ? 'bg-yellow-600' : 'bg-gray-700'
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
                      className="btn-next bg-yellow-600 hover:bg-yellow-700 text-gray-900 font-medium py-2 px-4 rounded transition"
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
                    label="Email"
                    name="email"
                    type="email"
                    value={data.email}
                    onChange={handleOnChange}
                    required
                    placeholder="you@example.com"
                  />
                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="btn-back bg-gray-700 hover:bg-gray-600 text-gray-100 font-medium py-2 px-4 rounded transition"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      className="btn-next bg-yellow-600 hover:bg-yellow-700 text-gray-900 font-medium py-2 px-4 rounded transition"
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
                    label="Telegram Number (Optional)"
                    name="telegramNumber"
                    value={data.telegramNumber}
                    onChange={handleOnChange}
                    placeholder="+1234567890 (optional)"
                  />
                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="btn-back bg-gray-700 hover:bg-gray-600 text-gray-100 font-medium py-2 px-4 rounded transition"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep(4)}
                      className="btn-next bg-yellow-600 hover:bg-yellow-700 text-gray-900 font-medium py-2 px-4 rounded transition"
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
                      className="btn-back bg-gray-700 hover:bg-gray-600 text-gray-100 font-medium py-2 px-4 rounded transition"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep(5)}
                      className="btn-next bg-yellow-600 hover:bg-yellow-700 text-gray-900 font-medium py-2 px-4 rounded transition"
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
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Profile Picture
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadPic}
                        className="flex-1 p-2 border-2 border-yellow-600 bg-gray-800 text-sm rounded
                                   text-gray-100
                                   file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                                   file:text-sm file:font-semibold file:bg-yellow-500 file:text-gray-900
                                   hover:file:bg-yellow-600"
                      />
                      {uploading && (
                        <FaSpinner className="animate-spin text-yellow-500 text-2xl" />
                      )}
                    </div>
                  </div>
                  {data.profilePic && (
                    <div className="flex justify-center my-4">
                      <img
                        src={data.profilePic}
                        alt="Profile Preview"
                        className="h-24 w-24 rounded-full object-cover shadow-lg border-2 border-yellow-500"
                      />
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center px-1 bg-gray-800 border-2 border-yellow-600 rounded focus-within:ring-yellow-500 focus-within:border-yellow-500">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-4 h-4 text-yellow-600 border-gray-700 rounded focus:ring-yellow-500 bg-gray-800 checked:bg-yellow-500"
                      />
                    </div>
                    <label
                      htmlFor="terms"
                      className="text-sm text-gray-300 leading-snug"
                    >
                      I agree to the{' '}
                      <Link
                        to="/terms"
                        className="text-yellow-500 hover:underline"
                      >
                        terms and conditions
                      </Link>
                    </label>
                  </div>
                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={() => goToStep(4)}
                      className="btn-back bg-gray-700 hover:bg-gray-600 text-gray-100 font-medium py-2 px-4 rounded transition"
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
                      className="bg-yellow-600 hover:bg-yellow-700 text-gray-900 text-sm font-medium py-2 px-4 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? 'Signing Up...'
                        : uploading
                          ? 'Uploading...'
                          : 'Sign Up 🚀'}
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
      <style jsx>{`
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
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-300 mb-1"
    >
      {label}
    </label>
    <div className="flex items-center p-2 bg-gray-800 border-2 border-yellow-600 rounded focus-within:ring-yellow-500 focus-within:border-yellow-500">
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full p-2 bg-transparent text-sm rounded focus:ring-0 focus:outline-none text-gray-100 placeholder-gray-400"
      />
    </div>
  </div>
);

const PasswordField = ({ label, name, value, onChange, show, toggle }) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-300 mb-1"
    >
      {label}
    </label>
    <div className="relative flex items-center w-full p-1 rounded-lg border-2 border-yellow-600 bg-gray-800 focus-within:ring-2 focus-within:ring-yellow-500">
      <input
        id={name}
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        required
        className="flex-1 bg-transparent outline-none text-gray-100 placeholder-gray-400"
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-3 text-yellow-500 hover:text-yellow-400"
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
