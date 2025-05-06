
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const navigate = useNavigate();

  const API_URL = 'http://localhost:8098';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        const data = await response.json();
        setIsEmailSent(true);
        toast.success('Password reset link has been sent to your email');

        // In a real application, you would not redirect to the reset page directly
        // The user would click a link in their email
        // For demo purposes, we'll simulate this by redirecting with the token
        setTimeout(() => {
          navigate(`/reset-password/${data.token}`);
        }, 2000);
      } else {
        // Handle error responses
        if (response.status === 404) {
          toast.error('Email address not found. Please check your email.');
        } else {
          toast.error('Unable to process your request. Please try again.');
        }
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      toast.error('Connection to server failed. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Left Panel */}
      <div className="w-2/5 bg-[#0B1437] hidden md:flex flex-col justify-center items-center">
        <div className="w-72 h-72 bg-white rounded-full" />
        <p className="text-white text-lg mt-6">Reset Your Password</p>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center px-8">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B1437] text-start">
            Forgot Password
          </h2>

          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {isEmailSent ? (
            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg">
              <p className="font-medium">Check your email</p>
              <p className="text-sm">We've sent a password reset link to your email address.</p>
            </div>
          ) : (
            <>
              {/* Email */}
              <div>
                <label htmlFor="email" className="text-sm text-gray-600 block mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:font-semibold"
                />
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
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </>
          )}

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

export default ForgotPasswordForm;
