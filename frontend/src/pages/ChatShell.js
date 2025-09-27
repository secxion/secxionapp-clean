import React, { useState } from 'react';

import ChatInterface from '../Components/ChatInterface';
import SecxionLogo from '../app/slogo.png';
import LoginFlow from '../chatFlows/LoginFlow';
import SignupFlow from '../chatFlows/SignupFlow';
import NFTBadge from '../Components/NFTBadge';
import { SiEthereum } from 'react-icons/si';
import {
  ShieldCheck,
  Zap,
  Globe,
  Headphones,
  Gift,
  Wrench,
  Shapes,
  Smartphone,
  Code,
  CheckCircle,
} from 'lucide-react';
import { FaEthereum } from 'react-icons/fa';
// ...existing code...

// Only public options for unauthenticated users
const publicOptions = [
  { key: 'login', label: '🔐 Login' },
  { key: 'signup', label: '📝 Sign Up' },
  { key: 'about', label: 'About' },
  { key: 'terms', label: 'Terms' },
  { key: 'privacy', label: 'Privacy' },
  { key: 'contact', label: 'Contact' },
];

// Each section of the landing page as a chat message/component
function LandingHero() {
  return (
    <div className="flex flex-col items-center text-center py-6">
      <img
        src={SecxionLogo}
        alt="Secxion Logo"
        className="w-16 h-16 object-contain rounded-2xl mb-2"
      />
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-600 bg-clip-text text-transparent mb-2 tracking-tight">
        Welcome to Secxion
      </h1>
      <p className="text-base text-gray-700 mb-2 max-w-xs">
        Instantly sell your unused gift cards and digital assets for Ethereum or
        cash.
        <br />
        Need custom digital tools? We build them live for you.
      </p>
      <div className="flex flex-wrap gap-2 justify-center mb-2">
        <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold mr-2 mb-1">
          <span className="mr-1">🛡️</span>Bank-Grade Security
        </span>
        <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold mr-2 mb-1">
          <span className="mr-1">⚡</span>Instant Transactions
        </span>
        <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold mb-1">
          <span className="mr-1">⭐</span>24/7 Support
        </span>
      </div>
    </div>
  );
}

function NFTShowcaseChat() {
  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-950/90 rounded-3xl shadow-2xl border border-yellow-700/30 p-6 mb-4">
      <div className="relative w-24 h-24 mb-2">
        <img
          src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80"
          alt="NFT Preview"
          className="rounded-2xl border-4 border-yellow-500 shadow-lg object-cover w-full h-full"
        />
        <div className="absolute bottom-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-700 text-gray-900 px-2 py-1 rounded-lg text-xs font-bold shadow">
          Featured NFT
        </div>
      </div>
      <h3 className="text-xl font-extrabold text-yellow-200 mb-1 drop-shadow-lg tracking-wide">
        Secxion Genesis NFT
      </h3>
      <p className="text-gray-300 text-center mb-2 text-sm">
        Unlock exclusive rewards and access by trading or holding our Genesis
        NFT. Powered by Ethereum.
      </p>
      <button
        className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-gray-900 shadow-xl px-4 py-2 rounded-xl font-semibold mt-1 flex items-center"
        disabled
      >
        <FaEthereum className="mr-2" /> View NFT Collection (Coming Soon)
      </button>
    </div>
  );
}

