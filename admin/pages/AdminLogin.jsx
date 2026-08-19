import React, { useEffect, useState } from 'react';
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
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();

  const fetchCsrfToken = async () => {
    try {
      const response = await fetch(`${summaryApi.baseURL}/api/csrf-token`, {
        method: 'GET',
        credentials: 'include',
      });
      const result = await response.json();
      if (result.success && result.csrfToken) {
        setCsrfToken(result.csrfToken);
        return result.csrfToken;
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }

    return '';
  };

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const payload = { email, password, departmentKey };

      const runSigninAttempt = async (token) => {
        const response = await fetch(summaryApi.adminSignIn.url, {
          method: summaryApi.adminSignIn.method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        return { response, data };
      };

      let tokenToUse = csrfToken;
      if (!tokenToUse) {
        tokenToUse = await fetchCsrfToken();
      }

      if (!tokenToUse) {
        toast.error('Security token not ready yet. Please try again.');
        return;
      }

      let { response, data } = await runSigninAttempt(tokenToUse);

      if (
        response.status === 403 &&
        (data?.code === 'CSRF_VALIDATION_FAILED' ||
          /csrf|session/i.test(String(data?.message || '')))
      ) {
        const refreshedToken = await fetchCsrfToken();
        if (refreshedToken) {
          ({ response, data } = await runSigninAttempt(refreshedToken));
        }
      }

      if (data.success) {
        toast.success(data.message || 'Welcome!');
        // Persist only non-sensitive session metadata on client side.
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminUser', JSON.stringify(data.data.user));
        localStorage.setItem('adminDepartment', JSON.stringify(data.data.department));
        navigate('/dashboard');
      } else {
        if (response.status === 429) {
          const retryAfter = data?.retryAfter
            ? new Date(data.retryAfter).toLocaleTimeString()
            : null;
          const message = retryAfter
            ? `Too many login attempts. Try again after ${retryAfter}.`
            : 'Too many login attempts. Please wait and try again.';
          toast.error(message);
          return;
        }

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-yellow-500 rounded-full mb-3 sm:mb-4">
            <FaUserShield className="text-2xl sm:text-4xl text-gray-900" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Portal</h1>
          <p className="text-gray-400 mt-1.5 sm:mt-2 text-sm sm:text-base">Secxion Management System</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-5 sm:p-8 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="admin-email" className="block text-gray-300 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-input w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 text-sm sm:text-base"
                  placeholder="admin@secxion.com"
                  required
                />
                <FaUserShield className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-gray-300 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-input w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base"
                  placeholder="Enter your password"
                  required
                />
                <FaLock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 sm:right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="admin-department-key" className="block text-gray-300 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                Department Key
              </label>
              <div className="relative">
                <input
                  id="admin-department-key"
                  type={showKey ? 'text' : 'password'}
                  value={departmentKey}
                  onChange={(e) => setDepartmentKey(e.target.value)}
                  className="admin-input w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base"
                  placeholder="Enter department key"
                  required
                />
                <FaKey className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-1 sm:right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
                  aria-label={showKey ? 'Hide department key' : 'Show department key'}
                >
                  {showKey ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <p className="text-gray-500 text-[10px] sm:text-xs mt-1">Contact your supervisor for access key</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="admin-btn-primary w-full py-2.5 sm:py-3 px-4 text-sm sm:text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <FaUserShield />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-gray-500 text-xs sm:text-sm">
              Protected area. Authorized personnel only.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 sm:mt-6 text-gray-500 text-xs sm:text-sm">
          © 2026 Secxion. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
