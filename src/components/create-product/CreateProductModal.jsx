"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { postData, getData } from "@/api/API";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
/////////////////
export default function CreateProductModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    productName: "",
    productDescription: "",
    thickness: "",
    slitSize: "",
    blankSize: "",
  });
  const [thicknessUnitId, setThicknessUnitId] = useState("");
  const [slitSizeUnitId, setSlitSizeUnitId] = useState("");
  const [blankSizeUnitId, setBlankSizeUnitId] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    productName: "",
    thickness: "",
    thicknessUnitId: "",
    slitSize: "",
    slitSizeUnitId: "",
    blankSize: "",
    blankSizeUnitId: ""
  });

  const { data: unitsData } = useQuery({
    queryKey: ['units'],
    queryFn: () => getData('/master/units/'),
  });

  // Validate form whenever inputs change
  useEffect(() => {
    validateForm();
  }, [formData, thicknessUnitId, slitSizeUnitId, blankSizeUnitId]);

  const validateForm = () => {
    const errors = {
      productName: !formData.productName ? "Product name is required" : "",
      thickness: !formData.thickness ? "Thickness value is required" : "",
      thicknessUnitId: !thicknessUnitId ? "Thickness unit is required" : "",
      slitSize: !formData.slitSize ? "Slit size value is required" : "",
      slitSizeUnitId: !slitSizeUnitId ? "Slit size unit is required" : "",
      blankSize: !formData.blankSize ? "Blank size value is required" : "",
      blankSizeUnitId: !blankSizeUnitId ? "Blank size unit is required" : ""
    };

    setFieldErrors(errors);
    // Check if all required fields are filled
    const isValid = Object.values(errors).every(error => error === "");
    setFormValid(isValid);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // Double-check validation before submission
    if (!formValid) {
      setError("Please fill in all required fields and select all required units");
      return;
    }
    setIsSubmitting(true);

    const newProduct = {
      product_data: {
        product_name: formData.productName,
        product_description: formData.productDescription,
        thickness: parseFloat(formData.thickness) || 0,
        thickness_unit_id: parseInt(thicknessUnitId),
        slit_size: parseFloat(formData.slitSize) || 0,
        slit_size_unit_id: parseInt(slitSizeUnitId),
        blank_size: parseFloat(formData.blankSize) || 0,
        blank_size_unit_id: parseInt(blankSizeUnitId),
        // Hardcoded values as requested
        weight_unit_id: 4,
        quantity_unit_id: 5
      }
    };

    try {
      const response = await postData("/inventory/create-product/", newProduct);
      if (response && response.success) {
        // Reset form
        setFormData({
          productName: "",
          productDescription: "",
          thickness: "",
          slitSize: "",
          blankSize: "",
        });
        setThicknessUnitId("");
        setSlitSizeUnitId("");
        setBlankSizeUnitId("");
        // Call success callback
        if (onSuccess) {
          onSuccess(response);
        }
        // Close modal
        onClose();
      } else {
        setError(response?.message || "Failed to create product");
      }
    } catch (error) {
      setError(error.message || "An error occurred while creating the product");
      console.error("Error creating product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          <div className="bg-orange-400 px-6 py-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-extrabold text-white">Create New Product</h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-1 text-orange-100">Enter the product details below</p>
          </div>
          <div className="max-h-[80vh] overflow-y-auto">
            {/* Integrated Product Form */}
            <form onSubmit={handleSubmit} className="px-6 py-8 sm:p-10 space-y-8 animate-fadeIn">
              <div className="space-y-6">
                {/* Product Information Section */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Product Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        Product Name <span className="border-gray-200">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.productName}
                        onChange={(e) => handleInputChange('productName', e.target.value)}
                        required
                        className={`mt-2 block w-full px-4 py-3 border ${fieldErrors.productName ? 'border-gray-200' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-150 shadow-sm`}
                        placeholder="Enter product name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        Product Description
                      </label>
                      <textarea
                        value={formData.productDescription}
                        onChange={(e) => handleInputChange('productDescription', e.target.value)}
                        rows="4"
                        className="mt-2 block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-150 shadow-sm"
                        placeholder="Describe the product specifications and features"
                      />
                    </div>
                  </div>
                </div>

                {/* Measurements Section */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Product Dimensions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Thickness */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <label className="block text-sm font-semibold text-gray-700">
                        Thickness <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="number"
                          step="0.01"
                          value={formData.thickness}
                          onChange={(e) => handleInputChange('thickness', e.target.value)}
                          required
                          className={`block w-2/3 px-1 py-1 border ${fieldErrors.thickness ? 'border-gray-200' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-150`}
                          placeholder="0.00"
                        />
                        <select
                          value={thicknessUnitId}
                          onChange={(e) => setThicknessUnitId(e.target.value)}
                          className={`block w-1/3 px-1 py-1 border ${fieldErrors.thicknessUnitId ? 'border-gray-200' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-150 bg-white`}
                          required
                        >
                          <option value="">Units</option>
                          {unitsData?.data?.filter(unit => unit.type === 'DISTANCE').map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.name} ({unit.symbol})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Slit Size */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <label className="block text-sm font-semibold text-gray-700">
                        Slit Size <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="number"
                          step="0.01"
                          value={formData.slitSize}
                          onChange={(e) => handleInputChange('slitSize', e.target.value)}
                          required
                          className={`block w-2/3 px-1 py-1 border ${fieldErrors.slitSize ? 'border-gray-200' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-150`}
                          placeholder="0.00"
                        />
                        <select
                          value={slitSizeUnitId}
                          onChange={(e) => setSlitSizeUnitId(e.target.value)}
                          className={`block w-1/3 px-1 py-1 border ${fieldErrors.slitSizeUnitId ? 'border-gray-200' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-150 bg-white`}
                          required
                        >
                          <option value="">Units</option>
                          {unitsData?.data?.filter(unit => unit.type === 'DISTANCE').map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.name} ({unit.symbol})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Blank Size */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <label className="block text-sm font-semibold text-gray-700">
                        Blank Size <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="number"
                          step="0.01"
                          value={formData.blankSize}
                          onChange={(e) => handleInputChange('blankSize', e.target.value)}
                          required
                          className={`block w-2/3 px-1 py-1 border ${fieldErrors.blankSize ? 'border-gray-200' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-150`}
                          placeholder="0.00"
                        />
                        <select
                          value={blankSizeUnitId}
                          onChange={(e) => setBlankSizeUnitId(e.target.value)}
                          className={`block w-1/3 px-1 py-1 border ${fieldErrors.blankSizeUnitId ? 'border-gray-200' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-150 bg-white`}
                          required
                        >
                          <option value="">Units</option>
                          {unitsData?.data?.filter(unit => unit.type === 'DISTANCE').map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.name} ({unit.symbol})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {error && <ErrorMessage message={error} />}

              <div className="flex items-center justify-end space-x-4 pt-6 border-t mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-orange-700 transition duration-150 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-3 text-white text-sm font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 min-w-[120px] flex items-center justify-center ${
                    formValid
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  disabled={isSubmitting || !formValid}
                >
                  {isSubmitting ? (
                    <LoadingSpinner className="w-5 h-5" />
                  ) : (
                    "Create Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
