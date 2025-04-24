'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TableActionDropdown = ({ onSelectOption, options = ['Existing Sheet', 'Coil'] }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </button>
  
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 z-50 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5"
            >
              <div className="py-1">
                {options.map((option) => (
                  <div
                    key={option}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer transition-colors duration-150 flex items-center space-x-2"
                    onClick={() => {
                      onSelectOption(option);
                      setIsOpen(false);
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    <span>{option}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
  

export default TableActionDropdown;
