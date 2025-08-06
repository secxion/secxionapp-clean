import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Send, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Navigation from '../Components/Navigation';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionSuccess(false);
    setSubmissionError('');

    try {
      const response = await fetch(SummaryApi.contactUsMessage.url, {
        method: SummaryApi.contactUsMessage.method || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const responseData = await response.json();

      if (response.ok) {
        setSubmissionSuccess(true);
        setFormData({ name: '', email: '', phoneNumber: '', reason: '' });
        toast.success(responseData.message || 'Thanks for contacting us! We will get back to you ASAP.');
      } else {
        setSubmissionError(responseData.message || 'An error occurred while submitting your message. Please try again later.');
        toast.error(responseData.message || 'Submission failed. Please try again.');
      }
    } catch (error) {
      setSubmissionError('An unexpected error occurred. Please try again.');
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Back button handler
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-100 font-sans relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Navigation currentPage="contact" />

      {/* Animated geometric background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-yellow-700/20 rotate-45 animate-spin [animation-duration:20s]"></div>
        <div className="absolute top-1/4 right-20 w-20 h-20 bg-gradient-to-r from-yellow-900/40 to-yellow-800/40 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-40 h-40 border-4 border-yellow-700/20 rounded-full animate-bounce [animation-duration:3s]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-yellow-700/20 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-yellow-800/30 to-yellow-700/30 transform rotate-12 animate-pulse"></div>
      </div>

      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 mb-6 text-yellow-400 hover:text-yellow-200 font-semibold transition-colors focus:outline-none"
            aria-label="Go back"
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          {/* Header */}
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-2xl mb-6 shadow-lg">
              <Mail className="h-8 w-8 text-yellow-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-yellow-200 mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>

          {/* Contact Info Cards */}
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12" variants={itemVariants}>
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 rounded-2xl shadow-lg p-6 text-center border border-yellow-700/10 hover:shadow-xl transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-800 rounded-xl mb-4">
                <Mail className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="text-lg font-semibold text-yellow-200 mb-2">Email Us</h3>
              <p className="text-gray-300 text-sm mb-3">Send us an email anytime</p>
              <a href="mailto:Secxion@mail.com" className="text-yellow-500 hover:text-yellow-400 font-medium">
                Secxion@mail.com
              </a>
            </div>
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 rounded-2xl shadow-lg p-6 text-center border border-yellow-700/10 hover:shadow-xl transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-800 rounded-xl mb-4">
                <Phone className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="text-lg font-semibold text-yellow-200 mb-2">Support</h3>
              <p className="text-gray-300 text-sm mb-3">24/7 customer support</p>
              <span className="text-yellow-500 font-medium">Available 24/7</span>
            </div>
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 rounded-2xl shadow-lg p-6 text-center border border-yellow-700/10 hover:shadow-xl transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-800 rounded-xl mb-4">
                <CheckCircle className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="text-lg font-semibold text-yellow-200 mb-2">Quick Response</h3>
              <p className="text-gray-300 text-sm mb-3">We aim to reply within 24 hours</p>
              <span className="text-yellow-500 font-medium">Fast & Efficient</span>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 rounded-3xl shadow-xl p-8 md:p-12 border border-yellow-700/20" variants={itemVariants}>
            {submissionSuccess && (
              <motion.div
                className="mb-8 p-6 bg-green-900 border border-green-700 rounded-2xl flex items-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <CheckCircle className="h-6 w-6 text-green-400 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-green-200">Message Sent Successfully!</h3>
                  <p className="text-green-300">Thank you for contacting us. We'll get back to you soon.</p>
                </div>
              </motion.div>
            )}
            {submissionError && (
              <motion.div
                className="mb-8 p-6 bg-red-900 border border-red-700 rounded-2xl flex items-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle className="h-6 w-6 text-red-400 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-red-200">Error Sending Message</h3>
                  <p className="text-red-300">{submissionError}</p>
                </div>
              </motion.div>
            )}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-yellow-200 mb-3">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-4 bg-gray-800 border border-yellow-700 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors duration-200 text-gray-100 placeholder-gray-400"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-yellow-200 mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-4 bg-gray-800 border border-yellow-700 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors duration-200 text-gray-100 placeholder-gray-400"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-semibold text-yellow-200 mb-3">
                  Telegram Number (Optional)
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-gray-800 border border-yellow-700 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors duration-200 text-gray-100 placeholder-gray-400"
                  placeholder="Enter your telegram number"
                />
              </div>
              <div>
                <label htmlFor="reason" className="block text-sm font-semibold text-yellow-200 mb-3">
                  Message
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-4 bg-gray-800 border border-yellow-700 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors duration-200 text-gray-100 placeholder-gray-400 resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>
              <div className="flex justify-center">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-600 to-yellow-800 text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400 mr-3"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-3" />
                      Send Message
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* Additional Info */}
          <motion.div className="mt-12 text-center" variants={itemVariants}>
            <p className="text-gray-400 mb-4">
              Need immediate assistance? We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center text-sm text-gray-400">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                Response time: Within 24 hours
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                Available: Monday - Sunday
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <style jsx>{`
        @keyframes animate-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: animate-scroll 30s linear infinite;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </motion.div>
  );
};

export default ContactUs;