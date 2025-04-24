'use client';
import { useState } from 'react';
import { FiSun, FiMoon, FiArrowLeft } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { postData } from '@/api/API';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await postData('auth/reset-password/', { email });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-50'}`}>
      <div className="max-w-md w-full space-y-8">
        <div className={`relative backdrop-blur-lg rounded-2xl shadow-xl p-8 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90 text-gray-800'}`}>
          {/* Back to Login Button */}
          <Link href="/login" className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-all">
            <FiArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-opacity-20 transition-all"
          >
            {isDarkMode ? (
              <FiMoon className="h-6 w-6 text-yellow-400" />
            ) : (
              <FiSun className="h-6 w-6 text-orange-500" />
            )}
          </button>

          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center my-4">
              {/* <Image
                src="https://siab-prod-t.s3.ap-south-1.amazonaws.com/Essential/logo.png"
                alt="Ornate Solar"
                width={120}
                height={120}
                className="mx-auto h-20 w-auto transition-all duration-300 hover:scale-105"
                priority
              /> */}
            </div>
            <h2 className={`mt-6 text-center text-2xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Reset Your Password
            </h2>
            <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Enter your email address to receive a password reset link
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm">
              <div>
                <label htmlFor="email-address" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none rounded-lg relative block w-full px-4 py-3 border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300"
              >
                Send Reset Link
              </button>
            </div>

            {message && (
              <div className={`mt-2 text-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} bg-opacity-50 p-3 rounded-lg`}>
                {message}
              </div>
            )}

            <div className="text-center mt-4">
              <Link 
                href="/login" 
                className={`text-sm font-medium ${isDarkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-500'} transition-colors duration-300`}
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}