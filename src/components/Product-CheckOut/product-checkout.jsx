import { useState, useEffect, useMemo, useCallback } from 'react';
import { useProductCheckoutSubmission } from '@/hooks/useProductCheckoutSubmission';
import useCheckoutForm from '@/hooks/useCheckoutForm';

export const ProductCheckoutModal = ({ isOpen, onClose, itemData }) => {
  const [formData, setFormData] = useState({
    product_quantity: '',
    product_quantity_unit_id: '',
    product_weight: '',
    product_weight_unit_id: '',
    checkout_date: new Date(),
    checkout_remarks: ''
  });

  // Track calculation state to prevent infinite loops
  const [isCalculating, setIsCalculating] = useState(false);

  // Add validation errors state
  const [validationErrors, setValidationErrors] = useState({});

  // Track which fields have been touched/interacted with
  const [touchedFields, setTouchedFields] = useState({});

  // Use the checkout form hook to get units and other functionality
  const {
    formState,
    getUnitsByType,
    isLoading,
    errors
  } = useCheckoutForm(itemData);

  // Use the submission hook
  const { isSubmitting, submitError, hasSubmitted, successMessage, submitProductCheckout } =
    useProductCheckoutSubmission(onClose);

  // Calculate weight per unit based on item data
  const weightPerUnit = useMemo(() => {
    if (!itemData?.total_quantity || !itemData?.total_weight) return 0;

    const totalQuantity = parseFloat(itemData.total_quantity);
    const totalWeight = parseFloat(itemData.total_weight);

    if (totalQuantity <= 0) return 0;
    return totalWeight / totalQuantity;
  }, [itemData]);

  // Handle quantity change to calculate weight
  const handleQuantityChange = useCallback((value) => {
    if (isCalculating) return;
    setIsCalculating(true);

    const quantity = parseFloat(value) || 0;
    const calculatedWeight = (quantity * weightPerUnit).toFixed(6);

    setFormData(prev => ({
      ...prev,
      product_quantity: value,
      product_weight: calculatedWeight
    }));

    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      product_quantity: true,
      product_weight: true
    }));

    setTimeout(() => setIsCalculating(false), 0);
  }, [isCalculating, weightPerUnit]);

  // Handle weight change to calculate quantity
  const handleWeightChange = useCallback((value) => {
    if (isCalculating) return;
    setIsCalculating(true);

    const weight = parseFloat(value) || 0;
    let calculatedQuantity = 0;

    if (weightPerUnit > 0) {
      calculatedQuantity = Math.round(weight / weightPerUnit);
    }

    setFormData(prev => ({
      ...prev,
      product_weight: value,
      product_quantity: calculatedQuantity.toString()
    }));

    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      product_weight: true,
      product_quantity: true
    }));

    setTimeout(() => setIsCalculating(false), 0);
  }, [isCalculating, weightPerUnit]);

  // Handle form input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    if (name === 'product_quantity') {
      handleQuantityChange(value);
    } else if (name === 'product_weight') {
      handleWeightChange(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // Mark field as touched
      setTouchedFields(prev => ({
        ...prev,
        [name]: true
      }));
    }
  }, [handleQuantityChange, handleWeightChange]);

  // Handle field blur to mark as touched
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  // Set default units when they're loaded
  useEffect(() => {
    if (formState.units && formState.units.length > 0) {
      // Find the Kilograms unit (id: 3 based on your API response)
      const kilogramsUnit = formState.units.find(unit => unit.name === 'Kilograms' || unit.id === 3);
      const numbersUnit = formState.units.find(unit => unit.name === 'Numbers' || unit.id === 5);

      if (kilogramsUnit && !formData.product_weight_unit_id) {
        setFormData(prev => ({
          ...prev,
          product_weight_unit_id: kilogramsUnit.id.toString()
        }));
      }

      if (numbersUnit && !formData.product_quantity_unit_id) {
        setFormData(prev => ({
          ...prev,
          product_quantity_unit_id: numbersUnit.id.toString()
        }));
      }
    }
  }, [formState.units, formData.product_weight_unit_id, formData.product_quantity_unit_id]);

  // Compute validation errors for all fields
  const formValidation = useMemo(() => {
    const errors = {};

    // Check required fields
    const requiredFields = [
      'product_quantity',
      'product_quantity_unit_id',
      'product_weight',
      'product_weight_unit_id',
      'checkout_remarks'
    ];

    // Check each required field
    requiredFields.forEach(field => {
      const value = formData[field];
      if (value === undefined || value === null || value === '') {
        errors[field] = 'This field is required';
      }
    });

    // Validate quantity
    const productQuantity = parseFloat(formData.product_quantity);
    if (!isNaN(productQuantity)) {
      if (productQuantity <= 0) {
        errors.product_quantity = 'Quantity must be greater than zero';
      } else {
        const availableQuantity = (itemData?.total_quantity || 0) - (itemData?.used_quantity || 0);
        if (productQuantity > availableQuantity) {
          errors.product_quantity = `Quantity cannot exceed available quantity (${availableQuantity})`;
        }
      }
    }

    // Validate weight
    const productWeight = parseFloat(formData.product_weight);
    if (!isNaN(productWeight)) {
      if (productWeight <= 0) {
        errors.product_weight = 'Weight must be greater than zero';
      } else {
        const availableWeight = (itemData?.total_weight || 0) - (itemData?.used_weight || 0);
        if (productWeight > availableWeight) {
          errors.product_weight = `Weight cannot exceed available weight (${availableWeight})`;
        }
      }
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  }, [formData, itemData]);

  // Update validation errors in useEffect
  useEffect(() => {
    // Only show errors for touched fields
    const filteredErrors = {};
    Object.keys(formValidation.errors).forEach(field => {
      if (touchedFields[field]) {
        filteredErrors[field] = formValidation.errors[field];
      }
    });

    setValidationErrors(filteredErrors);
  }, [formValidation, touchedFields]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Mark all fields as touched when submitting
    const allFields = [
      'product_quantity',
      'product_quantity_unit_id',
      'product_weight',
      'product_weight_unit_id',
      'checkout_remarks'
    ];

    const allTouched = allFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});

    setTouchedFields(allTouched);

    // Only proceed if form is valid
    if (!formValidation.isValid || isSubmitting) return;

    try {
      await submitProductCheckout(formData, itemData);
      if (successMessage) {
        console.log(successMessage);
      }
    } catch (error) {
      console.error("Form submission failed:", error);
    }
  }, [formValidation.isValid, isSubmitting, submitProductCheckout, formData, itemData, successMessage]);

  // Get the units for the dropdowns
  const quantityUnits = useMemo(() => getUnitsByType('NUMBER'), [getUnitsByType]);
  const weightUnits = useMemo(() => getUnitsByType('WEIGHT'), [getUnitsByType]);

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-white rounded-xl p-8 w-full max-w-[65%] shadow-2xl animate-fade-in-up flex gap-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Left side - Product Details */}
        <div className="w-[400px] bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Product Details
          </h3>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-700 mb-3">
                Basic Information
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Product Name:</span>
                  <span className="font-medium text-sm">{itemData?.item_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Category:</span>
                  <span className="font-medium text-sm">{itemData?.category_name}</span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-gray-600 text-sm">Description:</span>
                  <span className="font-medium text-sm">
                    {itemData?.item_description}
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
                    {String(itemData?.total_quantity || "0")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Used Quantity:</span>
                  <span className="font-medium text-sm">
                    {String(itemData?.used_quantity || "0")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Available Quantity:</span>
                  <span className="font-medium text-green-600 text-sm">
                    {String((itemData?.total_quantity || 0) - (itemData?.used_quantity || 0))}
                  </span>
                </div>
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
                    {String(itemData?.total_weight || "0.0")} {itemData?.weight_unit_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Used Weight:</span>
                  <span className="font-medium text-sm">
                    {String(itemData?.used_weight || "0.0")} {itemData?.weight_unit_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Available Weight:</span>
                  <span className="font-medium text-green-600 text-sm">
                    {String(((itemData?.total_weight || 0) - (itemData?.used_weight || 0)).toFixed(1))} {itemData?.weight_unit_name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Checkout Form */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Product Checkout
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
                    {new Date().toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-lg font-semibold text-orange-500">
                    {new Date().toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Information Section */}
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">
                Checkout Information
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
                      name="product_quantity"
                      value={formData.product_quantity}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-lg border-gray-300 py-1 px-1 focus:ring-orange-500 focus:border-orange-500 text-xs ${validationErrors.product_quantity ? 'border-red-500' : ''
                        }`}
                      placeholder="Enter product quantity"
                    />
                    {validationErrors.product_quantity && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.product_quantity}</p>
                    )}
                  </div>
                  <div className="w-1/3">
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Quantity Unit
                    </label>
                    <select
                      name="product_quantity_unit_id"
                      value={formData.product_quantity_unit_id}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-lg border-gray-300 py-1 px-1 focus:ring-orange-500 focus:border-orange-500 text-xs ${validationErrors.product_quantity_unit_id ? 'border-red-500' : ''
                        }`}
                    >
                      <option value="">Select Unit</option>
                      {isLoading.units ? (
                        <option disabled>Loading units...</option>
                      ) : errors.units ? (
                        <option disabled>Error loading units</option>
                      ) : (
                        quantityUnits.map((unit) => (
                          <option
                            key={`quantity-${unit.id}`}
                            value={unit.id}
                            className="text-xs"
                          >
                            {unit.name}
                          </option>
                        ))
                      )}
                    </select>
                    {validationErrors.product_quantity_unit_id && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.product_quantity_unit_id}</p>
                    )}
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
                      step="any"
                      name="product_weight"
                      value={formData.product_weight}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-lg border-gray-300 py-1 px-1 focus:ring-orange-500 focus:border-orange-500 text-xs ${validationErrors.product_weight ? 'border-red-500' : ''
                        }`}
                      placeholder="Enter product weight"
                    />
                    {validationErrors.product_weight && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.product_weight}</p>
                    )}
                  </div>
                  <div className="w-1/3">
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Weight Unit
                    </label>
                    <select
                      name="product_weight_unit_id"
                      value={formData.product_weight_unit_id}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-lg border-gray-300 py-1 px-1 focus:ring-orange-500 focus:border-orange-500 text-xs ${validationErrors.product_weight_unit_id ? 'border-red-500' : ''
                        }`}
                    >
                      <option value="">Select Unit</option>
                      {isLoading.units ? (
                        <option disabled>Loading units...</option>
                      ) : errors.units ? (
                        <option disabled>Error loading units</option>
                      ) : (
                        weightUnits.map((unit) => (
                          <option
                            key={`weight-${unit.id}`}
                            value={unit.id}
                            className="text-xs"
                          >
                            {unit.name}
                          </option>
                        ))
                      )}
                    </select>
                    {validationErrors.product_weight_unit_id && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.product_weight_unit_id}</p>
                    )}
                  </div>
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
                    name="checkout_date"
                    value={formData.checkout_date instanceof Date ?
                      formData.checkout_date.toISOString().split('T')[0] :
                      new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        checkout_date: new Date(e.target.value)
                      }));
                      setTouchedFields(prev => ({
                        ...prev,
                        checkout_date: true
                      }));
                    }}
                    onBlur={handleBlur}
                    className="w-full rounded-lg border-gray-300 py-1 px-1 focus:ring-orange-500 focus:border-orange-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Check-out Remarks
                  </label>
                  <textarea
                    name="checkout_remarks"
                    value={formData.checkout_remarks}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Enter check-out remarks"
                    className={`w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500 text-xs ${validationErrors.checkout_remarks ? 'border-red-500' : ''
                      }`}
                    rows="3"
                  />
                  {validationErrors.checkout_remarks && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.checkout_remarks}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Error message */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {submitError}
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
                disabled={isSubmitting || hasSubmitted || !formValidation.isValid}
                className={`px-6 py-2.5 rounded-lg transition-colors ${!isSubmitting && !hasSubmitted && formValidation.isValid
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
      </div>
    </div>
  );
};