function ServicesChat() {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 mb-4">
      <h2 className="text-lg font-bold text-yellow-200 mb-2">
        Our Core Services
      </h2>
      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-center gap-3 bg-gray-900/80 rounded-xl p-3 border border-yellow-700/20">
          <Gift className="h-8 w-8 text-yellow-500" />
          <div>
            <div className="font-semibold text-yellow-100">
              Gift Card Exchange
            </div>
            <div className="text-gray-300 text-xs">
              Sell your unused gift cards for Ethereum or cash. 50+ brands
              supported.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gray-900/80 rounded-xl p-3 border border-yellow-700/20">
          <SiEthereum className="h-8 w-8 text-black" />
          <div>
            <div className="font-semibold text-yellow-100">
              Ethereum Trading
            </div>
            <div className="text-gray-300 text-xs">
              Buy, sell, and store Ethereum. Real-time rates, instant
              transactions.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gray-900/80 rounded-xl p-3 border border-yellow-700/20">
          <Smartphone className="h-8 w-8 text-gray-400" />
          <div>
            <div className="font-semibold text-yellow-100">
              Bank Transfer Payments
            </div>
            <div className="text-gray-300 text-xs">
              Receive payments directly to your bank account, instant credit, no
              limits.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gray-900/80 rounded-xl p-3 border border-yellow-700/20">
          <Code className="h-8 w-8 text-yellow-500" />
          <div>
            <div className="font-semibold text-yellow-100">
              Custom Development
            </div>
            <div className="text-gray-300 text-xs">
              Custom software solutions built live for your needs. 100%
              ownership.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gray-900/80 rounded-xl p-3 border border-yellow-700/20">
          <Wrench className="h-8 w-8 text-yellow-500" />
          <div>
            <div className="font-semibold text-yellow-100">
              Open Source Tools
            </div>
            <div className="text-gray-300 text-xs">
              Access and customize powerful open-source tools for your needs.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturesChat() {
  return (
    <div className="bg-gray-950 rounded-2xl p-4 mb-4">
      <h2 className="text-lg font-bold text-yellow-200 mb-2">
        Why Choose Secxion?
      </h2>
      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-yellow-500" />
          <div>
            <div className="font-semibold text-yellow-100">
              Bank-Level Security
            </div>
            <div className="text-gray-300 text-xs">
              Multi-layer encryption, cold storage, real-time fraud monitoring.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-yellow-500" />
          <div>
            <div className="font-semibold text-yellow-100">
              Lightning-Fast Processing
            </div>
            <div className="text-gray-300 text-xs">
              Complete transactions in minutes, instant payouts.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Globe className="h-6 w-6 text-yellow-500" />
          <div>
            <div className="font-semibold text-yellow-100">
              Global Accessibility
            </div>
            <div className="text-gray-300 text-xs">
              Access from anywhere, multiple currencies and payment methods.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Headphones className="h-6 w-6 text-yellow-500" />
          <div>
            <div className="font-semibold text-yellow-100">
              24/7 Expert Support
            </div>
            <div className="text-gray-300 text-xs">
              Dedicated support team always available for you.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-yellow-500" />
          <div>
            <div className="font-semibold text-yellow-100">
              Transparent Pricing
            </div>
            <div className="text-gray-300 text-xs">
              No hidden fees, transparent pricing structure.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Shapes className="h-6 w-6 text-yellow-500" />
          <div>
            <div className="font-semibold text-yellow-100">
              Flexible Solutions
            </div>
            <div className="text-gray-300 text-xs">
              From gift card exchanges to custom tools, we adapt to your needs.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestimonialChat() {
  return (
    <div className="max-w-xl mx-auto bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl shadow-xl border border-yellow-700/20 p-4 mb-4">
      <div className="flex items-center mb-2">
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="Alex M."
          className="w-8 h-8 rounded-full border-2 border-yellow-500 mr-2 shadow"
        />
        <span className="font-bold text-yellow-200">Alex M.</span>
        <span className="ml-auto text-xs text-gray-400">Just now</span>
      </div>
      <div className="flex items-center mb-1">
        <span className="px-2 py-1 bg-yellow-700/20 text-yellow-400 rounded font-mono text-xs mr-2">
          Gift Card Sale
        </span>
        <span className="text-xs text-gray-400">#1 of 1200 live</span>
      </div>
      <p className="text-gray-200 text-base italic mb-1">
        "Secxion made selling my gift cards effortless. The custom tools are a
        game changer!"
      </p>
    </div>
  );
}

function FooterChat() {
  return (
    <div className="bg-gray-950 text-gray-400 rounded-2xl p-4 mt-2 text-center text-xs">
      <div className="flex justify-center mb-2">
        <NFTBadge />
      </div>
      <div className="mb-1">
        <span className="text-yellow-500 font-semibold">Secxion</span> ©{' '}
        {new Date().getFullYear()} | Built with ❤️ by{' '}
        <a
          href="https://bmxii.org"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-yellow-400 hover:underline"
        >
          bmxii.org
        </a>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-1">
        <a href="/about-us" className="hover:text-yellow-400">
          About Us
        </a>
        <a href="/terms" className="hover:text-yellow-400">
          Terms
        </a>
        <a href="/privacy" className="hover:text-yellow-400">
          Privacy
        </a>
        <a href="/contact-us" className="hover:text-yellow-400">
          Contact
        </a>
      </div>
    </div>
  );
}

const ChatShell = () => {
  const [activeFlow, setActiveFlow] = useState(null);
  // Compose the landing as a chat flow
  const landingChat = [
    { type: 'component', from: 'bot', component: <LandingHero /> },
    { type: 'component', from: 'bot', component: <NFTShowcaseChat /> },
    { type: 'component', from: 'bot', component: <ServicesChat /> },
    { type: 'component', from: 'bot', component: <FeaturesChat /> },
    { type: 'component', from: 'bot', component: <TestimonialChat /> },
    { type: 'component', from: 'bot', component: <FooterChat /> },
    {
      type: 'options',
      from: 'bot',
      options: publicOptions.map((opt) => ({
        label: opt.label,
        onClick: () => handleMainInput(opt.label),
      })),
    },
    { type: 'text', from: 'bot', text: 'Select an option above to continue.' },
  ];

  const [chatMessages, setChatMessages] = useState(landingChat);

  function handleMainInput(input) {
    const selected = publicOptions.find((opt) => opt.label === input);
    if (!selected) return;
    setChatMessages((msgs) => [
      ...msgs,
      { type: 'text', from: 'user', text: input },
    ]);
    if (selected.key === 'login') {
      window.location.href = '/login';
    } else if (selected.key === 'signup') {
      setActiveFlow('signup');
    } else if (selected.key === 'about') {
      window.location.href = '/about-us';
    } else if (selected.key === 'terms') {
      window.location.href = '/terms';
    } else if (selected.key === 'privacy') {
      window.location.href = '/privacy';
    } else if (selected.key === 'contact') {
      window.location.href = '/contact-us';
    }
  }

  function handleBackToMenu() {
    setActiveFlow(null);
    setChatMessages(landingChat);
  }

  let chatContent = null;
  if (activeFlow === 'login') {
    chatContent = <LoginFlow onBack={handleBackToMenu} />;
  } else if (activeFlow === 'signup') {
    chatContent = <SignupFlow onBack={handleBackToMenu} />;
  } else {
    // Remove typing input for landing: pass a prop to ChatInterface to hide input
    chatContent = (
      <ChatInterface
        customMessages={chatMessages}
        customInputHandler={handleMainInput}
        hideInput
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-300">
      <div className="w-full max-w-md mt-10 rounded-2xl shadow-2xl border border-yellow-700/20 bg-white/90">
        <div className="px-2 pb-6">{chatContent}</div>
      </div>
    </div>
  );
};

export default ChatShell;
