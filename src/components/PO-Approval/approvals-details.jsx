"use client";
import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getData, postData } from "@/api/API";
import { Loading } from "./loading";
import axiosInstance from "@/app/lib/apiInstances/axios";
import { useRouter } from "next/navigation";

const ApprovalDetailsPage = ({ po_id, onBack, requester_id }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [approvedQuantity, setApprovedQuantity] = useState({});
  const [remarks, setRemarks] = useState("");
  const [itemRemarks, setItemRemarks] = useState({});
  const [weightUnitId, setWeightUnitId] = useState({});
  const [approvedWeight, setApprovedWeight] = useState({});
  const [quantityUnitId, setQuantityUnitId] = useState({});




  // Add this query at the top with other queries
  const { data: unitsData } = useQuery({
    queryKey: ['units'],
    queryFn: () => getData('/master/units/'),
  });

  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["approvalDetails", po_id],
    queryFn: () =>
      getData(
        `/inventory/approval-details/po/?po_id=${po_id}&requester_id=${requester_id}`
      ),
    refetchInterval: false,
    staleTime: 0,
  });

  const [approvalDetails, setApprovalDetails] = useState([]);

  useEffect(() => {
    if (data?.data?.items) {
      setApprovalDetails(
        data.data.items.map((item) => ({
          ...item,
          isSelected: false,
        }))
      );
    }
  }, [data]);

  const approveMutation = useMutation({
    mutationFn: (approvalData) => {
      const payload = {
        approved_entries: approvalData.approved_entries.map((entry) => ({
          approval_id: entry.approval_id,
          quantity_approved: entry.quantity_approved,
          weight_approved: entry.weight_approved,
          weight_approved_unit_id: entry.weight_approved_unit_id,
        })),
        remarks: remarks || "Approved",
      };
      return postData("/inventory/approve-raw-material-coil/", payload);
    },
    onSuccess: (response) => {
      console.log("Approval response:", response);

      // Check if the response indicates success or failure
      if (response && response.success === false) {
        // Handle failure case
        alert(response.message || "Failed to approve item");
      } else {
        // Handle success case
        alert("Successfully Approved");

        // Optimistically update the UI
        setApprovalDetails((prev) =>
          prev.filter((item) => !selectedItems.includes(item.approval_id))
        );
        setSelectedItems([]);
        setApprovedQuantity({});
        setRemarks("");

        // Refetch to sync with server
        refetch();

        // Redirect if no more items
        if (approvalDetails.length <= 1) {
          // Change this line to redirect to po-approval page instead of inventories
          router.push('/po-approval');
        } else {
          // If there are still items, just go back to the previous screen
          onBack();
        }
      }
    },
    onError: (error) => {
      console.error("Approval error:", error);
      alert(`Error: ${error.message || "Failed to approve item"}`);
    }
  });



  const handleSelectAll = (e) => {
    setApprovalDetails((prev) => {
      return prev.map((item) => ({
        ...item,
        isSelected: e.target.checked,
      }));
    });
    if (e.target.checked) {
      setSelectedItems(approvalDetails.map((item) => item.approval_id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleBulkApprove = () => {
    if (!remarks.trim()) {
      alert("Please enter remarks before approving");
      return;
    }

    const approvalData = {
      approved_entries: selectedItems.map((approvalId) => {
        const item = approvalDetails.find(item => item.approval_id === approvalId);
        return {
          approval_id: approvalId,
          quantity_approved: approvedQuantity[approvalId] || item.quantity_requested,
          quantity_approved_unit_id: quantityUnitId[approvalId],
          weight_approved: approvedWeight[approvalId],
          weight_approved_unit_id: weightUnitId[approvalId]
        };
      }),
      remarks: remarks
    };

    approveMutation.mutate(approvalData);
  };



  const handleReject = () => {
    if (!remarks.trim()) {
      alert("Please enter remarks before rejecting");
      return;
    }

    const rejectData = {
      approved_entries: selectedItems.map((selectedId) => {
        const item = approvalDetails.find(
          (item) => item.approval_id === selectedId
        );
        return {
          approval_id: item.approval_id,
          is_rejected: true,
          rejection_remarks: itemRemarks[selectedId] || remarks || "Rejected",
          quantity_approved: 0
        };
      }),
    };

    rejectMutation.mutate(rejectData);
  };
  const handleSelect = (id) => {
    setApprovalDetails((prev) =>
      prev.map((item) =>
        item.approval_id === id
          ? { ...item, isSelected: !item.isSelected }
          : item
      )
    );
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  // const handleBulkApprove = () => {
  //   const approvalData = {
  //     approved_entries: selectedItems.map((approvalId) => {
  //       const item = approvalDetails.find(
  //         (item) => item.approval_id === approvalId
  //       );
  //       return {
  //         approval_id: approvalId,
  //         quantity_approved:
  //           approvedQuantity[approvalId] || item.quantity_requested,
  //       };
  //     }),
  //     remarks: remarks,
  //   };
  //   approveMutation.mutate(approvalData);
  // };

  const rejectMutation = useMutation({
    mutationFn: (rejectData) => {
      const payload = {
        approved_entries: rejectData.approved_entries.map((entry) => ({
          approval_id: entry.approval_id,
          is_rejected: true,
          rejection_remarks: entry.rejection_remarks,
        })),
      };
      return postData(
        "/inventory/approve-raw-material-coil/",
        payload
      );
    },
    onSuccess: () => {
      setApprovalDetails((prev) =>
        prev.filter((item) => !selectedItems.includes(item.approval_id))
      );
      setSelectedItems([]);
      setRemarks("");
      setItemRemarks({});

      if (approvalDetails.length <= 1) {
        router.push('/inventories');
      }

    },
  });

  if (isLoading) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;
  if (!approvalDetails.length) return <div>No pending approvals</div>;
  const columns = [
    {
      header: (
        <input
          type="checkbox"
          onChange={handleSelectAll}
          checked={approvalDetails.every((item) => item.isSelected)}
          className="w-4 h-4 rounded border-gray-300"
        />
      ),
      accessor: "checkbox",
      render: (item) => (
        <input
          type="checkbox"
          checked={item.isSelected}
          onChange={() => handleSelect(item.approval_id)}
          className="w-4 h-4 rounded border-gray-300"
        />
      ),
    },
    { header: "PO Number", accessor: "po_number" },
    { header: "Invoice Number", accessor: "invoice_number" },
    { header: "Item Name", accessor: "item_name" },
    { header: "Item Type", accessor: "item_type" },
    // Add thickness with unit
    {
      header: "Thickness",
      accessor: "thickness",
      render: (item) => (
        <span>
          {item.thickness} {item.thickness_unit?.symbol || ""}
        </span>
      )
    },
    // Add slit size with unit
    {
      header: "Slit Size",
      accessor: "slit_size",
      render: (item) => (
        <span>
          {item.slit_size} {item.slit_size_unit?.symbol || ""}
        </span>
      )
    },
    // Add blank size with unit
    {
      header: "Blank Size",
      accessor: "blank_size",
      render: (item) => (
        <span>
          {item.blank_size} {item.blank_size_unit?.symbol || ""}
        </span>
      )
    },
    {
      header: "Quantity Requested",
      accessor: "quantity_requested",
      render: (item) => (
        <span>
          {item.quantity_requested}
          {/* {item.quantity_requested_unit?.symbol || ""} */}
        </span>
      )
    },
    {
      header: "Quantity Approved",
      accessor: "quantity_approved",
      render: (item) => (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={approvedQuantity[item.approval_id] !== undefined ? approvedQuantity[item.approval_id] : item.quantity_requested}
            onChange={(e) => {
              // Store the raw input value first
              const rawValue = e.target.value;

              // If the input is empty, set to empty string (or undefined)
              if (rawValue === '') {
                setApprovedQuantity({
                  ...approvedQuantity,
                  [item.approval_id]: ''  // Allow empty value
                });
                return;
              }

              // Otherwise parse the float value
              const value = parseFloat(rawValue);

              // Handle NaN case
              if (isNaN(value)) {
                return; // Don't update state for invalid numbers
              }

              // Check if value is within allowed range
              if (value <= item.quantity_requested) {
                setApprovedQuantity({
                  ...approvedQuantity,
                  [item.approval_id]: value
                });

                // Calculate weight based on quantity
                if (item.thickness && item.blank_size && item.slit_size) {
                  // Convert mm to m³
                  const blankSize = parseFloat(item.blank_size) / 1000;
                  const slitSize = parseFloat(item.slit_size) / 1000;
                  const thickness = parseFloat(item.thickness) / 1000;

                  // Calculate volume in m³
                  const volume = blankSize * slitSize * thickness;

                  // Calculate weight in kg (density of steel is 7865 kg/m³)
                  let calculatedWeight = value * (volume * 7865);

                  // Get the selected weight unit
                  const selectedWeightUnit = unitsData?.data?.find(u => u.id === parseInt(weightUnitId[item.approval_id]));

                  // Convert to tonnes if needed
                  if (selectedWeightUnit?.symbol === 'T') {
                    calculatedWeight = calculatedWeight / 1000;
                  }

                  // Update the weight
                  setApprovedWeight({
                    ...approvedWeight,
                    [item.approval_id]: calculatedWeight
                  });
                }
              }
            }}
            className="w-20 h-8 px-2 text-center border rounded"
          />
          {/* <span>{item.quantity_requested_unit?.symbol || ""}</span> */}
        </div>
      )
    },
    {
      header: "Price",
      accessor: "raw_material_price",
      render: (item) => (
        <span>₹{item.raw_material_price?.toFixed(2) || "0.00"}</span>
      )
    },
    { header: "Description", accessor: "item_description" },
    { header: "Approval Type", accessor: "approval_type" },
    // Add inventory quantities
    {
      header: "Total Quantity",
      accessor: "raw_material_total_quantity",
      render: (item) => (
        <span>{item.raw_material_total_quantity?.toFixed(2) || "0.00"}</span>
      )
    },
    {
      header: "Used Quantity",
      accessor: "raw_material_used_quantity",
      render: (item) => (
        <span>{item.raw_material_used_quantity?.toFixed(2) || "0.00"}</span>
      )
    },
    {
      header: "Weight Requested",
      accessor: "weight_requested",
      render: (item) => (
        <span>
          {item.weight_requested} {item.weight_requested_unit?.symbol || ""}
        </span>
      )
    },
    {
      header: "Weight Approved",
      accessor: "weight_approved",
      render: (item) => (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={approvedWeight[item.approval_id] !== undefined ? approvedWeight[item.approval_id] : (item.weight_requested || '')}
            onChange={(e) => {
              // Allow empty string or valid number
              const inputValue = e.target.value;

              // If input is empty, store empty string
              if (inputValue === '') {
                setApprovedWeight({
                  ...approvedWeight,
                  [item.approval_id]: ''
                });
                return;
              }

              // Otherwise parse as float and check against max value
              const value = parseFloat(inputValue);
              if (!isNaN(value) && value <= item.weight_requested) {
                setApprovedWeight({
                  ...approvedWeight,
                  [item.approval_id]: value
                });
              }
            }}
            min="0"
            max={item.weight_requested}
            step="any"
            className="w-20 h-8 px-2 text-center border rounded"
          />

          <select
            value={weightUnitId[item.approval_id] || ''}
            onChange={(e) => setWeightUnitId({
              ...weightUnitId,
              [item.approval_id]: parseInt(e.target.value)
            })}
            className="w-24 h-8 px-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
            placeholder="Select Unit"
          >
            <option value="" disabled>Select Unit</option>
            {unitsData?.data?.filter(unit => unit.type === 'WEIGHT').map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.symbol})
              </option>
            ))}
          </select>
        </div>
      )
    },
    // Add creation date
    {
      header: "Created Date",
      accessor: "created_at",
      render: (item) => (
        <span>
          {new Date(item.created_at).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      )
    }
  ];




  return (
    <div className="p-4 md:p-6 lg:p-8 bg-white rounded-lg shadow-lg max-w-[95vw] mx-auto">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 text-sm md:text-base bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <button
            onClick={handleBulkApprove}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all duration-200 text-sm md:text-base flex items-center justify-center"
          >
            <span className="mr-2">✓</span>
            Approve ({selectedItems.length})
          </button>

          <button
            onClick={handleReject}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200 text-sm md:text-base flex items-center justify-center"
          >
            <span className="mr-2">×</span>
            Reject ({selectedItems.length})
          </button>

          {selectedItems.length > 0 && (
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks..."
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[200px] text-sm"
            />
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <div className="min-w-full">
          <table className="w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                {columns.map((column) => (
                  <th
                    key={column.accessor}
                    className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-indigo-900 tracking-wider whitespace-nowrap"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {approvalDetails.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {columns.map((column) => (
                    <td
                      key={column.accessor}
                      className="px-4 py-3 text-xs md:text-sm text-gray-700 whitespace-nowrap"
                    >
                      {column.render ? column.render(item) : item[column.accessor] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loading className="w-8 h-8 text-indigo-600" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          Error: {error.message}
        </div>
      )}
    </div>

  );
};

export default ApprovalDetailsPage;
