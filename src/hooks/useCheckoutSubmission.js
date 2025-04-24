import { useState } from 'react';
import { postData } from '@/api/API';

export function useCheckoutSubmission(onClose) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  const submitCheckout = async (formData, itemData, selectedProduct, steps, checkInDate, checkOutDate, isCoilForSlitting = false) => {
    // Prevent multiple submissions
    if (hasSubmitted || isSubmitting) {
      console.log("Form already submitted or submitting, preventing duplicate submission");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    const checkInDateOnly = new Date(checkInDate);
    checkInDateOnly.setHours(0, 0, 0, 0);
    
    const checkOutDateOnly = new Date(checkOutDate);
    checkOutDateOnly.setHours(0, 0, 0, 0);
    
    let submitData = {};
    
    // Create completely different payload structures based on isCoilForSlitting
    if (itemData?.model_type === "coil" && isCoilForSlitting) {
      // Simplified payload for coil slitting
      submitData = {
        // Basic information
        checkin_date: checkInDateOnly.toISOString(),
        checkout_date: checkOutDateOnly.toISOString(),
        model_type: "coil",
        item_id: itemData.id,
        
        // Weight and quantity from the form
        weight_unit_id: Number(formData.weight_unit_id),
        weight: parseFloat(formData.weight),
        quantity: Number(formData.quantity),
        quantity_unit_id: Number(formData.quantity_unit_id),
        
        // Use the same remarks for both check-in and check-out
        checkout_remarks: formData.checkout_remarks || formData.checkin_remarks,
        checkin_remarks: formData.checkin_remarks,
        
        // Set these fields to null to indicate they're not applicable
        process_step_id: null,
        product_id: null,
        product_quantity: null,
        product_quantity_unit_id: null,
        product_weight: null,
        product_weight_unit_id: null,
        checkin_scrap_weight: null,
        checkin_scrap_weight_unit_id: null,
        checkin_scrap_quantity: null,
        checkin_scrap_quantity_unit_id: null
      };
    } else {
      // Standard payload for normal checkout
      submitData = {
        checkin_date: checkInDateOnly.toISOString(),
        checkout_date: checkOutDateOnly.toISOString(),
        model_type: itemData?.model_type === "coil" ? "coil" : "raw_material",
        item_id: itemData.id,
        process_step_id: Number(steps[0].id),
        weight_unit_id: Number(formData.weight_unit_id),
        weight: parseFloat(formData.weight),
        quantity: Number(formData.quantity),
        quantity_unit_id: Number(formData.quantity_unit_id),
        checkout_remarks: formData.checkout_remarks,
        checkin_remarks: formData.checkin_remarks,
        checkin_scrap_weight: parseFloat(formData.scrap_weight),
        product_id: Number(selectedProduct),
        product_quantity: Number(formData.product_quantity),
        product_quantity_unit_id: Number(formData.product_quantity_unit_id),
        product_weight: parseFloat(formData.product_weight),
        product_weight_unit_id: Number(formData.product_weight_unit_id),
        checkin_scrap_weight_unit_id: Number(formData.scrap_weight_unit_id),
      };
      
      // Only include scrap quantity fields if not a coil
      if (itemData?.model_type !== "coil") {
        submitData.checkin_scrap_quantity = Number(formData.scrap_quantity);
        submitData.checkin_scrap_quantity_unit_id = Number(formData.scrap_quantity_unit_id);
      }
    }

    try {
      // Make the API call
      const response = await postData("/inventory/simple-stock-out/", {
        stock_out_data: { ...submitData },
      });
      
      // Mark as submitted to prevent duplicate submissions
      setHasSubmitted(true);
      
      // Explicitly call onClose to close the modal
      if (typeof onClose === 'function') {
        console.log("Closing modal after successful submission");
        onClose(); // This should close the modal
      } else {
        console.error("onClose is not a function:", onClose);
      }
      
      // Optional: Refresh the page after a delay
      setTimeout(() => {
        window.location.reload();
      }, 300);
      
      return response.data;
    } catch (error) {
      console.error("Error submitting checkout:", error);
      setSubmitError(error.message || "Failed to submit checkout");
      setHasSubmitted(true);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    hasSubmitted,
    submitError,
    submitCheckout
  };
}
