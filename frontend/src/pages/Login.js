import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import SummaryApi from "../common";
import Context from "../Context";
import ChatInterface from "../Components/ChatInterface";
import SecxionLogo from '../app/slogo.png';



const Login = () => {
  const { fetchUserDetails } = useContext(Context);
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState([
    { type: 'text', from: 'bot', text: '👋 Welcome! Please enter your email to begin login.' }
  ]);
  const [loginState, setLoginState] = useState({ step: 'email', email: '', password: '', slider: null });
  const [sliderChallenge, setSliderChallenge] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Handle chat input
  const handleChatInput = async (input) => {
    if (loginState.step === 'email') {
      setLoginState(s => ({ ...s, email: input, step: 'password' }));
      setChatMessages(msgs => [...msgs, { type: 'text', from: 'user', text: input }, { type: 'text', from: 'bot', text: 'Please enter your password.' }]);
    } else if (loginState.step === 'password') {
      setLoginState(s => ({ ...s, password: input, step: 'slider' }));
      setChatMessages(msgs => [...msgs, { type: 'text', from: 'user', text: '••••••••' }, { type: 'text', from: 'bot', text: 'Verifying you are human... Please complete the slider below.' }]);
      // Fetch slider challenge
      try {
        const res = await fetch(SummaryApi.sliderVerification.url, {
          method: SummaryApi.sliderVerification.method,
          credentials: "include",
        });
        if (!res.ok) throw new Error('Failed to fetch verification challenge.');
        const { target, signature } = await res.json();
        setSliderChallenge({ target, signature, value: 0 });
      } catch (error) {
        setChatMessages(msgs => [...msgs, { type: 'text', from: 'bot', text: 'Failed to load verification challenge. Please try again.' }]);
      }
    }
  };

  // Handle slider change
  const handleSliderChange = (val) => {
    setSliderChallenge(s => ({ ...s, value: val }));
  };

  // Handle slider verification
  const handleSliderVerify = async () => {
    if (!sliderChallenge || Math.abs(sliderChallenge.value - sliderChallenge.target) > 3) {
      setChatMessages(msgs => [...msgs, { type: 'text', from: 'bot', text: 'Slider not matched. Please try again.' }]);
      return;
    }
    setVerifying(true);
    setChatMessages(msgs => [...msgs, { type: 'text', from: 'user', text: `[Slider matched: ${sliderChallenge.value}]` }, { type: 'text', from: 'bot', text: 'Logging you in...' }]);
    try {
      const response = await fetch(SummaryApi.signIn.url, {
        method: SummaryApi.signIn.method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginState.email,
          password: loginState.password,
          sliderValue: sliderChallenge.value,
          targetValue: sliderChallenge.target,
          slider: { value: sliderChallenge.value, signature: sliderChallenge.signature },
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setChatMessages(msgs => [...msgs, { type: 'text', from: 'bot', text: '✅ Login successful! Redirecting...' }]);
        await fetchUserDetails();
        setTimeout(() => navigate('/home'), 1200);
      } else {
        setChatMessages(msgs => [...msgs, { type: 'text', from: 'bot', text: result.message || 'Login failed. Please try again.' }]);
        setLoginState({ step: 'email', email: '', password: '', slider: null });
      }
    } catch (error) {
      setChatMessages(msgs => [...msgs, { type: 'text', from: 'bot', text: 'An unexpected error occurred. Please try again.' }]);
      setLoginState({ step: 'email', email: '', password: '', slider: null });
    } finally {
      setVerifying(false);
      setSliderChallenge(null);
    }
  };

  // Custom chat input handler
  const customInputHandler = (input) => {
    if (loginState.step === 'slider') return; // Ignore input while slider is active
    handleChatInput(input);
  };

  // Custom chat messages to inject slider UI
  let displayMessages = [...chatMessages];
  if (loginState.step === 'slider' && sliderChallenge) {
    displayMessages = [
      ...chatMessages,
      {
        type: 'component',
        from: 'bot',
        component: (
          <div className="flex flex-col items-center bg-yellow-50 p-4 rounded shadow">
            <div className="mb-2 text-yellow-800 font-semibold">Slide to match: <span className="font-bold">{sliderChallenge.target}</span></div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderChallenge.value}
              onChange={e => handleSliderChange(Number(e.target.value))}
              className="w-full mb-2 accent-yellow-500"
              disabled={verifying}
            />
            <div className="mb-2 text-xs text-gray-600">Current: <span className="font-bold">{sliderChallenge.value}</span></div>
            <button
              className="bg-yellow-600 text-white px-4 py-2 rounded disabled:opacity-50"
              onClick={handleSliderVerify}
              disabled={verifying || Math.abs(sliderChallenge.value - sliderChallenge.target) > 3}
            >
              {verifying ? 'Verifying...' : 'Verify & Login'}
            </button>
          </div>
        )
      }
    ];
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-300">
      <div className="w-full max-w-md mt-10 rounded-2xl shadow-2xl border border-yellow-700/20 bg-white/90">
        <div className="flex flex-col items-center py-6">
          <div className="mb-2">
            <img src={SecxionLogo} alt="Secxion Logo" className="w-16 h-16 object-contain rounded-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-yellow-700 mb-2">Secxion Chat Login</h1>
        </div>
        <div className="px-2 pb-6">
          <ChatInterface customMessages={displayMessages} customInputHandler={customInputHandler} />
        </div>
        <div className="text-center text-xs text-gray-500 pb-4">
          <Link to="/contact-us" className="hover:text-yellow-700 transition-colors">Contact Us</Link>
          <span className="mx-2 text-gray-400">|</span>
          <a href="https://secxion.com" target="_blank" rel="noopener noreferrer" className="hover:underline">© {new Date().getFullYear()} secxion.com</a>
        </div>
      </div>
    </div>
  );
};

export default Login;