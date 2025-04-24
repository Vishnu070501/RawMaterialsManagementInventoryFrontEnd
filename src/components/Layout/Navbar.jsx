'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiLogOut, FiUser, FiMenu } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Navbar() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    router.push("/login");
  };

  return (
    <motion.header
      className="bg-white"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo/Brand Section */}
          <div className="flex-shrink-0">
            {/* <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Ornate Production Portal
            </h1> */}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <FiMenu className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                <FiUser className="text-xl text-white" />
              </div>
              <span className="font-semibold text-gray-700 text-sm">{username}</span>
            </div>

            <motion.button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:shadow-orange-500/40 transition-all duration-200 text-xs"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiLogOut className="text-lg" />
              <span className="font-medium">Logout</span>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent px-2 py-2">
              Ornate Solar
            </h1> */}
            <div className="px-2 pt-1 pb-2 space-y-2 sm:px-3">
              <div className="flex items-center space-x-2 p-1">
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                  <FiUser className="text-lg text-white" />
                </div>
                <span className="font-semibold text-gray-700 text-sm">{username}</span>
              </div>

              <motion.button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-2 py-1 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md text-xs"
                whileTap={{ scale: 0.95 }}
              >
                <FiLogOut className="text-lg" />
                <span className="font-medium">Logout</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
