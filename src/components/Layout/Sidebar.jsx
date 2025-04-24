'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowRight, 
  FiChevronDown, 
  FiLogOut, 
  FiMenu, 
  FiUser 
} from 'react-icons/fi';
import axiosInstance from '@/app/lib/apiInstances/axios';

const Sidebar = () => {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({
    inventories: false
  });
  const router = useRouter();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = window.localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const logoVariants = {
    expanded: { width: "200px", height: "80px" },
    collapsed: { width: "60px", height: "60px" }
  };

  const sidebarVariants = {
    expanded: { width: "250px" },
    collapsed: { width: "80px" }
  };

  const toggleDropdown = (key) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSidebarToggle = () => {
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const isActive = (path) => pathname === path;

  const navigationItems = [
    { key: 'dashboard', path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'purchase-order', path: '/purchase-order', icon: '📦', label: 'Purchase Order' },
    { 
      key: 'inventories', 
      icon: '📋', 
      label: 'Inventory',
      hasDropdown: true,
      dropdownItems: [
        { key: 'all-inventories', path: '/inventories', label: 'All Inventories' },
       
        { key: 'raw-material-inventories', path: '/inventories/raw-material', label: 'Raw Material' },
        { key: 'coil-inventories', path: '/inventories/coil', label: 'Coil' },
        { key: 'product-inventories', path: '/inventories/product', label: 'Product' },
        { key: 'Scrap-inventories', path: '/inventories/scrap', label: 'Scrap' },
        // { key: 'create-sequence', path: '/inventories/sequences/create', label: 'Create Sequence' },
      ]
    },
    {key: 'Process', path: '/process', icon: '🔄', label: 'Process',hasDropdown: true,
      dropdownItems:[
        { key: 'Sequences', path: '/inventories/sequences/create', label: 'Sequences' },
      ]
     },
    { key: 'po-approval', path: '/po-approval', icon: '✅', label: 'PO Approvals' },
    // { key: 'create-product', path: '/create-product', icon: '🛠️', label: 'Create Product' },
  ];

  const renderNavigationItem = (item) => {
    if (item.hasDropdown) {
      return (
        <motion.li 
          key={item.key}
          whileHover={{ scale: 1.02, x: 3 }}
          className={`rounded-md overflow-hidden transition-colors duration-200 
            ${openDropdowns[item.key] }`}
        >
          <div 
            onClick={() => isExpanded && toggleDropdown(item.key)}
            className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer"
          >
            <div className="flex items-center">
              <span className="text-xl">{item.icon}</span>
              {isExpanded && (
                <span className="ml-2 font-medium">{item.label}</span>
              )}
            </div>
            {isExpanded && (
              <FiChevronDown 
                className={`transform transition-transform ${
                  openDropdowns[item.key] ? 'rotate-180' : ''
                }`} 
              />
            )}
          </div>
          
          {isExpanded && openDropdowns[item.key] && (
            <AnimatePresence>
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-4 "
              >
                {item.dropdownItems.map((dropdownItem) => (
                  <motion.li
                    key={dropdownItem.key}
                    whileHover={{ x: 5 }}
                    className={`py-1 ${
                      pathname === dropdownItem.path 
                        ? 'bg-amber-500/30' 
                        : 'hover:bg-amber-500/20'
                    }`}
                  >
                    <Link 
                      href={dropdownItem.path} 
                      className="block px-3 py-1 text-xs"
                    >
                      {dropdownItem.label}
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>
          )}
        </motion.li>
      );
    }

    return (
      <motion.li
        key={item.key}
        whileHover={{ scale: 1.02, x: 3 }}
        className={`rounded-md overflow-hidden transition-colors duration-200 ${
          pathname === item.path
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg'
            : 'hover:bg-amber-500/10'
        }`}
      >
        <Link href={item.path} className="flex items-center px-3 py-2 text-sm">
          <span className="text-xl">{item.icon}</span>
          {isExpanded && (
            <span className="ml-2 font-medium">{item.label}</span>
          )}
        </Link>
      </motion.li>
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <>
      <button
        key="mobile-toggle"
        onClick={() => setMobileSidebarOpen(true)}
        className="lg:hidden fixed top-2 left-2 z-50 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full p-1 shadow-lg hover:shadow-amber-500/20"
      >
        <FiArrowRight className="h-4 w-4 text-white" />
      </button>

      <motion.div
        key="sidebar-container"
        initial="expanded"
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={sidebarVariants}
        className={`fixed lg:relative h-[100vh] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl border-r border-amber-500/10 z-40 transition-transform duration-300 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <motion.button
          key="desktop-toggle"
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSidebarToggle}
          className="hidden lg:block absolute -right-2 top-6 z-50 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full p-1 shadow-lg hover:shadow-amber-500/20"
        >
          <svg
            className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>

        <button
          key="mobile-close"
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden absolute right-2 top-2 text-white"
        >
          <svg
            className={`w-3 h-3 transition-transform duration-300 ${isMobileSidebarOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <motion.div
          key="logo-container"
          variants={logoVariants}
          className="flex items-center justify-center h-20 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/20"
        >
          <div className="relative w-full h-12 flex items-center justify-center">
            {/* <Image
              src="/os.png"
              alt="Ornate Solar"
              width={150}
              height={40}
              style={{
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.2))'
              }}
              priority
              className="transition-all duration-300 hover:filter hover:drop-shadow(0 0 10px rgba(251, 191, 36, 0.3))"
            /> */}
          </div>
        </motion.div>

        <nav className="mt-4 px-2">
          <ul className="space-y-2">
            {navigationItems.map(renderNavigationItem)}
          </ul>
        </nav>

        {/* User and Logout Section */}
        {/* <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-amber-500/20">
          <div className="flex items-center justify-between">
            {isExpanded && (
              <div className="flex items-center">
                <FiUser className="mr-2" />
                <span className="text-sm">{username}</span>
              </div>
            )}
            <button 
              onClick={handleLogout}
              className="text-white hover:text-amber-500 transition-colors"
            >
              <FiLogOut />
            </button>
          </div>
        </div> */}
      </motion.div>
    </>
  );
};

export default Sidebar;
