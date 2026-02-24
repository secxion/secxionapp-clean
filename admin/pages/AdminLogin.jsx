import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserShield, FaLock, FaEye, FaEyeSlash, FaKey } from 'react-icons/fa';
import summaryApi from '../common/index.js';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [departmentKey, setDepartmentKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use admin-specific signin endpoint with department key
      const response = await fetch(summaryApi.adminSignIn.url, {
        method: summaryApi.adminSignIn.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, departmentKey }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || 'Welcome!');
        // Store auth data with department info
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminUser', JSON.stringify(data.data.user));
        localStorage.setItem('adminDepartment', JSON.stringify(data.data.department));
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500 rounded-full mb-4">
            <FaUserShield className="text-4xl text-gray-900" />
          </div>
          <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
          <p className="text-gray-400 mt-2">Secxion Management System</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-gray-600"
                  placeholder="admin@secxion.com"
                  required
                />
                <FaUserShield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-gray-600"
                  placeholder="Enter your password"
                  required
                />
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Department Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={departmentKey}
                  onChange={(e) => setDepartmentKey(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-gray-600"
                  placeholder="Enter your department key"
                  required
                />
                <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showKey ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-1">Contact your supervisor for department access key</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  <FaUserShield />
                  Sign In to Admin Panel
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Protected area. Authorized personnel only.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          © 2026 Secxion. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
