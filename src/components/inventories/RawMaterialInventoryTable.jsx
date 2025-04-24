'use client';

import { useState, useEffect } from "react";
import { StockModal } from "@/components/inventories/StockModal";
import { CheckoutModal } from "@/components/inventories/CheckoutModal";
import { DataTable } from "../common/Datatable";


const RawMaterialInventoryTable = ({ data, pageNumber, onItemClick }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState("stockIn");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  
  const columns = [
    { key: "sr_no", label: "SR.NO", type: "number", sticky: true, width: 80 },
    { key: "item_name", label: "ITEM NAME", type: "string", sticky: true, width: 200 },
    { key: "item_description", label: "DESCRIPTION", type: "string", width: 220 },
    { key: "thickness", label: "THICKNESS", type: "number", width: 120 },
    { key: "slit_size", label: "SLIT SIZE", type: "number", width: 150 },
    { key: "blank_size", label: "BLANK SIZE", type: "number", width: 150 },
    { key: "total_quantity", label: "TOTAL QTY", type: "number", width: 180 },
    { key: "used_quantity", label: "USED QTY", type: "number", width: 180 },
    { key: "total_scrap_quantity", label: "SCRAP QUANTITY", type: "number", width: 150 },
    { key: "total_scrap_weight", label: "SCRAP WEIGHT", type: "number", width: 150 },
    { key: "total_weight", label: "TOTAL WEIGHT", type: "number", width: 180 },
    { key: "used_weight", label: "USED WEIGHT", type: "number", width: 180 },
    { key: "created_at", label: "CREATED DATE", type: "date", width: 150 },
    { key: "actions", label: "ACTIONS", type: "string", width: 120 },
  ];

  const handleItemClick = (item) => {
    setSelectedItem(item);
    if (onItemClick) {
      onItemClick(item);
    }
  };

  // Helper function to extract numeric value from string with units
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

  // Define the reverseDateFormat function for sorting
  const reverseDateFormat = (dateString) => {
    if (!dateString) return "";
    // Handle ISO date format
    if (dateString.includes("T")) {
      return dateString;
    }
    // Handle dd-mm-yyyy format
    if (dateString.includes("-")) {
      const [dd, mm, yyyy] = dateString.split("-");
      return `${yyyy}-${mm}-${dd}`;
    }
    return dateString;
  };

  const renderCustomCell = (item, column, index, extractNumericValue) => {
    // Don't handle sr_no here, let DataTable handle it
    if (column.key === 'sr_no') {
      return null; // Return null to let DataTable use its default handling
    }
    
    // Actions column
    else if (column.key === 'actions') {
      const isCheckoutDisabled = parseFloat(item.total_weight || 0) <= parseFloat(item.used_weight || 0);
     
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedItem({
              ...item,
              isCheckout: true,
            });
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md 
            transition-all duration-300 transform hover:scale-105 active:scale-95 text-xs"
          disabled={isCheckoutDisabled}
          style={{
            cursor: isCheckoutDisabled ? "not-allowed" : "pointer",
            opacity: isCheckoutDisabled ? 0.5 : 1,
          }}
        >
          Checkout
        </button>
      );
    }
    // Handle numeric columns with fixed decimal places
    else if (['thickness', 'slit_size', 'blank_size', 'total_quantity', 'used_quantity', 'total_weight', 'used_weight'].includes(column.key)) {
      return typeof item[column.key] === 'number' 
        ? item[column.key].toFixed(4) 
        : item[column.key] || '-';
    }
    
    return null;
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        onRowClick={handleItemClick}
        renderCustomCell={renderCustomCell}
        extractNumericValue={extractNumericValue}
        emptyMessage="No inventory items found"
      />
      
      {selectedItem?.isCheckout ? (
        <CheckoutModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          itemData={selectedItem}
        />
      ) : (
        <StockModal
          isOpen={!!selectedItem}
          selectedItem={selectedItem}
          onClose={() => setSelectedItem(null)}
          data={selectedItem}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          <span></span>
        </StockModal>
      )}
    </>
  );
};

export default RawMaterialInventoryTable;
