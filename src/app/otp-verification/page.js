'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiLock, FiMail } from 'react-icons/fi';
import { postData } from '@/api/API';

export default function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(0);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const email = sessionStorage.getItem('email');
    if (!email) {
      router.replace('/sign-up');
      return;
    }
    setUserEmail(email);
    startResendTimer();
  }, [router]);

  const startResendTimer = () => {
    setResendTimeout(30);
    const timer = setInterval(() => {
      setResendTimeout((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOTP = async () => {
    if (resendTimeout > 0) return;
    
    setError('');
    setIsLoading(true);

    try {
      const response = await postData('/auth/send-otp/', {
        email: userEmail
      });

      if (response.success) {
        startResendTimer();
        setOtp(['', '', '', '', '', '']);
      }
    } catch (error) {
      setError(error.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const otpString = otp.join('');

    try {
      const response = await postData('/auth/verify-otp/', {
        email: userEmail,
        otp: otpString
      });

      if (response.success) {
        sessionStorage.removeItem('email');
        sessionStorage.setItem('isVerified', 'true');
        router.push('/login');
      }
    } catch (error) {
      setError(error.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-400 to-red-500 p-12 items-center justify-center">
        <div className="max-w-lg text-white text-center flex flex-col justify-center items-center">
          {/* <img
            src="https://siab-prod-t.s3.ap-south-1.amazonaws.com/Essential/logo.png"
            alt="Ornate Solar"
            className="w-64 mb-12 filter brightness-0 invert"
            priority="true"
          /> */}
          <h1 className="text-4xl font-bold mb-6">Verify Your Account</h1>
          <p className="text-lg opacity-90">
            Please enter the verification code sent to your email address.
          </p>
        </div>
      </div>

      <div className="flex justify-center items-center lg:w-1/2 bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg lg:max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20 relative z-10"
        >
          <div className="p-8">
            <h2 className="text-3xl font-bold text-center text-orange-900 mb-6">
              Enter Verification Code
            </h2>

            {userEmail && (
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
                <FiMail className="w-5 h-5" />
                <span className="text-sm">{userEmail}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-center space-x-4">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={data}
                    onChange={(e) => handleChange(e.target, index)}
                    className="w-12 h-12 text-center text-2xl border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors text-lg font-semibold disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendTimeout > 0 || isLoading}
                  className={`text-orange-600 hover:text-orange-700 font-semibold ${
                    resendTimeout > 0 ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  {resendTimeout > 0 ? `Resend OTP in ${resendTimeout}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}