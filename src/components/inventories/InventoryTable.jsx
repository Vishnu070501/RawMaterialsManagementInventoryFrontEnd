"use client";

import { useState, useEffect, useMemo } from "react";
import { StockModal } from "./StockModal";
import { CheckoutModal } from "./CheckoutModal";
import { DataTable } from "../common/Datatable";

export const InventoryTable = ({ data, onItemClick, pageNumber = 1, pageSize = 10 }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState("stockIn");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Process data to ensure unique identifiers
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    // Add a unique identifier to each item
    return data.map((item, index) => ({
      ...item,
      // Use existing id if available, otherwise create a synthetic one
      _uniqueId: item.id || item._id || `inventory-item-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
  }, [data]);
  
  const columns = [
    { key: "sr_no", label: "SR.NO", type: "number", sticky: true, width: 80 },
    { key: "item_name", label: "NAME", type: "string", sticky: true, width: 200 },
    { key: "item_description", label: "RAW-MATERIAL DESCRIPTION", type: "string", width: 220 },
    { key: "coil_name", label: "COIL NAME", type: "string", width: 150 },
    { key: "model_type", label: "TYPE", type: "string", width: 120 },
    { key: "blank_size", label: "BLANK SIZE", type: "string", width: 150 },
    { key: "slit_size", label: "SLIT SIZE", type: "string", width: 150 },
    { key: "total_quantity", label: "TOTAL IN QUANTITY", type: "number", width: 180 },
    { key: "used_quantity", label: "TOTAL USED QUANTITY", type: "number", width: 180 },
    { key: "available_quantity", label: "TOTAL AVAILABLE QUANTITY", type: "number", width: 220 },
    { key: "thickness", label: "THICKNESS", type: "number", width: 120 },
    { key: "total_scrap_quantity", label: "SCRAP QUANTITY", type: "number", width: 150 },
    { key: "total_scrap_weight", label: "SCRAP WEIGHT", type: "number", width: 150 },
    { key: "total_weight", label: "TOTAL IN WEIGHT", type: "number", width: 180 },
    { key: "used_weight", label: "TOTAL USED WEIGHT", type: "number", width: 180 },
    { key: "available_weight", label: "TOTAL AVAILABLE WEIGHT", type: "number", width: 220 },
    { key: "created_at", label: " CREATED-DATE", type: "date", width: 150 },
    { key: "actions", label: "ACTIONS", type: "string", width: 120 },
  ];

  useEffect(() => {
    if (data && data.length > 0) {
      const firstItemWithSearchTerm = data.find((item) => item.searchTerm);
      if (firstItemWithSearchTerm) {
        setSearchTerm(firstItemWithSearchTerm.searchTerm);
      } else {
        setSearchTerm("");
      }
    } else {
      setSearchTerm("");
    }
  }, [data]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    if (searchTerm && itemMatchesSearch(item)) {
      if (onItemClick) {
        onItemClick(item);
      }
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

  const itemMatchesSearch = (item) => {
    if (!searchTerm) return true;
    return (
      (item.item_name &&
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.item_description &&
        item.item_description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.coil_name &&
        item.coil_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const renderCustomCell = (item, column, index, extractNumericValue) => {
    // Actions column
    if (column.key === 'actions' && item.model_type === "raw_material") {
      const isCheckoutDisabled =
        extractNumericValue(item.total_weight) <=
        extractNumericValue(item.used_weight);
        
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedItem({
              ...item,
              isCheckout: true,
            });
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md transition-all duration-300 transform hover:scale-105 active:scale-95 text-xs"
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
        data={processedData}
        onRowClick={handleItemClick}
        searchTerm={searchTerm}
        itemMatchesSearch={itemMatchesSearch}
        renderCustomCell={renderCustomCell}
        extractNumericValue={extractNumericValue}
        emptyMessage="No inventory items found"
        uniqueIdField="_uniqueId"
        pageNumber={pageNumber}
        pageSize={pageSize}
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
