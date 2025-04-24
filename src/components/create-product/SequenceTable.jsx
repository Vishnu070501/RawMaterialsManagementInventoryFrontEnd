"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SequenceManageModal from "../Sequence-Manage/SequenceManageModal";

const SequenceTable = ({ data, pageNumber = 1, pageSize = 10, onPageChange, onItemClick }) => {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState(null);

  // Prepare data for the table
  const tableData = data?.results || [];
  const totalPages = data?.total_pages || 1;
  const totalCount = data?.total_count || 0;
  const currentPage = data?.current_page || pageNumber;
  // Calculate the starting index for the current page
  const startIndex = (currentPage - 1) * pageSize;

  // Define columns for the table
  const columns = [
    { key: "sr_no", label: "SR.NO", type: "number", width: 80 },
    { key: "sequence_name", label: "SEQUENCE NAME", type: "string", width: 250 },
    { key: "sequence_description", label: "DESCRIPTION", type: "string", width: 300 },
    { key: "no_of_steps", label: "STEP NO.", type: "number", width: 120 },
    { key: "product", label: "PRODUCT", type: "string", width: 200 },
  ];

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

  // Log data to debug
  useEffect(() => {
    console.log("Table data count:", tableData.length);
    console.log("Total count from API:", totalCount);
  }, [tableData, totalCount]);

  // Handle item click
  const handleItemClick = (item) => {
    setSelectedItem(item);
    if (onItemClick) {
      onItemClick(item);
    }
  };

  // Extract numeric value from string with units
  const extractNumericValue = (value) => {
    if (value === null || value === undefined) return 0;
    // If value is already a number, return it
    if (typeof value === 'number') return value;
    // Convert to string if it's not already
    const strValue = value.toString();
    // Extract numeric part using regex
    const matches = strValue.match(/[-+]?[0-9]*\.?[0-9]+/);
    return matches ? parseFloat(matches[0]) : 0;
  };

  // Handle row click
  const handleRowClick = (item) => {
    handleItemClick(item);
  };

  // Handle view button click
  const handleViewClick = (e, item) => {
    e.stopPropagation();
    router.push(`/inventories/sequences/${item.sequence_id}`);
  };

  // Handle edit button click
  const handleEditClick = (e, item) => {
    e.stopPropagation();
    router.push(`/inventories/sequences/edit/${item.sequence_id}`);
  };

  // Handle manage button click - open modal
  const handleManageClick = (e, item) => {
    e.stopPropagation();
    setSelectedSequence(item);
    setIsModalOpen(true);
  };

  // Handler for edit action in modal
  const handleEditSequence = (sequence) => {
    router.push(`/inventories/sequences/edit/${sequence.sequence_id}`);
  };

  // Handler for add step action in modal
  const handleAddStep = (sequence) => {
    // Logic to add a step
    console.log("Adding step to sequence:", sequence);
  };

  // Function to request sorting
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
    if (!sortConfig.key || sortConfig.direction === null) return tableData;
    
    return [...tableData].sort((a, b) => {
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
  }, [tableData, sortConfig, columns]);

  // Calculate sticky position for columns
  const getStickyPosition = (colIndex) => {
    if (colIndex === 0) return 0;
    // For the second sticky column, position it right after the first one
    return columns[0].width;
  };

  return (
    <>
      <div className="max-h-[70vh] overflow-auto rounded-lg shadow-md border border-gray-200 animate-fadeIn">
        {tableData.length === 0 ? (
          <div className="flex justify-center items-center py-8 text-gray-500">
            <p>No sequences found</p>
          </div>
        ) : (
          <div className="max-h-[58vh] relative">
            <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                {columns.map((column) => (
                  <col key={`col-${column.key}`} style={{ width: `${column.width}px` }} />
                ))}
                <col key="actions-col" style={{ width: "120px" }} />
              </colgroup>
              <thead className="bg-gradient-to-r from-amber-100 to-amber-50 sticky top-0 z-10">
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
                            <span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-amber-900 whitespace-nowrap"
                    style={{ width: "120px" }}
                  >
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sortedData.map((item, rowIndex) => (
                  <motion.tr
                    key={item.sequence_id || rowIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rowIndex * 0.05 }}
                    onClick={() => handleRowClick(item)}
                    className={`transition-colors duration-200 ${
                      selectedItem && selectedItem.sequence_id === item.sequence_id
                        ? 'bg-amber-100'
                        : 'hover:bg-amber-50/50'
                    } cursor-pointer`}
                  >
                    {columns.map((column, colIndex) => {
                      // Only apply sticky positioning on desktop, not on mobile
                      const isSticky = !isMobile && column.sticky;
                      const leftPosition = isSticky ? `${getStickyPosition(colIndex)}px` : 'auto';
                      const bgColor = selectedItem && selectedItem.sequence_id === item.sequence_id
                        ? 'rgb(254 243 199)'
                        : 'white';
                      
                      // Define cell content based on column type
                      let cellContent;
                      
                      // For serial number column, calculate based on page number and page size
                      if (column.key === 'sr_no') {
                        // Calculate serial number based on pagination
                        const serialNumber = startIndex + rowIndex + 1;
                        cellContent = serialNumber;
                      } else {
                        // Default column rendering with safe handling for all types
                        cellContent = item[column.key] !== undefined && item[column.key] !== null
                          ? item[column.key].toString()
                          : '-';
                      }
                      
                      return (
                        <td
                          key={`${item.sequence_id || rowIndex}-${column.key}`}
                          className={`px-6 py-4 text-xs ${
                            selectedItem && selectedItem.sequence_id === item.sequence_id
                              ? "text-amber-900 font-medium"
                              : "text-gray-700"
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
                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        {/* <button
                          onClick={(e) => handleViewClick(e, item)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md
                            transition-all duration-300 transform hover:scale-105 active:scale-95 text-xs shadow-sm"
                        >
                          View
                        </button> */}
                        {/* Manage button - opens modal */}
                        <button
                          onClick={(e) => handleManageClick(e, item)}
                          disabled={!item.is_editable}
                          className={`${
                            item.is_editable
                              ? "bg-orange-500 hover:bg-orange-600"
                              : "bg-gray-400 cursor-not-allowed"
                          } w-full sm:w-auto text-white px-1 py-1 rounded-md
                            transition-all duration-300 transform ${
                              item.is_editable ? "hover:scale-105 active:scale-95" : ""
                            } shadow-md hover:shadow-lg text-xs md:text-sm font-medium
                            flex items-center justify-center gap-2`}
                        >
                          Manage
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sequence Manage Modal */}
      <SequenceManageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sequence={selectedSequence}
        onEdit={handleEditSequence}
        onAdd={handleAddStep}
      />
    </>
  );
};

export default SequenceTable;
