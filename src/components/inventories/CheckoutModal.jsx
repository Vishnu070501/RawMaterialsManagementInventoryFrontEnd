import useCheckoutForm from "@/hooks/useCheckoutForm";
import { useCheckoutSubmission } from "@/hooks/useCheckoutSubmission";
import { useState } from "react"; // Add this import

export const CheckoutModal = ({ isOpen, onClose, itemData }) => {
  // Add state for the checkbox
  const [isCoilForSlitting, setIsCoilForSlitting] = useState(false);
  
  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };
  
  // Use the form and data fetching hook
  const {
    formState,
    setFormState,
    updateFormData,
    isFormValid,
    checkInDate,
    setCheckInDate,
    checkOutDate,
    setCheckOutDate,
    currentDateTime,
    products,
    sequences,
    steps,
    selectedProduct,
    setSelectedProduct,
    isLoading,
    errors,
    getUnitsByType,
    handleRawQuantityChange,
    handleRawWeightChange,
    handleProductQuantityChange,
    handleProductWeightChange,
    handleScrapQuantityChange,
    handleScrapWeightChange,
    handleUnitChange,
    customTotalWeight,
    setCustomTotalWeight,
    customTotalWeightUnitId,
    setCustomTotalWeightUnitId,
    handleCustomTotalWeightChange,
    selectedProductName,
  } = useCheckoutForm(itemData);

  // Use the submission hook
  const { isSubmitting, submitError, submitCheckout, hasSubmitted } =
    useCheckoutSubmission(onClose);
    
  const isCoil = itemData?.model_type === "coil";
  
  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid(isCoilForSlitting) || isSubmitting) return;
  
    try {
      await submitCheckout(
        formState.formData,
        itemData,
        selectedProduct,
        steps,
        checkInDate,
        checkOutDate,
        isCoilForSlitting // Pass the checkbox state to the submission function
      );
    } catch (error) {
      console.error("Form submission failed:", error);
    }
  };
  

  // Reusable input field component
  const InputField = ({ label, type, value, onChange, options = null }) => (
    <div className="flex-1">
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      {type === "select" ? (
        <select
          value={value}
          onChange={onChange}
          className="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500 text-xs"
        >
          <option value="">Select {label}</option>
          {options?.map((option) => (
            <option key={option.id} value={option.id} className="text-xs">
              {option.name}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500 text-xs"
        />
      )}
    </div>
  );

  // Function to handle product selection
  const handleProductSelection = (e) => {
    const productId = e.target.value;
    setSelectedProduct(productId);
    
    if (productId) {
      const selectedProd = products.find(p => p.id.toString() === productId);
      if (selectedProd) {
        console.log("Selected product in modal:", selectedProd.item_name);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-8 w-full max-w-[72%] shadow-2xl animate-fade-in-up flex gap-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Left side - Checkout Form */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Checkout Details
              {selectedProductName && isCoil && (
                <span className="ml-2 text-orange-500 text-lg">
                  - {selectedProductName}
                </span>
              )}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-medium text-gray-700 text-sm">
                    Current Date & Time
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-lg font-semibold text-gray-800">
                    {currentDateTime.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-lg font-semibold text-orange-500">
                    {currentDateTime.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Add the checkbox for coil sent for slitting */}
            {isCoil && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="coilForSlitting"
                    checked={isCoilForSlitting}
                    onChange={(e) => setIsCoilForSlitting(e.target.checked)}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="coilForSlitting" className="ml-2 text-sm font-medium text-gray-700">
                    Coil sent for slitting
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  Check this box if the coil is being sent for slitting process only.
                </p>
              </div>
            )}

            {/* Product Process Section - Only show if not coil for slitting */}
            {(!isCoil || !isCoilForSlitting) && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Product Process
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {/* Product Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Select Product
                    </label>
                    <select
                      value={selectedProduct || ""}
                      onChange={handleProductSelection}
                      className="w-full rounded-lg border-gray-300 py-1 px-1 shadow-sm focus:ring-orange-500 focus:border-orange-500 text-xs"
                    >
                      <option value="">Select Product</option>
                      {Array.isArray(products) && products.length > 0 ? (
                        products.map((product) => (
                          <option
                            key={`product-${product.id}`}
                            value={product.id}
                            className="text-xs"
                          >
                            {product.item_name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No products available
                        </option>
                      )}
                    </select>
                  </div>
                  {/* Sequence Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Select Sequence
                    </label>
                    <select
                      value={formState.formData.product_step}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          formData: {
                            ...prev.formData,
                            product_step: e.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-lg py-1 px-1 border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 text-xs"
                      disabled={!selectedProduct}
                    >
                      <option value="">Select Sequence</option>
                      {sequences?.map((sequence) => (
                        <option
                          key={`sequence-${sequence.sequence_id}`}
                          value={sequence.sequence_id}
                          className="text-xs"
                        >
                          {sequence.sequence_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Select Step
                    </label>
                    <select
                      value={formState.formData.step_id}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          formData: {
                            ...prev.formData,
                            step_id: e.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-lg border-gray-300 py-1 px-1 shadow-sm focus:ring-orange-500 focus:border-orange-500 text-xs"
                      disabled={!formState.formData.product_step}
                    >
                      <option value="">Select Step</option>
                      {steps.map((step) => (
                        <option
                          key={`step-${step.id}`}
                          value={step.id}
                          className="text-xs"
                        >
                          {step.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Coil Total Weight Section - Always show for coils */}
            {isCoil && (
  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
    <h3 className="font-semibold text-gray-800 mb-4">
      Custom Coil Total Weight
      <span className="ml-2 text-xs text-orange-600 font-normal">
        (Required)
      </span>
    </h3>
    <div className="flex gap-4">
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Total Available Weight
        </label>
        <input
          type="number"
          min="0"
          step="any"
          value={customTotalWeight}
          onChange={(e) =>
            handleCustomTotalWeightChange(e.target.value)
          }
          placeholder="Enter total weight"
          className="w-full rounded-lg border-gray-300 py-1 px-1 focus:ring-orange-500 focus:border-orange-500 text-xs"
          required
        />
      </div>
      <div className="w-1/3">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Weight Unit
        </label>
        <select
          value={customTotalWeightUnitId}
          onChange={(e) =>
            setCustomTotalWeightUnitId(e.target.value)
          }
          className="w-full rounded-lg border-gray-300 py-1 px-1 focus:ring-orange-500 focus:border-orange-500 text-xs"
          required
        >
          <option value="">Select Unit</option>
          {getUnitsByType("WEIGHT").map((unit) => (
            <option
              key={`custom-total-weight-unit-${unit.id}`}
              value={unit.id}
              className="text-xs"
            >
              {unit.name}
            </option>
          ))}
        </select>
      </div>
    </div>
    <p className="text-xs text-gray-500 mt-2">
      Enter the actual available weight of the coil. This weight will be used to calculate the weight per unit.
    </p>
  </div>
)}

{/* Always show Raw Material Quantity Section for all items */}
<div className="bg-gray-50 p-4 rounded-lg">
  <h3 className="font-semibold text-gray-800 mb-4">
    {isCoil ? `Coil Details${selectedProductName ? ` - ${selectedProductName}` : ''}` : "Raw Material Quantity Details"}
  </h3>
  <div className="grid grid-cols-2 gap-4">
    {/* Quantity and Unit */}
    <div className="flex gap-4">
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Quantity
        </label>
        <input
          type="number"
          min="0"
          step={isCoil ? "any" : "1"}
          value={formState.formData.quantity}
          onChange={(e) =>
            handleRawQuantityChange(e.target.value)
          }
          className="w-full rounded-lg border-gray-300 py-1 px-1 focus:ring-orange-500 focus:border-orange-500 text-xs"
        />
      </div>
      <div className="w-1/3">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Unit
        </label>
        <select
          value={formState.formData.quantity_unit_id}
          onChange={(e) =>
            setFormState((prev) => ({
              ...prev,
              formData: {
                ...prev.formData,
                quantity_unit_id: e.target.value,
              },
            }))
          }
          className="w-full rounded-lg border-gray-300 py-1 px-1 focus:ring-orange-500 focus:border-orange-500 text-xs"
        >
          <option value="">Unit</option>
          {getUnitsByType("NUMBER").map((unit) => (
            <option
              key={`quantity-${unit.id}-${Math.random()}`}
              value={unit.id}
              className="text-xs"
            >
              {unit.name}
            </option>
          ))}
        </select>
      </div>
    </div>

    {/* Weight and Unit */}
    <div className="flex gap-4">
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Weight
        </label>
        <input
          type="number"
          min="0"
          step="any" // Add this to allow decimal increments
          value={formState.formData.weight}
          onChange={(e) => handleRawWeightChange(e.target.value)}
          className="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500 text-xs"
        />
      </div>
      <div className="w-1/3">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Unit
        </label>
        <select
          value={formState.formData.weight_unit_id}
          onChange={(e) =>
            handleUnitChange("weight_unit_id", e.target.value)
          }
          className="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500 text-xs"
        >
          <option value="">Unit</option>
          {getUnitsByType("WEIGHT").map((unit) => (
            <option
              key={`weight-unit-${unit.id}`}
              value={unit.id}
              className="text-xs"
            >
              {unit.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
</div>

{/* Only show the following sections if not a coil for slitting */}
{(!isCoil || !isCoilForSlitting) && (
  <div className="flex flex-col gap-6">
    {/* Product Information Section */}
    <div className="bg-white p-5 rounded-xl border border-gray-200">
      <h3 className="font-semibold text-gray-800 mb-4">
        Product Information
        {isCoil && selectedProductName && (
          <span className="ml-2 text-orange-500 text-sm">
            - {selectedProductName}
          </span>
        )}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Product Quantity and Unit */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Product Quantity
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={formState.formData.product_quantity}
              onChange={(e) =>
                handleProductQuantityChange(e.target.value)
              }
              className="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500 text-xs"
              placeholder="Enter product quantity"
            />
          </div>
          <div className="w-1/3">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Quantity Unit
            </label>
            <select
              value={formState.formData.product_quantity_unit_id}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  formData: {
                    ...prev.formData,
                    product_quantity_unit_id: e.target.value,
                  },
                }))
              }
              className="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500 text-xs"
            >
              <option value="">Select Unit</option>
              {getUnitsByType("NUMBER").map((unit) => (
                <option
                  key={`product-quantity-${unit.id}-${Math.random()}`}
                  value={unit.id}
                  className="text-xs"
                >
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Weight and Unit */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Product Weight
            </label>
            <input
              type="number"
              min="0"
              step="any" // Add this to allow decimal increments
              value={formState.formData.product_weight}
              onChange={(e) =>
                handleProductWeightChange(e.target.value)
              }
              className="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500 text-xs"
              placeholder="Enter product weight"
            />
          </div>
          <div className="w-1/3">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Weight Unit
            </label>
            <select
              value={formState.formData.product_weight_unit_id}
              onChange={(e) =>
                handleUnitChange(
                  "product_weight_unit_id",
                  e.target.value
                )
              }
              className="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500 text-xs"
            >
              <option value="">Select Unit</option>
              {getUnitsByType("WEIGHT").map((unit) => (
                <option
                  key={`product-weight-unit-${unit.id}`}
                  value={unit.id}
                  className="text-xs"
                >
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>

    {/* Scrap Information Section */}
    <div className="bg-white p-5 rounded-xl border border-gray-200">
      <h3 className="font-semibold text-gray-800 mb-4">
        Scrap Information
        {isCoil && selectedProductName && (
          <span className="ml-2 text-orange-500 text-sm">
            - {selectedProductName}
          </span>
        )}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Scrap Quantity and Unit - Only show for non-coil items */}
        {!isCoil && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Scrap Quantity
              </label>
              <input
                type="number"
                min="0"
                value={formState.formData.scrap_quantity}
                onChange={(e) =>
                  handleScrapQuantityChange(e.target.value)
                }
                className="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500 text-xs"
                placeholder="Enter scrap quantity"
              />
            </div>
            <div className="w-1/3">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Quantity Unit
              </label>
              <select
                value={formState.formData.scrap_quantity_unit_id}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    formData: {
                      ...prev.formData,
                      scrap_quantity_unit_id: e.target.value,
                    },
                  }))
                }
                className="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500 text-xs"
              >
                <option value="">Select Unit</option>
                {getUnitsByType("NUMBER").map((unit) => (
                  <option
                    key={`scrap-quantity-${unit.id}-${Math.random()}`}
                    value={unit.id}
                    className="text-xs"
                  >
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Scrap Weight and Unit */}
        <div className={isCoil ? "col-span-2" : ""}>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Scrap Weight
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={formState.formData.scrap_weight}
                onChange={(e) => handleScrapWeightChange(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500 text-xs"
                placeholder="Enter scrap weight"
              />
            </div>
            <div className="w-1/3">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Weight Unit
              </label>
              <select
                value={formState.formData.scrap_weight_unit_id}
                onChange={(e) =>
                  handleUnitChange("scrap_weight_unit_id", e.target.value)
                }
                className="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500 text-xs"
              >
                <option value="">Select Unit</option>
                {getUnitsByType("WEIGHT").map((unit) => (
                  <option
                    key={`scrap-weight-unit-${unit.id}`}
                    value={unit.id}
                    className="text-xs"
                  >
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {isCoil && (
        <p className="text-xs text-gray-500 mt-3">
          For coil items, scrap weight is calculated as the difference between total weight and product weight.
        </p>
      )}
    </div>

    
    {/* Check-in Details Section */}
    <div className="bg-white p-5 rounded-xl border border-gray-200 mb-6">
      <h3 className="font-semibold text-gray-800 mb-4">
        Check-in Details
      </h3>
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="font-medium text-gray-700 text-sm">
              Check-in Date
            </span>
          </div>
          <input
            type="date"
            value={
              checkOutDate instanceof Date && !isNaN(checkOutDate)
                ? checkOutDate.toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0]
            }
            onChange={(e) => setCheckOutDate(new Date(e.target.value))}
            className="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Check-in Remarks
          </label>
          <textarea
            value={formState.formData.checkin_remarks}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                formData: {
                  ...prev.formData,
                  checkin_remarks: e.target.value,
                },
              }))
            }
            placeholder="Enter check-in remarks"
            className="w-full rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500 text-xs"
            rows="3"
          />
        </div>
      </div>
    </div>

    {/* Check-out Details Section */}
    <div className="bg-white p-5 rounded-xl border border-gray-200">
      <h3 className="font-semibold text-gray-800 mb-4">
        Check-out Details
      </h3>
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-5 h-5 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="font-medium text-gray-700 text-sm">
              Check-out Date
            </span>
          </div>
          <input
            type="date"
            value={
              checkInDate instanceof Date && !isNaN(checkInDate)
                ? checkInDate.toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0]
            }
            onChange={(e) => setCheckInDate(new Date(e.target.value))}
            className="w-full rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Check-out Remarks
          </label>
          <textarea
            value={formState.formData.checkout_remarks}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                formData: {
                  ...prev.formData,
                  checkout_remarks: e.target.value,
                },
              }))
            }
            placeholder="Enter check-out remarks"
            className="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500 text-xs"
            rows="3"
          />
        </div>
      </div>
    </div>
  </div>
)}


            

            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
  type="submit"
  disabled={isSubmitting || hasSubmitted || !isFormValid(isCoilForSlitting)}
  className={`px-6 py-2.5 rounded-lg transition-colors ${
    !isSubmitting && !hasSubmitted && isFormValid(isCoilForSlitting)
      ? "bg-orange-500 text-white hover:bg-orange-600"
      : "bg-gray-300 text-gray-500 cursor-not-allowed"
  }`}
>
  {isSubmitting
    ? "Processing..."
    : hasSubmitted
    ? "Submitted"
    : "Submit Checkout"}
</button>
            </div>
          </form>
        </div>

        {/* Right side - Inventory Details */}
        <div className="w-[400px] bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Inventory Details
            {isCoil && selectedProductName && (
              <span className="ml-2 text-orange-500 text-sm">
                - {selectedProductName}
              </span>
            )}
          </h3>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-700 mb-3">
                Basic Information
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Type:</span>
                  <span className="font-medium text-sm">
                    {itemData?.model_type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">NAME:</span>
                  <span className="font-medium text-sm">
                    {itemData?.item_name}
                  </span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-gray-600 text-sm">DESCRIPTION:</span>
                  <span className="font-medium text-sm">
                    {itemData?.item_description}
                  </span>
                </div>
              </div>
            </div>

            {/* Size Details */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-700 mb-3">
                Size Information
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Blank Size:</span>
                  <span className="font-medium text-sm">
                    {itemData?.blank_size}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Slit Size:</span>
                  <span className="font-medium text-sm">
                    {itemData?.slit_size}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Thickness:</span>
                  <span className="font-medium text-sm">
                    {itemData?.thickness}
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Details */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-700 mb-3">
                Quantity Information
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Total Quantity:</span>
                  <span className="font-medium text-sm">
                    {String(itemData?.total_quantity || "")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Used Quantity:</span>
                  <span className="font-medium text-sm">
                    {String(itemData?.used_quantity || "")}
                  </span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-gray-600">Available Quantity:</span>
                  <span className="font-medium text-green-600">
                  {String((itemData?.total_quantity || "") - (itemData?.used_quantity || ""))}
                  </span>
                </div> */}
              </div>
            </div>

            {/* Weight Details */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-700 mb-3">
                Weight Information
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Total Weight:</span>
                  <span className="font-medium text-sm">
                    {String(itemData?.total_weight || "")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Used Weight:</span>
                  <span className="font-medium text-sm">
                    {String(itemData?.used_weight || "")}
                  </span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-gray-600">Available Weight:</span>
                  <span className="font-medium text-green-600">
                  {String((itemData?.total_weight || "") - (itemData?.used_weight || ""))}
                  </span>
                </div> */}
              </div>
            </div>

            {/* Creation Info */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-700 mb-3">
                Additional Details
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Created Date:</span>
                  <span className="font-medium text-sm">
                    {new Date(itemData?.created_at).toLocaleDateString(
                      "en-IN",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
