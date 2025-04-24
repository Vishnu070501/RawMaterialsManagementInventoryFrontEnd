import { useState } from 'react';
import { postData } from '@/api/API';

export const useProductCheckoutSubmission = (onSuccess) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const submitProductCheckout = async (formData, productData) => {
    // Prevent multiple submissions
    if (hasSubmitted || isSubmitting) {
      console.log("Form already submitted or submitting, preventing duplicate submission");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessMessage('');

    try {
      // Format the checkout date to YYYY-MM-DD
      const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d instanceof Date && !isNaN(d) 
          ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          : '';
      };

      // Prepare the request payload
      const payload = {
        product_checkout_data: {
          product_id: productData.id,
          quantity: parseFloat(formData.product_quantity) || 0,
          weight: parseFloat(formData.product_weight) || 0,
          quantity_unit_id: parseInt(formData.product_quantity_unit_id) || null,
          weight_unit_id: parseInt(formData.product_weight_unit_id) || null,
          checkout_date: formatDate(formData.checkout_date || new Date()),
          checkout_remarks: formData.checkout_remarks || ""
        }
      };

      // Make the API call
      const response = await postData('/inventory/product/checkout/', payload);

      if (response && response.success) {
        setHasSubmitted(true);
        setSuccessMessage(response.message || 'Product checked out successfully');
        
        // Call the onSuccess callback if provided
        if (typeof onSuccess === 'function') {
          onSuccess(response.data);
        }
        
        return response.data;
      } else {
        const errorMessage = response?.message || 'Failed to checkout product';
        setSubmitError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred';
      setSubmitError(errorMessage);
      console.error("Product checkout error:", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitError,
    hasSubmitted,
    successMessage,
    submitProductCheckout,
    resetSubmission: () => {
      setHasSubmitted(false);
      setSubmitError(null);
      setSuccessMessage('');
    }
  };
};
