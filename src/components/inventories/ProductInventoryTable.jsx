import { useState, useCallback } from "react";
import { DataTable } from "../common/Datatable";
import { ProductCheckoutModal } from "../Product-CheckOut/product-checkout";
import { StockModal } from "./StockModal";

const ProductInventoryTable = ({ data, pageNumber, onItemClick }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("stockin");

  const columns = [
    { key: "sr_no", label: "SR.NO", type: "number", width: 80, sticky: true },
    { key: "item_name", label: "PRODUCT NAME", type: "string", width: 200, sticky: true },
    { key: "category_name", label: "CATEGORY", type: "string", width: 150 },
    { key: "item_description", label: "DESCRIPTION", type: "string", width: 200 },
    { key: "total_quantity", label: "TOTAL QUANTITY", type: "number", width: 150 },
    { key: "used_quantity", label: "USED QUANTITY", type: "number", width: 150 },
    { key: "available_quantity", label: "AVAILABLE QUANTITY", type: "number", width: 180 },
    { key: "total_weight", label: "TOTAL WEIGHT", type: "number", width: 150 },
    { key: "used_weight", label: "USED WEIGHT", type: "number", width: 150 },
    { key: "available_weight", label: "AVAILABLE WEIGHT", type: "number", width: 180 },
    { key: "status", label: "STATUS", type: "string", width: 120 },
    { key: "created_at", label: "CREATED AT", type: "date", width: 150 },
    { key: "actions", label: "ACTIONS", type: "actions", width: 120 },
  ];

  // Use useCallback to memoize these functions
  const handleRowClick = useCallback((item) => {
    // Only open StockModal if checkout modal is not open
    if (!isCheckoutModalOpen) {
      setSelectedItem({...item, isCheckout: false});
      setActiveTab("stockin");
      if (onItemClick) {
        onItemClick(item);
      }
    }
  }, [isCheckoutModalOpen, onItemClick]);

  const handleCheckout = useCallback((e, item) => {
    e.stopPropagation(); // Prevent row click event
    setSelectedItem({...item, isCheckout: true});
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  // Memoize the renderCustomCell function
  const renderCustomCell = useCallback((item, column, index) => {
    if (column.key === 'actions') {
      return (
        <div className="flex items-center justify-center">
          <button
            onClick={(e) => handleCheckout(e, item)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs"
          >
            Checkout
          </button>
        </div>
      );
    }
    return null;
  }, [handleCheckout]);

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        onRowClick={handleRowClick}
        renderCustomCell={renderCustomCell}
        emptyMessage="No product inventory items found"
        pageNumber={pageNumber}
      />
      
      {selectedItem && (
        selectedItem.isCheckout ? (
          <ProductCheckoutModal
            key={`checkout-${selectedItem.id}`}
            isOpen={!!selectedItem}
            onClose={handleCloseModal}
            itemData={selectedItem}
          />
        ) : (
          <StockModal
            key={`stock-${selectedItem.id}`}
            isOpen={!!selectedItem}
            selectedItem={selectedItem}
            onClose={handleCloseModal}
            data={selectedItem}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          >
            <span></span>
          </StockModal>
        )
      )}
    </>
  );
};

export default ProductInventoryTable;
