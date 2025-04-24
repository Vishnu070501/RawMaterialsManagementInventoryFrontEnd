'use client';
import React from "react";
import { motion } from "framer-motion";
import FormFields from "@/components/common/FormFields";

export default function MaterialTable({ items = [], title }) {
  const headers = [
    { label: 'Name', key: 'name', type: 'text' },
    { label: 'Description', key: 'description', type: 'textarea' },
    { label: 'HSN Code', key: 'hsn_code', type: 'text' },
    { label: 'Quantity', key: 'quantity', type: 'number' },
    { label: 'Unit Price', key: 'unit_price', type: 'number' },
    { label: 'Tax %', key: 'tax_percentage', type: 'number' },
    { label: 'Delivery Date', key: 'delivery_date', type: 'date' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-4 md:p-8"
    >
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th key={header.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index}>
                {headers.map((header) => (
                  <td key={header.key} className="px-6 py-4 whitespace-nowrap">
                    <FormFields
                      type={header.type}
                      value={item[header.key]}
                      property={header.key}
                      sizeClasses="w-full"
                      onChange={() => {}}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
