"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useMemo } from "react";

export const DataTable = ({
  columns,
  data,
  onRowClick,
  searchTerm = "",
  itemMatchesSearch = () => true,
  renderCustomCell,
  extractNumericValue = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const strValue = value.toString();
    const matches = strValue.match(/[-+]?[0-9]*\.?[0-9]+/);
    return matches ? parseFloat(matches[0]) : 0;
  },
  uniqueIdField = "id",
  emptyMessage = "No data found",
  pageNumber = 1,
  pageSize = 10
}) => {
  const [displayData, setDisplayData] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  // Update sortConfig to include a third state: null (for no sorting)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      // Add a unique identifier to each item if it doesn't already have one
      const dataWithUniqueIds = data.map((item, index) => ({
        ...item,
        _uniqueId: item[uniqueIdField] || `item-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));
      setDisplayData(dataWithUniqueIds);
    } else {
      setDisplayData([]);
    }
  }, [data, uniqueIdField]);

  // Calculate left position for each sticky column
  const getStickyPosition = (colIndex) => {
    if (colIndex === 0) return 0;
    // For the second sticky column, position it right after the first one
    return columns[0].width;
  };

  // Modified requestSort function to handle three states
  const requestSort = (key) => {
    // Skip sorting for serial number column
    if (key === 'sr_no') return;
    
    let direction = 'ascending';
    
    // Implement three-state sorting cycle
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') {
        direction = 'descending';
      } else if (sortConfig.direction === 'descending') {
        direction = null; // Third state - no sorting
      }
    }
    
    setSortConfig({ key: direction === null ? null : key, direction });
  };

  // Function to convert date format for sorting
  const reverseDateFormat = (dateString) => {
    if (!dateString) return "";
    // Handle ISO date format
    if (dateString.includes("T")) {
      return dateString;
    }
    // Handle dd-mm-yyyy format
    if (dateString.includes("-")) {
      const parts = dateString.split("-");
      if (parts.length === 3) {
        // Check if first part is likely a day (1-31)
        if (parseInt(parts[0]) <= 31) {
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
    }
    return dateString;
  };

  // Apply sorting to the data
  const sortedData = useMemo(() => {
    // If no sorting is applied (direction is null), return the original data
    if (!sortConfig.key || sortConfig.direction === null) return displayData;
    
    return [...displayData].sort((a, b) => {
      // Find column type
      const column = columns.find(col => col.key === sortConfig.key);
      const type = column?.type || 'string';
      
      // Skip sorting for sr_no column
      if (sortConfig.key === 'sr_no') return 0;
      
      let valueA = a[sortConfig.key];
      let valueB = b[sortConfig.key];
      
      // Handle different data types
      if (type === 'number') {
        valueA = extractNumericValue(valueA);
        valueB = extractNumericValue(valueB);
      } else if (type === 'date') {
        valueA = new Date(reverseDateFormat(valueA || '')).getTime() || 0;
        valueB = new Date(reverseDateFormat(valueB || '')).getTime() || 0;
      }
      
      // Handle null/undefined values
      if (valueA === null || valueA === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (valueB === null || valueB === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
      
      // Compare values
      if (valueA < valueB) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [displayData, sortConfig, columns, extractNumericValue]);

  if (!displayData || displayData.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="max-h-[58vh] relative">
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed', minWidth: '2500px' }}>
          <colgroup>
            {columns.map((column) => (
              <col key={`col-${column.key}`} style={{ width: `${column.width}px` }} />
            ))}
          </colgroup>
          <thead className="bg-amber-50 sticky top-0 z-10">
            <tr>
              {columns.map((column, colIndex) => {
                // Only apply sticky positioning on desktop, not on mobile
                const isSticky = !isMobile && column.sticky;
                const leftPosition = isSticky ? `${getStickyPosition(colIndex)}px` : 'auto';
                
                return (
                  <th
                    key={column.key}
                    className={`px-6 py-4 text-left text-xs font-semibold text-amber-900 whitespace-nowrap ${
                      isSticky ? 'sticky z-20 bg-amber-50' : ''
                    } ${column.key !== 'sr_no' ? 'cursor-pointer' : 'cursor-default'}`}
                    style={{
                      left: leftPosition,
                      width: `${column.width}px`,
                      boxShadow: isSticky && colIndex === 1 ? '4px 0 5px -2px rgba(0,0,0,0.1)' : 'none'
                    }}
                    onClick={() => column.key !== 'sr_no' ? requestSort(column.key) : null}
                  >
                    <div className="flex items-center group">
                      <span className="mr-2">{column.label}</span>
                      {sortConfig.key === column.key && sortConfig.direction && (
                        <span>
                          {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedData.map((item, index) => {
              const isMatch = searchTerm && itemMatchesSearch(item);

              return (
                <motion.tr
                  key={`row-${item._uniqueId || index}-${Math.random().toString(36).substr(2, 9)}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`hover:bg-amber-50/50 cursor-pointer ${
                    isMatch ? "bg-amber-100" : ""
                  }`}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((column, colIndex) => {
                    // Only apply sticky positioning on desktop, not on mobile
                    const isSticky = !isMobile && column.sticky;
                    const leftPosition = isSticky ? `${getStickyPosition(colIndex)}px` : 'auto';
                    const bgColor = isMatch ? 'rgb(254 243 199)' : 'white';
                    
                    // Define cell content based on column type
                    let cellContent;
                    
                    // For serial number column, calculate based on page number and page size
                    if (column.key === 'sr_no') {
                      // Calculate serial number based on pagination
                      const serialNumber = ((pageNumber - 1) * pageSize) + index + 1;
                      cellContent = serialNumber;
                    }
                    // Check if there's a custom renderer for this cell (but not for sr_no)
                    else if (renderCustomCell && column.key !== 'sr_no') {
                      const customContent = renderCustomCell(item, column, index, extractNumericValue);
                      if (customContent !== null && customContent !== undefined) {
                        cellContent = customContent;
                      }
                    }
                    
                    // If no custom content was set, use default rendering
                    if (cellContent === undefined) {
                      // Format created_at column
                      if (column.key === 'created_at' && item.created_at) {
                        cellContent = new Date(item.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        });
                      }
                      // Available weight column
                      else if (column.key === 'available_weight') {
                        const totalWeight = extractNumericValue(item.total_weight);
                        const usedWeight = extractNumericValue(item.used_weight);
                        const availableWeight = (totalWeight - usedWeight).toFixed(3);
                        cellContent = `${availableWeight} kg`;
                      }
                      // Available quantity column
                      else if (column.key === 'available_quantity') {
                        const totalQuantity = parseFloat(item.total_quantity || 0);
                        const usedQuantity = parseFloat(item.used_quantity || 0);
                        const availableQuantity = totalQuantity - usedQuantity;
                        cellContent = availableQuantity;
                      }
                      // Default column rendering with safe handling for all types
                      else {
                        cellContent = item[column.key] !== undefined && item[column.key] !== null
                          ? item[column.key].toString()
                          : '-';
                      }
                    }

                    return (
                      <td
                        key={column.key}
                        className={`px-6 py-4 text-xs ${
                          isMatch ? "text-amber-900 font-medium" : "text-gray-700"
                        } ${isSticky ? 'sticky' : ''} whitespace-nowrap overflow-hidden text-ellipsis`}
                        style={{
                          left: leftPosition,
                          width: `${column.width}px`,
                          background: isSticky ? bgColor : 'transparent',
                          boxShadow: isSticky && colIndex === 1 ? '4px 0 5px -2px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
