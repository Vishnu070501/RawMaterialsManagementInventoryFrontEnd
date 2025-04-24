'use client';

import { useState, useEffect } from "react";
import { StockModal } from "@/components/inventories/StockModal";
import { CheckoutModal } from "@/components/inventories/CheckoutModal";
import { DataTable } from "../common/Datatable";


const CoilInventoryTable = ({ data, pageNumber, onItemClick }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState("stockIn");
  
  const columns = [
    { key: "sr_no", label: "SR.NO", sorted: "unsorted", type: "number", sticky: true, width: 80 },
    { key: "item_name", label: "COIL NAME", sorted: "unsorted", type: "string", sticky: true, width: 200 },
    { key: "item_description", label: "DESCRIPTION", sorted: "unsorted", type: "string", width: 220 },
    { key: "model_type", label: "TYPE", sorted: "unsorted", type: "string", width: 120 },
    { key: "thickness", label: "THICKNESS", sorted: "unsorted", type: "number", width: 120 },
    { key: "slit_size", label: "SLIT SIZE", sorted: "unsorted", type: "number", width: 150 },
    { key: "total_quantity", label: "TOTAL QUANTITY", sorted: "unsorted", type: "number", width: 180 },
    { key: "used_quantity", label: "USED QUANTITY", sorted: "unsorted", type: "number", width: 180 },
    { key: "total_scrap_quantity", label: "SCRAP QUANTITY", sorted: "unsorted", type: "number", width: 180 },
    { key: "total_scrap_weight", label: "SCRAP WEIGHT", sorted: "unsorted", type: "number", width: 180 },
    { key: "total_weight", label: "TOTAL WEIGHT", sorted: "unsorted", type: "number", width: 180 },
    { key: "used_weight", label: "USED WEIGHT", sorted: "unsorted", type: "number", width: 180 },
    { key: "created_at", label: "CREATED DATE", sorted: "unsorted", type: "date", width: 150 },
    { key: "actions", label: "ACTIONS", sorted: "unsorted", type: "string", width: 120 },
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

  const renderCustomCell = (item, column, index, extractNumericValue) => {
    // Actions column
    if (column.key === 'actions') {
      const isCheckoutDisabled = parseFloat(item.total_weight) <= 0;
      
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

export default CoilInventoryTable;
