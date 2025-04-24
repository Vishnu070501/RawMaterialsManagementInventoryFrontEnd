  'use client'; // Ensure this is a client component

  import { postData } from '@/api/API';
  import { useState } from 'react';
  import { useRouter } from 'next/navigation';
  import { motion, AnimatePresence } from 'framer-motion';
  import { FiMail, FiUser, FiPhone, FiLock, FiChevronDown, FiEye, FiEyeOff } from 'react-icons/fi';

  export default function SignupPage() {
    const [formData, setFormData] = useState({
      email: '',
      firstName: '',
      lastName: '',
      department: 'R&D',
      contactNumber: '',
      password: '',
      confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [error, setError] = useState('');
    const [showRefresh, setShowRefresh] = useState(false);
    const router = useRouter();

    const departments = ['R&D', 'Electrical', 'Mechanical'];
    const setDepartment = (dept) => {
      setFormData(prev => ({
        ...prev,
        department: dept
      }));
    };
  const validateEmail = (email) => {
    const allowedDomains = ['@ornatesolar.in', '@ornatesolar.com', '@gmail.com'];
    
    if (!allowedDomains.some(domain => email.endsWith(domain))) {
      return 'Only @ornatesolar.in, @ornatesolar.com, and @gmail.com email addresses are allowed';
    }
    
    return '';
  };

    
    const validatePassword = (password) => {
      const minLength = 8;
    
    
    
      const errors = [];
      if (password.length < minLength) errors.push(`Password must be at least ${minLength} characters`);
  
      return errors;
    };

  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setShowRefresh(false);
      
      const emailError = validateEmail(formData.email);
      if (emailError) {
        setError(emailError);
        return;
      }
      
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        setError(passwordErrors.join('\n'));
        setShowRefresh(true);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setShowRefresh(true);
        return;
      }

      setIsLoading(true);
      try {
        const payload = {
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          department: formData.department,
          contact_number: formData.contactNumber,
          password: formData.password
        };
    
        console.log('Sending signup request:', payload); // Debug log
    
        const response = await postData('/auth/signup/', payload);

        if (response && response.success) {
          // Store minimal required data
          sessionStorage.setItem('email', formData.email);
          sessionStorage.setItem('tempToken', response.token);
          
          // Navigate to OTP verification
          router.push('/otp-verification');
        } else {
          setError('Signup failed. Please try again.');
        }
      } catch (error) {
        console.error('Signup error:', error); // Debug log
        setError(error.message || 'Signup failed');
      } finally {
        setIsLoading(false);
      }
    };

    const handleRefresh = () => {
      setFormData({
        ...formData,
        password: '',
        confirmPassword: ''
      });
      setError('');
      setShowRefresh(false);
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    {error && (
      <div className="flex items-center justify-between">
        <p className="text-red-500 text-sm">{error}</p>
        {showRefresh && (
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        )}
      </div>
    )}

    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Panel - Brand Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-400 to-red-500 p-12 items-center justify-center">
          <div className="max-w-lg text-white text-center flex flex-col justify-center items-center">
            {/* <img
              src="https://siab-prod-t.s3.ap-south-1.amazonaws.com/Essential/logo.png"
              alt="Ornate Solar"
              className="w-64 mb-12 filter brightness-0 invert"
            /> */}
            <h1 className="text-4xl font-bold mb-6">Welcome to Ornate Production Portal</h1>
            <p className="text-lg opacity-90">
              Manage your production workflow efficiently with our comprehensive dashboard and tools.
            </p>
          </div>
        </div>

        {/* Sign-Up Form */}
        <div className="flex justify-center items-center lg:w-1/2 bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg lg:max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20 relative z-10"
          >
            <div className="p-8">
              <h2 className="text-3xl font-bold text-center text-orange-900 mb-6">Create an Account</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="E-mail"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="contactNumber"
                    placeholder="Contact Number"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.contactNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="relative">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <FiChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      readOnly
                      placeholder="Select Department"
                      value={formData.department}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
                    />
                  </div>
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
                      >
                        {departments.map((dept) => (
                          <div
                            key={dept}
                            className="px-4 py-2 hover:bg-orange-50 cursor-pointer"
                            onClick={() => {
                              setDepartment(dept);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {dept}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
  <button
    type="submit"
    disabled={isLoading}
    className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors text-lg font-semibold disabled:opacity-50"
  >
    {isLoading ? 'Signing up...' : 'Sign Up'}
  </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
