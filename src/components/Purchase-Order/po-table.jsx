import { useState } from "react";
import { DataTable } from "../common/Datatable";

export default function PurchaseOrderTable({ data, onRowClick }) {
  const columns = [
    { key: "serial_no", label: "SR.NO", type: "number", width: 80, sticky: true },  
    { key: "po_no", label: "PO NUMBER", type: "string", width: 150, sticky: true },
    { key: "purchaser", label: "PURCHASER", type: "string", width: 150 },
    { key: "supplier", label: "SUPPLIER", type: "string", width: 150 },
    { key: "total_amount", label: "TOTAL AMOUNT", type: "number", width: 150 },
    { key: "status", label: "STATUS", type: "string", width: 120 },
    { key: "is_approved", label: "APPROVAL STATUS", type: "boolean", width: 150 },
    { key: "created_at", label: "CREATED AT", type: "date", width: 150 },
    { key: "portal_source", label: "PORTAL SOURCE", type: "string", width: 150 },
  ];

  const renderCustomCell = (item, column, index) => {
    // Serial Number column
    if (column.key === 'serial_no') {
      return index + 1;
    }
    // Approval status column
    else if (column.key === 'is_approved') {
      return item.is_approved ? "Approved" : "Pending";
    }
    
    return null;
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={onRowClick}
      renderCustomCell={renderCustomCell}
      emptyMessage="No purchase orders found"
    />
  );
}
