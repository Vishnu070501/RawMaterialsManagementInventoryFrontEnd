"use client";

import { useState, useEffect } from 'react';
import { getData } from '@/api/API';
import axiosInstance from '@/app/lib/apiInstances/axios';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function CreateSequenceModal({ isOpen, onClose, onSuccess }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    product_id: '',
    name: '',
    description: ''
  });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    product_id: false,
    name: false
  });
  const [touched, setTouched] = useState({
    product_id: false,
    name: false
  });

  // Fetch products when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getData('/inventory/search/products/?q=&is_dropdown=true');
      
      if (response && response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setError('Received invalid product data format');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load products');
      setLoading(false);
      console.error(err);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {
      product_id: !formData.product_id,
      name: !formData.name
    };
    
    setValidationErrors(errors);
    
    return !Object.values(errors).some(isError => isError);
  };

  // Handle product selection
  const handleProductSelection = (e) => {
    const productId = e.target.value;
    setSelectedProduct(productId);
    setFormData({
      ...formData,
      product_id: productId
    });
    
    setTouched({
      ...touched,
      product_id: true
    });
    
    setValidationErrors({
      ...validationErrors,
      product_id: !productId
    });
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    setTouched({
      ...touched,
      [name]: true
    });
    
    setValidationErrors({
      ...validationErrors,
      [name]: !value
    });
  };

  // Handle blur events for validation
  const handleBlur = (field) => {
    setTouched({
      ...touched,
      [field]: true
    });
    
    if (field === 'product_id') {
      setValidationErrors({
        ...validationErrors,
        [field]: !formData.product_id
      });
    } else if (field === 'name') {
      setValidationErrors({
        ...validationErrors,
        [field]: !formData.name
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      product_id: true,
      name: true
    });
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await axiosInstance.post('/process/sequences/create/', {
        sequence_data: formData
      });
      setLoading(false);
      
      // Reset form
      setFormData({
        product_id: '',
        name: '',
        description: ''
      });
      setSelectedProduct('');
      setTouched({
        product_id: false,
        name: false
      });
      setValidationErrors({
        product_id: false,
        name: false
      });
      
      // Call success callback
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Close modal
      onClose();
    } catch (err) {
      setError('Failed to create sequence');
      setLoading(false);
      console.error(err);
    }
  };

  // Check if form is valid
  const isFormValid = formData.product_id && formData.name;

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-orange-400 px-6 py-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-extrabold text-white">Create Manufacturing Sequence</h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-1 text-orange-100">Define a new manufacturing sequence for your product</p>
          </div>
          
          <div className="max-h-[80vh] overflow-y-auto">
            {/* Form with improved spacing and field styling */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Error message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-lg flex items-start">
                  <svg className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium">Error</h3>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Product <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedProduct}
                      onChange={handleProductSelection}
                      onBlur={() => handleBlur('product_id')}
                      className={`w-full rounded-lg border ${validationErrors.product_id && touched.product_id ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} py-2 px-3 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm appearance-none`}
                      required
                    >
                      <option value="">Select Product</option>
                      {Array.isArray(products) && products.length > 0 ? (
                        products.map((product) => (
                          <option key={`product-${product.id}`} value={product.id}>
                            {product.item_name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No products available</option>
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                  {validationErrors.product_id && touched.product_id && (
                    <p className="mt-1 text-sm text-red-600">Please select a product</p>
                  )}
                </div>

                {/* Sequence Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sequence Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('name')}
                    className={`w-full rounded-lg border ${validationErrors.name && touched.name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} py-2 px-3 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm`}
                    placeholder="e.g. Manufacturing way 1"
                    required
                  />
                  {validationErrors.name && touched.name && (
                    <p className="mt-1 text-sm text-red-600">Please enter a sequence name</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 py-2 px-3 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    placeholder="Describe the manufacturing sequence"
                    rows={4}
                  />
                </div>
              </div>

              {/* Form actions */}
              <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 mr-4 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors shadow-sm w-[100px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ !isFormValid}
                  className="w-[140px] px-2 py-1 bg-gradient-to-r from-orange-600 to-orange-700 border border-transparent rounded-lg text-sm font-medium text-white hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                
                        
                      <span>Create Sequence</span>
    
            
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
