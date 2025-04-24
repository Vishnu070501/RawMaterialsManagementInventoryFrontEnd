"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { StockInTable } from "./StockInTable";
import { StockOutTable } from "./StockOutTable";

export const StockModal = ({ isOpen, onClose, selectedItem, activeTab, setActiveTab }) => {
  const [checkOutData, setCheckOutData] = useState([]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl p-4 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Stock Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setActiveTab("stockIn")}
            className={`px-3 py-1 rounded-md text-xs ${
              activeTab === "stockIn"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Stock In
          </button>
          <button
            onClick={() => setActiveTab("stockOut")}
            className={`px-3 py-1 rounded-md text-xs ${
              activeTab === "stockOut"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Stock Out
          </button>
        </div>

        {selectedItem && (
          activeTab === 'stockIn' ? (
            <StockInTable
              id={selectedItem.id}
              modelType={selectedItem.model_type}
            />
          ) : (
            <StockOutTable
              id={selectedItem.id}
              modelType={selectedItem.model_type}
              data={checkOutData}
            />
          )
        )}
      </motion.div>
    </motion.div>
  );
};
