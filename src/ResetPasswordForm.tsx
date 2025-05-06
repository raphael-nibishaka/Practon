import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ResetPasswordForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isTokenValidating, setIsTokenValidating] = useState(true);
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const API_URL = 'http://localhost:8098';

  // Validate token when component mounts
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidToken(false);
        setIsTokenValidating(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/validate-reset-token/${token}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        setIsValidToken(response.ok);
        setIsTokenValidating(false);
      } catch (err) {
        console.error('Token validation error:', err);
        setIsValidToken(false);
        setIsTokenValidating(false);
      }
    };

    validateToken();
  }, [token, API_URL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          token,
          password
        })
      });

      if (response.ok) {
        toast.success('Password has been reset successfully');

        // Redirect to login page after successful reset
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      toast.error('Connection to server failed. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while validating token
  if (isTokenValidating) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-[#0B1437] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg">Validating your reset link...</p>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!isValidToken) {
    return (
      <div className="w-full h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md p-8 bg-red-50 rounded-lg">
          <svg className="h-16 w-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 className="text-2xl font-bold text-red-700 mt-4">Invalid Reset Link</h2>
          <p className="text-gray-700 mt-2">
            This password reset link is invalid or has expired. Please request a new password reset link.
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="mt-6 bg-[#0B1437] text-white py-2 px-4 rounded-lg hover:opacity-90"
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Left Panel */}
      <div className="w-2/5 bg-[#0B1437] hidden md:flex flex-col justify-center items-center">
        <div className="w-72 h-72 bg-white rounded-full" />
        <p className="text-white text-lg mt-6">Create New Password</p>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center px-8">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B1437] text-start">
            Reset Your Password
          </h2>

          <p className="text-gray-600">
            Please enter a new password for your account.
          </p>

          {/* New Password */}
          <div>
            <label htmlFor="password" className="text-sm text-gray-600 block mb-1">New Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:font-semibold"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="text-sm text-gray-600 block mb-1">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:font-semibold"
            />
          </div>

          {/* Password requirements */}
          <div className="text-xs text-gray-500">
            <p>Password must:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>Be at least 8 characters long</li>
              <li>Include both uppercase and lowercase letters</li>
              <li>Include at least one number</li>
            </ul>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#0B1437] text-white py-3 rounded-lg hover:opacity-90 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>

          <p className="text-sm text-center">
            Remember your password?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-[#0B1437] font-semibold cursor-pointer hover:underline"
            >
              Back to Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
