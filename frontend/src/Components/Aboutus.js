import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Zap,
  Heart,
  TrendingUp,
  Users,
  Gift,
  Building,
  Target,
  Calendar,
  Code,
  Coins,
  ArrowLeft,
} from 'lucide-react';
import Navigation from './Navigation';
import { useNavigate } from 'react-router-dom';
import SecxionLogo from '../app/slogo.png';

const AboutUs = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const Section = ({ title, children, icon: Icon }) => (
    <motion.div variants={itemVariants} className="mb-10">
      <div className="flex items-center mb-4">
        {Icon && <Icon className="h-6 w-6 text-yellow-400 mr-3" />}
        <h2 className="text-2xl font-bold text-gray-100">{title}</h2>
      </div>
      <div className="text-gray-300 leading-relaxed space-y-4">{children}</div>
    </motion.div>
  );

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure & Reliable',
      description:
        'Your transactions are protected with bank-level security. We ensure safe and reliable gift card exchanges every time.',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description:
        'Get instant quotes and quick processing. Convert your gift cards to cash or Ethereum in minutes, not hours.',
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: 'Multiple Payment Options',
      description:
        'Choose between traditional cash payments or receive Ethereum directly to your wallet for maximum flexibility.',
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: 'Custom Development',
      description:
        'Need custom digital tools and scripts? We build tailored solutions for your specific needs and tasks.',
    },
  ];

  const stats = [
    {
      number: '10K+',
      label: 'Happy Customers',
      icon: <Users className="w-6 h-6" />,
    },
    {
      number: '50K+',
      label: 'Gift Cards Processed',
      icon: <Gift className="w-6 h-6" />,
    },
    {
      number: '99.9%',
      label: 'Uptime Reliability',
      icon: <Shield className="w-6 h-6" />,
    },
    {
      number: '24/7',
      label: 'Customer Support',
      icon: <Heart className="w-6 h-6" />,
    },
  ];

  const services = [
    {
      icon: <Gift className="w-6 h-6" />,
      title: 'Gift Card Exchange',
      description:
        'Convert your unused gift cards into cash or Ethereum instantly',
    },
    {
      icon: <Coins className="w-6 h-6" />,
      title: 'Digital Asset Trading',
      description:
        'Trade various digital assets with competitive rates and secure transactions',
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'Custom Development',
      description:
        'Bespoke digital tools and scripts tailored to your specific requirements',
    },
  ];

  const navigate = useNavigate();
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-100 font-sans relative overflow-hidden"
      initial={false}
      animate="visible"
      variants={containerVariants}
    >
      <Navigation currentPage="about" />

      {/* Logo background overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Slogo background */}
        <img
          src={SecxionLogo}
          alt="Secxion Logo Background"
          className="absolute left-1/2 top-1/2 w-[600px] h-[600px] max-w-none opacity-10 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"
          style={{
            mixBlendMode: 'screen',
          }}
        />
        {/* Animated geometric background */}
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-yellow-700/30 rotate-45 animate-spin [animation-duration:20s]"></div>
        <div className="absolute top-1/3 right-20 w-20 h-20 bg-gradient-to-r from-yellow-900/40 to-yellow-800/40 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-40 h-40 border-2 border-yellow-700/30 rounded-full animate-bounce [animation-duration:3s]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-yellow-700/20 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-yellow-800/30 to-yellow-700/30 transform rotate-12 animate-pulse"></div>
      </div>

      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-black to-yellow-700 rounded-2xl mb-6 shadow-lg">
              <Building className="h-8 w-8 text-yellow-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-100 mb-4">
              About
              <span className="bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
                {' '}
                Secxion
              </span>
            </h1>
          </motion.div>

          {/* Content */}
          <motion.div
            className="bg-gradient-to-br from-gray-900/80 to-gray-800/70 rounded-3xl shadow-2xl p-8 sm:p-12 relative overflow-hidden border border-yellow-700/20 backdrop-blur-xl"
            variants={itemVariants}
            style={{
              boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Glassmorphism overlay */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background:
                  'linear-gradient(120deg, rgba(40,40,60,0.7) 60%, rgba(250,204,21,0.08) 100%)',
                backdropFilter: 'blur(8px)',
                zIndex: 1,
              }}
            ></div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-800 to-gray-700 rounded-full transform translate-x-16 -translate-y-16 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gray-700 to-gray-600 rounded-full transform -translate-x-12 translate-y-12 opacity-50"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-yellow-700/20 rounded-full"></div>

            <div className="relative z-10">
              <motion.div
                className="text-lg text-gray-300 leading-relaxed mb-8 p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border-l-4 border-yellow-500"
                variants={itemVariants}
              >
                <p className="font-semibold text-gray-200 mb-2">
                  Welcome to Secxion.com!
                </p>
                <p>
                  At Secxion.com, we provide a comprehensive platform for
                  digital asset management and custom development services.
                  Whether you're looking to convert unused gift cards into cash
                  or Ethereum, trade digital assets, or need custom-built
                  digital tools, we're here to serve your needs with reliability
                  and innovation.
                </p>
              </motion.div>

              <Section title="Our Services" icon={Target}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {services.map((service, index) => (
                    <div
                      key={index}
                      className="p-6 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl border border-gray-700 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex justify-center mb-4 text-yellow-500">
                        {service.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-100 mb-2 text-center">
                        {service.title}
                      </h3>
                      <p className="text-sm text-gray-300 text-center">
                        {service.description}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Our Mission" icon={Target}>
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl border border-yellow-500">
                  <p className="text-gray-300">
                    Our mission is to bridge the gap between traditional digital
                    assets and modern cryptocurrency solutions. We provide
                    secure, efficient, and user-friendly services that unlock
                    the hidden value in your digital assets while offering
                    cutting-edge development solutions for businesses and
                    individuals.
                  </p>
                </div>
              </Section>

              <Section title="Payment Options" icon={Coins}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl border border-gray-700">
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <h3 className="text-lg font-semibold text-gray-100">
                        Traditional Payment
                      </h3>
                    </div>
                    <p className="text-gray-300">
                      Receive cash payments through secure online banking,
                      PayPal, or other traditional payment methods.
                    </p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl border border-gray-700">
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <h3 className="text-lg font-semibold text-gray-100">
                        Ethereum Payments
                      </h3>
                    </div>
                    <p className="text-gray-300">
                      Get paid directly in Ethereum (ETH) to your wallet address
                      for modern, decentralized transactions.
                    </p>
                  </div>
                </div>
              </Section>

              <Section title="Why Choose Secxion?" icon={Heart}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors duration-300"
                    >
                      <div className="flex items-center mb-4">
                        <div className="text-yellow-500 mr-4">
                          {feature.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-100">
                          {feature.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Our Numbers" icon={TrendingUp}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className="text-center p-4 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl border border-gray-700"
                    >
                      <div className="flex justify-center mb-3 text-yellow-500">
                        {stat.icon}
                      </div>
                      <div className="text-2xl font-bold text-gray-100 mb-1">
                        {stat.number}
                      </div>
                      <div className="text-sm text-gray-300">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Our Values" icon={Shield}>
                <div className="space-y-3">
                  {[
                    'We believe in transparency and fair pricing for all transactions',
                    'Customer satisfaction is our top priority in everything we do',
                    'We maintain the highest security standards to protect your data and assets',
                    'Our platform is designed to be simple, user-friendly, and accessible to everyone',
                    'We embrace both traditional and innovative payment methods for maximum flexibility',
                  ].map((value, index) => (
                    <div
                      key={index}
                      className="flex items-center p-4 bg-gray-800 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-4"></div>
                      <span className="text-gray-300">{value}</span>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Looking Forward" icon={Target}>
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl border border-yellow-500">
                  <p className="text-gray-300">
                    As Secxion.com continues to evolve, we're expanding our
                    services to include more cryptocurrency options, advanced
                    trading features, and sophisticated custom development
                    solutions. We're constantly innovating to provide better
                    rates, more payment options, and cutting-edge tools that
                    meet the demands of the digital economy. Stay tuned for
                    exciting developments in blockchain integration, AI-powered
                    tools, and expanded digital asset support!
                  </p>
                </div>
              </Section>

              {/* Brand Story Section */}
              <motion.div className="mt-16">
                <h2 className="font-spaceGrotesk text-3xl font-bold text-yellow-200 mb-6 text-center">
                  Secxion Story
                </h2>
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                    <span className="text-gray-300">2022: Secxion founded</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                    <span className="text-gray-300">
                      2023: Launched NFT Genesis Collection
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                    <span className="text-gray-300">
                      2024: 10,000+ users milestone
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.footer
            className="text-center text-gray-500 text-sm mt-12"
            variants={itemVariants}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent w-64"></div>
            </div>
            <p className="text-gray-400">
              © 2025 Secxion.com. All rights reserved.
            </p>
          </motion.footer>
        </div>
      </main>
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
    </motion.div>
  );
};

export default AboutUs;
