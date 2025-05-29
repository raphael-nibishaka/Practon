import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const API_URL = 'http://localhost:8098';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            if (response.ok) {
                const userData = await response.json();

                // Store user data in sessionStorage
                sessionStorage.setItem('user', JSON.stringify(userData.user));
                sessionStorage.setItem('isAuthenticated', 'true');
                sessionStorage.setItem('token', userData.token);

                toast.success('Welcome back! Login successful.');

                // Redirect based on user role
                setTimeout(() => {
                    if (userData.role === 'ADMIN') {
                        navigate('/admin');
                    } else if (userData.role === 'ORGANIZATION') {
                        navigate('/organization');
                    } else {
                        navigate('/dashboard');
                    }
                }, 1000);
            } else {
                // Handle specific status codes with friendly messages
                if (response.status === 401) {
                    toast.error('Invalid email or password. Please try again.');
                } else if (response.status === 404) {
                    toast.error('Account not found. Please check your email.');
                } else if (response.status === 429) {
                    toast.error('Too many login attempts. Please try again later.');
                } else {
                    toast.error('Unable to log in. Please try again.');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            toast.error('Connection to server failed. Please check your internet connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-screen flex select-none">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

            {/* Left Panel */}
            <div className="w-2/5 bg-[#0B1437] hidden md:flex flex-col justify-center items-center select-none">
                <div className="w-72 h-72 bg-white rounded-full" />
                <p className="text-white text-lg mt-6 font-['Space+Grotesk'] font-semibold tracking-wider select-none">Login with <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent font-['Orbitron']">DevUp</span></p>
            </div>

            {/* Form Section */}
            <div className="flex-1 flex items-center justify-center px-8 select-none">
                <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B1437] text-start select-none">Welcome Back !!!</h2>

                    {/* Google login */}
                    <button
                        type="button"
                        className="w-full border py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-50 select-none"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-2" />
                        <span className="text-gray-700">Login with Google</span>
                    </button>

                    <div className="flex items-center gap-2 select-none">
                        <hr className="flex-1 border-t" />
                        <span className="text-sm text-gray-500">or</span>
                        <hr className="flex-1 border-t" />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="text-sm text-gray-600 block mb-1 select-none">Email</label>
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

                    {/* Password */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="password" className="text-sm text-gray-600 select-none">Password</label>
                            <a href="/forgot-password" className="text-xs text-blue-600 hover:underline select-none">Forgot password?</a>
                        </div>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:font-semibold"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-[#0B1437] text-white py-3 rounded-lg hover:opacity-90 flex items-center justify-center select-none"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing In...
                            </>
                        ) : (
                            'Log In'
                        )}
                    </button>

                    <p className="text-sm text-center select-none">
                        New to site?{' '}
                        <span
                            onClick={() => navigate('/register')}
                            className="text-[#0B1437] font-semibold cursor-pointer hover:underline select-none"
                        >
                            Sign Up
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
