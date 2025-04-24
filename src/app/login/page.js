'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MailIcon, LockClosedIcon } from '@heroicons/react/solid';
import { FiMoon, FiSun, FiEye, FiEyeOff } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import axiosInstance from '../lib/apiInstances/axios';
import { postData } from '@/api/API';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loginError, setLoginError] = useState('');


  // Dynamic solar theme toggle
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const validateEmail = (email) => {
    const allowedDomains = ['@ornatesolar.in', '@ornatesolar.com', '@gmail.com'];
    const isValidDomain = allowedDomains.some(domain => email.endsWith(domain));

    if (!isValidDomain) {
      return 'Please use your @ornatesolar.in, @ornatesolar.com, or @gmail.com email address';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    // Email validation
    const emailError = validateEmail(email);
    if (emailError) {
      setLoginError(emailError);
      return;
    }

    try {
      const response = await postData('auth/signin/', { email, password });

      if (response.status === 200 && response.data.is_verified) {
        localStorage.setItem('accessToken', response.data.tokens.access);
        localStorage.setItem('userRole', response.data.user_role);
        localStorage.setItem('username', response.data.user.name);
        localStorage.setItem('user email', response.data.user.email);

        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.tokens.access}`;

        if (response.data.user_role !== 'Admin')
          router.push('/dashboard');
        else
          router.push('/admin-dashboard');
      }
      else if (response.data !== undefined && !response.data.is_verified) {
        await postData('auth/send-otp/', { email });
        router.push('/sign-up/verify-otp?email=' + email);
      }
      else {
        // Set error message from response
        setLoginError(response.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);

      // Set error message from error response
      if (error.response && error.response.data) {
        setLoginError(error.response.data.message || 'Login failed. Please try again.');
      } else {
        setLoginError('Login failed. Please try again.');
      }

      setPassword('');
    }
  };




  const handleSignUpClick = () => {
    router.push('/sign-up');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-50'}`}>
      <div className="w-full max-w-md">
        <div className={`relative backdrop-blur-lg rounded-2xl shadow-xl p-8 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90 text-gray-800'}`}>
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
          {/* Header with Ornate Solar Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center my-4">
              {/* <Image
                src="https://siab-prod-t.s3.ap-south-1.amazonaws.com/Essential/logo.png"
                alt="Ornate Solar Logo"
                width={145}
                height={140}
                className="max-w-full h-auto"
              /> */}
            </div>
            <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Login to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-5">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MailIcon className="h-5 w-5 text-orange-500 mr-2" />
                  Email address
                </label>
                <input
                  type="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <LockClosedIcon className="h-5 w-5 text-orange-500 mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={isPasswordVisible ? 'text' : 'password'}
                    required
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />


                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {isPasswordVisible ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                </div>

              </div>
            </div>

            
           
            {/* Display error message if login failed */}
            {loginError && (
             <div className="text-red-500 text-sm text-center mt-2">
                <span className="block sm:inline">{loginError}</span>
              </div>
            )}


            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  Remember me
                </label>
              </div>
              <Link href="/login/forgot-password" passHref>
                <span className="text-sm font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200 cursor-pointer">
                  Forgot password?
                </span>
              </Link>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Login
              </button>

              <p className="text-center tenetxt-sm text-gray-600">
                Donot have an account?{' '}
                <button
                  onClick={() => router.push('/sign-up')}
                  className="font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200"
                >
                  Create account
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


