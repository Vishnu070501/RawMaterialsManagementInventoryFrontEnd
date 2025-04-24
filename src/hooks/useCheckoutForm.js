import { useState, useEffect, useMemo } from 'react';
import { getData } from '@/api/API';

export default function useCheckoutForm(itemData) {
  // Helper function to extract numeric length from alphanumeric code
  const extractLengthFromCode = (lengthCode) => {
    if (!lengthCode || typeof lengthCode !== 'string') return 0;
    
    // Extract numeric part using regex
    const matches = lengthCode.match(/\d+/);
    if (matches && matches.length > 0) {
      return parseFloat(matches[0]);
    }
    return 0;
  };

  // Form state
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date());
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [formState, setFormState] = useState({
    units: [],
    extractedLength: 0, // Store the extracted length
    formData: {
      quantity: "",
      quantity_unit_id: "",
      weight: "",
      weight_unit_id: "",
      product_quantity: "",
      product_quantity_unit_id: "",
      product_weight: "",
      product_weight_unit_id: "",
      scrap_quantity: "",
      scrap_quantity_unit_id: "",
      scrap_weight: "",
      scrap_weight_unit_id: "",
      product_step: "",
      checkin_remarks: "",
      checkout_remarks: "",
      model_type: itemData?.model_type || "",
      step_id: "",
    },
  });
  
  // Add new state for custom total weight
  const [customTotalWeight, setCustomTotalWeight] = useState("");
  const [customTotalWeightUnitId, setCustomTotalWeightUnitId] = useState("");
  
  // Add new state for auto-calculating scrap
  const [autoCalculateScrap, setAutoCalculateScrap] = useState(true);
  
  const [isCalculating, setIsCalculating] = useState({
    raw: false,
    product: false,
    scrap: false
  });
  
  // Add state to store selected product name
  const [selectedProductName, setSelectedProductName] = useState("");
  
  // Calculate per unit weight for coils - for coils, 1 unit = entire coil weight
  const calculatePerUnitWeight = () => {
    if (itemData?.model_type === "coil") {
      // Use custom total weight if provided
      if (customTotalWeight && parseFloat(customTotalWeight) > 0) {
        let totalWeightInKg = parseFloat(customTotalWeight);
        const customWeightUnit = formState.units.find(
          u => u.id === parseInt(customTotalWeightUnitId)
        );
        
        // Convert to kg if the unit is tonnes
        if (customWeightUnit?.name === "Tonnes") {
          totalWeightInKg = totalWeightInKg * 1000;
        }
        
        // For coils, we want 1 unit to represent the entire coil
        // So the weight per unit is simply the total weight
        return totalWeightInKg;
      }
    }
    return 0;
  };
  // const calculateCoilScrapWeight = () => {
  //   if (!itemData?.model_type === "coil") return;
    
  //   // Get raw weight and product weight
  //   const rawWeight = parseFloat(formState.formData.weight) || 0;
  //   const productWeight = parseFloat(formState.formData.product_weight) || 0;
    
  //   // Calculate scrap weight as the difference
  //   const scrapWeight = Math.max(0, rawWeight - productWeight).toFixed(6);
    
  //   // Get the units
  //   const rawWeightUnit = formState.units.find(
  //     u => u.id === parseInt(formState.formData.weight_unit_id)
  //   );
  //   const productWeightUnit = formState.units.find(
  //     u => u.id === parseInt(formState.formData.product_weight_unit_id)
  //   );
  //   const scrapWeightUnit = formState.units.find(
  //     u => u.id === parseInt(formState.formData.scrap_weight_unit_id)
  //   );
    
  //   // Only calculate if all units are the same type (all kg or all tonnes)
  //   if (rawWeightUnit?.name === productWeightUnit?.name && 
  //       rawWeightUnit?.name === scrapWeightUnit?.name) {
  //     setFormState(prev => ({
  //       ...prev,
  //       formData: {
  //         ...prev.formData,
  //         scrap_weight: scrapWeight
  //       }
  //     }));
  //   }
  // };
  // Calculation utility functions
  const calculateVolume = useMemo(() => {
    if (!itemData?.blank_size || !itemData?.slit_size || !itemData?.thickness) {
      return 0;
    }
    // Convert mm to m³
    const blankSize = parseFloat(itemData.blank_size) / 1000;
    const slitSize = parseFloat(itemData.slit_size) / 1000;
    const thickness = parseFloat(itemData.thickness) / 1000;
    
    return blankSize * slitSize * thickness;
  }, [itemData]);

  // Calculate volume for coils using extracted length
  const calculateCoilVolume = () => {
    if (!itemData?.slit_size || !itemData?.thickness || !formState.extractedLength) {
      return 0;
    }
    
    // Convert mm to m³
    const slitSize = parseFloat(itemData.slit_size) / 1000;
    const thickness = parseFloat(itemData.thickness) / 1000;
    const length = formState.extractedLength / 1000;
    
    return slitSize * thickness * length;
  };

  const calculateWeightFromQuantity = (quantity, unitType) => {
    if (itemData?.model_type === "coil") {
      // For coils, use the extracted length and density-based calculation
      const volume = calculateCoilVolume();
      if (!volume || quantity <= 0) return 0;
      
      // Calculate weight in kg using density 7865 kg/m³
      const weightKg = volume * 7865 * quantity;
      
      // Convert to tonnes if needed
      return unitType === 'TONNES' ? weightKg / 1000 : weightKg;
    } else {
      // For non-coil items, use the existing calculation
      if (!calculateVolume || quantity <= 0) return 0;
      
      // Calculate weight in kg
      const weightKg = calculateVolume * 7865 * quantity;
      
      // Convert to tonnes if needed
      return unitType === 'TONNES' ? weightKg / 1000 : weightKg;
    }
  };

  const calculateQuantityFromWeight = (weight, unitType) => {
    if (itemData?.model_type === "coil") {
      // For coils, use the extracted length and density-based calculation
      const volume = calculateCoilVolume();
      if (!volume || weight <= 0) return 0;
      
      // Convert to kg if in tonnes
      const weightKg = unitType === 'TONNES' ? weight * 1000 : weight;
      
      // Calculate quantity
      return weightKg / (volume * 7865);
    } else {
      // For non-coil items, use the existing calculation
      if (!calculateVolume || weight <= 0) return 0;
      
      // Convert to kg if in tonnes
      const weightKg = unitType === 'TONNES' ? weight * 1000 : weight;
      
      // Calculate quantity
      return weightKg / (calculateVolume * 7865);
    }
  };

  // Function to calculate scrap values automatically
  const calculateScrapValues = () => {
    if (!autoCalculateScrap || itemData?.model_type === "coil") return;
    
    const rawWeight = parseFloat(formState.formData.weight) || 0;
    const productWeight = parseFloat(formState.formData.product_weight) || 0;
    const rawQuantity = parseFloat(formState.formData.quantity) || 0;
    const productQuantity = parseFloat(formState.formData.product_quantity) || 0;
    
    // Calculate scrap as the difference
    const scrapWeight = Math.max(0, rawWeight - productWeight).toFixed(6);
    const scrapQuantity = Math.max(0, rawQuantity - productQuantity).toFixed(4);
    
    setFormState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        scrap_weight: scrapWeight,
        scrap_quantity: scrapQuantity
      }
    }));
  };

  // Handler for custom total weight changes
  const handleCustomTotalWeightChange = (value) => {
    setCustomTotalWeight(value);
    
    // Recalculate quantity based on new total weight if weight is already entered
    if (formState.formData.weight) {
      handleRawWeightChange(formState.formData.weight);
    }
  };

  // Handler for raw material quantity changes
  const handleRawQuantityChange = (value) => {
    if (isCalculating.raw) return;
    setIsCalculating(prev => ({ ...prev, raw: true }));
    
    const quantity = parseFloat(value) || 0;
    
    // For coil items, use the custom total weight for calculations
    if (itemData?.model_type === "coil") {
      // Calculate weight in kg (1 unit = entire coil weight)
      const perUnitWeight = calculatePerUnitWeight();
      let weightInKg = quantity * perUnitWeight;
      
      // Convert to tonnes if needed
      const selectedUnit = formState.units.find(
        u => u.id === parseInt(formState.formData.weight_unit_id)
      );
      let weightValue = weightInKg;
      if (selectedUnit?.name === "Tonnes") {
        weightValue = weightInKg / 1000; // Convert kg to tonnes
      }
      
      setFormState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          quantity: value,
          weight: weightValue.toFixed(6),
        },
      }));
    } else {
      // For non-coil items, keep the bidirectional calculation
      const selectedUnit = formState.units.find(
        u => u.id === parseInt(formState.formData.weight_unit_id)
      );
      const unitType = selectedUnit?.type || 'KG';
      const weight = calculateWeightFromQuantity(quantity, unitType);
      
      setFormState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          quantity: value,
          weight: weight.toFixed(6)
        }
      }));
    }
    
    setTimeout(() => {
      setIsCalculating(prev => ({ ...prev, raw: false }));
      // Don't auto-calculate scrap for coils
      if (itemData?.model_type !== "coil") {
        calculateScrapValues();
      }
    }, 0);
  };

  const handleRawWeightChange = (value) => {
    if (isCalculating.raw) return;
    setIsCalculating(prev => ({ ...prev, raw: true }));
    
    const weight = parseFloat(value) || 0;
    
    // For coil items, use the custom total weight for calculations
    if (itemData?.model_type === "coil") {
      // Convert input weight to kg if needed
      const selectedUnit = formState.units.find(
        u => u.id === parseInt(formState.formData.weight_unit_id)
      );
      let weightInKg = weight;
      if (selectedUnit?.name === "Tonnes") {
        weightInKg = weight * 1000; // Convert tonnes to kg
      }
      
      // Calculate quantity based on per unit weight (1 unit = entire coil weight)
      const perUnitWeight = calculatePerUnitWeight();
      let quantity = 0;
      
      if (perUnitWeight > 0) {
        quantity = weightInKg / perUnitWeight;
        // Round to 4 decimal places for coils
        quantity = parseFloat(quantity.toFixed(4));
      }
      
      setFormState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          weight: value,
          quantity: quantity.toString()
        }
      }));
      
      // Calculate scrap weight after setting the raw weight
      setTimeout(() => calculateScrapWeight(), 0);
    } else {
      // Use existing calculation for non-coil items
      const selectedUnit = formState.units.find(
        u => u.id === parseInt(formState.formData.weight_unit_id)
      );
      const unitType = selectedUnit?.type || 'KG';
      const quantity = calculateQuantityFromWeight(weight, unitType);
      
      setFormState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          weight: value,
          quantity: quantity.toString()
        }
      }));
    }
    
    setTimeout(() => {
      setIsCalculating(prev => ({ ...prev, raw: false }));
      // Don't auto-calculate scrap for coils using the old method
      if (itemData?.model_type !== "coil") {
        calculateScrapValues();
      }
    }, 10);
  };
  
  const handleProductQuantityChange = (value) => {
    if (isCalculating.product) return;
    setIsCalculating(prev => ({ ...prev, product: true }));
    
    const quantity = parseFloat(value) || 0;
    
    if (itemData?.model_type === "coil") {
      // For coil items with extracted length, use density-based calculation
      if (itemData?.slit_size && itemData?.thickness && formState.extractedLength > 0) {
        const selectedUnit = formState.units.find(
          u => u.id === parseInt(formState.formData.product_weight_unit_id)
        );
        const unitType = selectedUnit?.name === "Tonnes" ? 'TONNES' : 'KG';
        
        // Use the extracted length from product name for this calculation
        const weight = calculateWeightFromQuantity(quantity, unitType);
        
        setFormState(prev => ({
          ...prev,
          formData: {
            ...prev.formData,
            product_quantity: value,
            product_weight: weight.toFixed(6)
          },
        }));
      } 
      // If length is not available, just update the quantity without calculating weight
      else {
        setFormState(prev => ({
          ...prev,
          formData: {
            ...prev.formData,
            product_quantity: value
            // Don't auto-calculate product_weight when length is not available
          },
        }));
      }
    } else {
      // For non-coil items, keep the bidirectional calculation
      const selectedUnit = formState.units.find(
        u => u.id === parseInt(formState.formData.product_weight_unit_id)
      );
      const unitType = selectedUnit?.type || 'KG';
      const weight = calculateWeightFromQuantity(quantity, unitType);
      
      setFormState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          product_quantity: value,
          product_weight: weight.toFixed(6)
        }
      }));
    }
    
    setTimeout(() => {
      setIsCalculating(prev => ({ ...prev, product: false }));
      // Don't auto-calculate scrap for coils
      if (itemData?.model_type !== "coil") {
        calculateScrapValues();
      }
    }, 0);
  };
  
  // Handler for product weight changes
  const handleProductWeightChange = (value) => {
    if (isCalculating.product) return;
    setIsCalculating(prev => ({ ...prev, product: true }));
    
    // Log the incoming value to verify it's correct
    // console.log("Product weight input:", value);
    
    // Store the original input value without any transformation
    const originalValue = value;
    
    // For calculations, parse as float
    const weight = parseFloat(value) || 0;
    
    if (itemData?.model_type === "coil") {
      // For coil items with extracted length, use density-based calculation
      if (itemData?.slit_size && itemData?.thickness && formState.extractedLength > 0) {
        const selectedUnit = formState.units.find(
          u => u.id === parseInt(formState.formData.product_weight_unit_id)
        );
        const unitType = selectedUnit?.name === "Tonnes" ? 'TONNES' : 'KG';
        
        // Use the extracted length from product name for this calculation
        const quantity = calculateQuantityFromWeight(weight, unitType);
        
        setFormState(prev => ({
          ...prev,
          formData: {
            ...prev.formData,
            // Use the original input value, not a transformed one
            product_weight: originalValue,
            product_quantity: quantity.toFixed(4)
          }
        }));
      }
      // If length is not available, just update the weight without calculating quantity
      else {
        setFormState(prev => ({
          ...prev,
          formData: {
            ...prev.formData,
            // Use the original input value, not a transformed one
            product_weight: originalValue
          }
        }));
      }
      
      // Calculate scrap weight after setting the product weight
      setTimeout(() => {
        // Get the latest raw weight and product weight directly from the form
        const rawWeightInput = document.querySelector('input[name="weight"]')?.value || formState.formData.weight;
        const productWeightInput = document.querySelector('input[name="product_weight"]')?.value || originalValue;
        
        const rawWeight = parseFloat(rawWeightInput) || 0;
        const productWeight = parseFloat(productWeightInput) || 0;
        
        // console.log("Direct input values:", { rawWeightInput, productWeightInput });
        
        // Calculate scrap weight
        const scrapWeight = Math.max(0, rawWeight - productWeight).toFixed(6);
        
        // console.log("Direct calculation:", { rawWeight, productWeight, scrapWeight });
        
        // Update scrap weight directly
        setFormState(prev => ({
          ...prev,
          formData: {
            ...prev.formData,
            scrap_weight: scrapWeight
          }
        }));
      }, 100);
    } else {
      // Use existing calculation for non-coil items
      const selectedUnit = formState.units.find(
        u => u.id === parseInt(formState.formData.product_weight_unit_id)
      );
      const unitType = selectedUnit?.type || 'KG';
      const quantity = calculateQuantityFromWeight(weight, unitType);
      
      setFormState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          // Use the original input value, not a transformed one
          product_weight: originalValue,
          product_quantity: quantity.toString()
        }
      }));
    }
    
    setTimeout(() => {
      setIsCalculating(prev => ({ ...prev, product: false }));
      // Don't auto-calculate scrap for coils using the old method
      if (itemData?.model_type !== "coil") {
        calculateScrapValues();
      }
    }, 100);
  };
  
  
  
  
  // Handler for scrap quantity changes
  const handleScrapQuantityChange = (value) => {
    if (isCalculating.scrap) return;
    setIsCalculating(prev => ({ ...prev, scrap: true }));
    
    const quantity = parseFloat(value) || 0;
    
    // For coil items with extracted length, use density-based calculation
    if (itemData?.model_type === "coil" && itemData?.slit_size && itemData?.thickness && formState.extractedLength > 0) {
      const selectedUnit = formState.units.find(
        u => u.id === parseInt(formState.formData.scrap_weight_unit_id)
      );
      const unitType = selectedUnit?.name === "Tonnes" ? 'TONNES' : 'KG';
      const weight = calculateWeightFromQuantity(quantity, unitType);
      
      setFormState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          scrap_quantity: value,
          scrap_weight: weight.toFixed(6)
        }
      }));
    }
    // For coil items without extracted length, don't auto-calculate weight
    else if (itemData?.model_type === "coil") {
      setFormState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          scrap_quantity: value,
          // Don't auto-calculate scrap_weight for coils without length
        }
      }));
    } else {
      // For non-coil items, keep the bidirectional calculation
      const selectedUnit = formState.units.find(
        u => u.id === parseInt(formState.formData.scrap_weight_unit_id)
      );
      const unitType = selectedUnit?.type || 'KG';
      const weight = calculateWeightFromQuantity(quantity, unitType);
      
      setFormState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          scrap_quantity: value,
          scrap_weight: weight.toFixed(6)
        }
      }));
    }
    
    setTimeout(() => setIsCalculating(prev => ({ ...prev, scrap: false })), 0);
  };
  const calculateScrapWeight = () => {
    if (itemData?.model_type !== "coil") return;
    
    // Don't calculate if we're already calculating scrap
    if (isCalculating.scrap) return;
    
    setIsCalculating(prev => ({ ...prev, scrap: true }));
    
    try {
      // Get the latest values directly from the form state
      const rawWeightStr = formState.formData.weight;
      const productWeightStr = formState.formData.product_weight;
      
      // console.log("Raw string values:", { rawWeightStr, productWeightStr });
      
      // Parse values carefully
      const rawWeight = parseFloat(rawWeightStr) || 0;
      const productWeight = parseFloat(productWeightStr) || 0;
      
      // console.log("Parsed values:", { rawWeight, productWeight });
      
      // Simple subtraction, ensuring non-negative result
      const scrapWeight = Math.max(0, rawWeight - productWeight);
      
      // Format to 6 decimal places
      const formattedScrapWeight = scrapWeight.toFixed(6);
      
      // console.log("Calculated scrap weight:", formattedScrapWeight);
      
      // Update the scrap weight in the form state
      setFormState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          scrap_weight: formattedScrapWeight
        }
      }));
    } catch (error) {
      // console.error("Error calculating scrap weight:", error);
    } finally {
      setTimeout(() => {
        setIsCalculating(prev => ({ ...prev, scrap: false }));
      }, 0);
    }
  };
  
  
  // Handler for scrap weight changes
  const handleScrapWeightChange = (value) => {
    if (isCalculating.scrap) return;
    setIsCalculating(prev => ({ ...prev, scrap: true }));
    
    const weight = parseFloat(value) || 0;
    
    // For coil items with extracted length, use density-based calculation
    if (itemData?.model_type === "coil" && itemData?.slit_size && itemData?.thickness && formState.extractedLength > 0) {
      const selectedUnit = formState.units.find(
        u => u.id === parseInt(formState.formData.scrap_weight_unit_id)
      );
      const unitType = selectedUnit?.name === "Tonnes" ? 'TONNES' : 'KG';
      const quantity = calculateQuantityFromWeight(weight, unitType);
      
      setFormState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          scrap_weight: value,
          scrap_quantity: quantity.toFixed(4)
        }
      }));
    }
    // For coil items without extracted length, don't auto-calculate quantity
    else if (itemData?.model_type === "coil") {
      setFormState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          scrap_weight: value,
          // Don't auto-calculate scrap_quantity for coils without length
        }
      }));
    } else {
      // Use existing calculation for non-coil items
      const selectedUnit = formState.units.find(
        u => u.id === parseInt(formState.formData.scrap_weight_unit_id)
      );
      const unitType = selectedUnit?.type || 'KG';
      const quantity = calculateQuantityFromWeight(weight, unitType);
      
      setFormState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          scrap_weight: value,
          scrap_quantity: quantity.toString()
        }
      }));
    }
    
    setTimeout(() => setIsCalculating(prev => ({ ...prev, scrap: false })), 0);
  };  
  
  const handleUnitChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value
      }
    }));
  
    // Recalculate weights or quantities when unit changes
    if (field === 'weight_unit_id' && formState.formData.weight) {
      handleRawWeightChange(formState.formData.weight);
    } else if (field === 'product_weight_unit_id' && formState.formData.product_weight) {
      handleProductWeightChange(formState.formData.product_weight);
    } else if (field === 'scrap_weight_unit_id' && formState.formData.scrap_weight) {
      handleScrapWeightChange(formState.formData.scrap_weight);
    }
  };
  
  // Data fetching state
  const [products, setProducts] = useState([]);
  const [sequences, setSequences] = useState([]);
  const [steps, setSteps] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState({
    units: false,
    products: false,
    sequences: false,
    steps: false
  });
  const [errors, setErrors] = useState({
    units: null,
    products: null,
    sequences: null,
    steps: null
  });
  
  // Update form data helper
  const updateFormData = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
    }));
  };
  
  // Form validation - modified to require custom total weight for coils
  const isFormValid = (isCoilForSlitting = false) => {
    const { formData } = formState;
    
    // For coil slitting, we only need basic fields
    if (itemData?.model_type === "coil" && isCoilForSlitting) {
      // For slitting, we only need quantity, weight, custom total weight, and remarks
      const slittingRequiredFields = [
        'quantity',
        'weight',
      ];
      
      const allFieldsFilled = slittingRequiredFields.every(field => 
        formData[field] !== '' && formData[field] !== null && formData[field] !== undefined
      );
      
      // Custom weight validation still applies
      const customWeightValid = customTotalWeight && 
        parseFloat(customTotalWeight) > 0 && 
        customTotalWeightUnitId;
      
      // For slitting, we don't need product or scrap validation
      return allFieldsFilled && customWeightValid;
    }
    
    // Original validation for non-slitting cases
    // Define required fields based on model type
    let requiredFields = [
      'quantity',
      'weight',
      'product_quantity',
      'product_weight',
      'scrap_weight',
      'checkin_remarks',
      'checkout_remarks'
    ];
    
    // For non-coil items, also require scrap_quantity
    if (itemData?.model_type !== "coil") {
      requiredFields.push('scrap_quantity');
    }
  
    const allFieldsFilled = requiredFields.every(field => 
      formData[field] !== '' && formData[field] !== null && formData[field] !== undefined
    );
  
    // For coil items, also require custom total weight
    const customWeightValid = itemData?.model_type !== "coil" || 
      (customTotalWeight && parseFloat(customTotalWeight) > 0 && customTotalWeightUnitId);
    
    // Weight and quantity validations
    const rawWeight = parseFloat(formData.weight);
    const productWeight = parseFloat(formData.product_weight);
    const scrapWeight = parseFloat(formData.scrap_weight);
  
    // Weight balance should always be valid (raw = product + scrap)
    // Use toFixed(3) to handle floating point precision issues
    const totalOutputWeight = Number((productWeight + scrapWeight).toFixed(3));
    const inputWeight = Number(rawWeight.toFixed(3));
    const weightBalanceValid = totalOutputWeight === inputWeight;
    
    // Quantity balance only matters for non-coil items
    let quantityBalanceValid = true;
    if (itemData?.model_type !== "coil") {
      const rawQuantity = parseFloat(formData.quantity||0);
      const productQuantity = parseFloat(formData.product_quantity||0);
      const scrapQuantity = parseFloat(formData.scrap_quantity||0);
      quantityBalanceValid = rawQuantity === (productQuantity + scrapQuantity);
    }
  
    // Additional checks for selected product and step
    const productSelected = selectedProduct !== null && selectedProduct !== '';
    const stepSelected = steps.length > 0 && formState.formData.step_id;
  
    return (
      allFieldsFilled &&
      weightBalanceValid &&
      quantityBalanceValid &&
      productSelected &&
      stepSelected &&
      rawWeight > 0 &&
      customWeightValid
    );
  };
  
  // Current date time updater
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Fetch units and set defaults
  useEffect(() => {
    const fetchUnits = async () => {
      setIsLoading(prev => ({ ...prev, units: true }));
      try {
        const response = await getData("/master/units/");
        const units = response.data;
        
        // Find default units
        const defaultNumberUnit = units.find(unit => unit.type === "NUMBER");
        const defaultWeightUnit = units.find(unit => unit.type === "WEIGHT" && unit.name === "Kilograms");
        
        setFormState(prev => ({
          ...prev,
          units: units,
          formData: {
            ...prev.formData,
            quantity_unit_id: defaultNumberUnit ? defaultNumberUnit.id.toString() : "",
            weight_unit_id: defaultWeightUnit ? defaultWeightUnit.id.toString() : "",
            product_quantity_unit_id: defaultNumberUnit ? defaultNumberUnit.id.toString() : "",
            product_weight_unit_id: defaultWeightUnit ? defaultWeightUnit.id.toString() : "",
            scrap_quantity_unit_id: defaultNumberUnit ? defaultNumberUnit.id.toString() : "",
            scrap_weight_unit_id: defaultWeightUnit ? defaultWeightUnit.id.toString() : "",
          }
        }));
        
        // Set default for custom total weight unit
        if (defaultWeightUnit) {
          setCustomTotalWeightUnitId(defaultWeightUnit.id.toString());
        }
        
        setErrors(prev => ({ ...prev, units: null }));
      } catch (error) {
        console.error("Error fetching units:", error);
        setErrors(prev => ({ ...prev, units: "Failed to load units" }));
      } finally {
        setIsLoading(prev => ({ ...prev, units: false }));
      }
    };
    fetchUnits();
  }, []);
  useEffect(() => {
    const searchProducts = async () => {
      if (!itemData?.id) return;
      
      setIsLoading(prev => ({ ...prev, products: true }));
      try {
        // Use different parameter based on model type
        const paramName = itemData.model_type === "coil" ? "coil_id" : "raw_material_id";
        
        const response = await getData(
          `/inventory/search/products/?q=&${paramName}=${itemData.id}&is_dropdown=true`
        );
        
        // Store the products data
        setProducts(response.data);
        
        setErrors(prev => ({ ...prev, products: null }));
      } catch (error) {
        setErrors(prev => ({ ...prev, products: "Failed to load products" }));
      } finally {
        setIsLoading(prev => ({ ...prev, products: false }));
      }
    };
    searchProducts();
  }, [itemData]);
  
  // Then, modify the useEffect for selectedProduct to extract length when a product is selected
  useEffect(() => {
    const fetchSequences = async () => {
      if (!selectedProduct) return;
      
      setIsLoading(prev => ({ ...prev, sequences: true }));
      try {
        // Find the selected product to get its name
        const product = products.find(p => p.id.toString() === selectedProduct.toString());
        if (product) {
          setSelectedProductName(product.item_name);
          console.log("Selected product name:", product.item_name);
          
          // Extract length from the selected product name for coil items
          if (itemData?.model_type === "coil" && product.item_name) {
            const extractedLength = extractLengthFromCode(product.item_name);
            if (extractedLength > 0) {
              console.log(`Extracted length from selected product ${product.item_name}: ${extractedLength}`);
              
              // Store the extracted length in the form state
              setFormState(prev => ({
                ...prev,
                extractedLength: extractedLength
              }));
            } else {
              // Reset extracted length if none found
              setFormState(prev => ({
                ...prev,
                extractedLength: 0
              }));
            }
          }
        }
        
        const response = await getData(`/process/get/sequence/?id=${selectedProduct}&${itemData.model_type=='raw_material'?`raw_material_id=${itemData?.id}`:`coil_id=${itemData?.id}`}`);
        setSequences(response.data.sequences);
        setErrors(prev => ({ ...prev, sequences: null }));
      } catch (error) {
        console.error("Error fetching sequences:", error);
        setErrors(prev => ({ ...prev, sequences: "Failed to load sequences" }));
      } finally {
        setIsLoading(prev => ({ ...prev, sequences: false }));
      }
    };
    fetchSequences();
  }, [selectedProduct, products, itemData]);
  
  // Fetch steps
  useEffect(() => {
    const fetchSteps = async () => {
      if (!formState.formData.product_step) return;
      
      setIsLoading(prev => ({ ...prev, steps: true }));
      try {
        const response = await
        getData(`/process/get/steps/?id=${formState.formData.product_step}`);
        setSteps(response.data.steps);
        setErrors(prev => ({ ...prev, steps: null }));
      } catch (error) {
        console.error("Error fetching steps:", error);
        setErrors(prev => ({ ...prev, steps: "Failed to load steps" }));
      } finally {
        setIsLoading(prev => ({ ...prev, steps: false }));
      }
    };
    fetchSteps();
  }, [formState.formData.product_step]);
  
  // Memoized units by type for better performance
  const getUnitsByType = (type) => {
    return formState.units.filter((unit) => unit.type === type);
  };
  
  return {
    // Form state
    formState,
    setFormState,
    updateFormData,
    isFormValid,
    isSubmitting,
    setIsSubmitting,
    checkInDate,
    setCheckInDate,
    checkOutDate,
    setCheckOutDate,
    currentDateTime,
    
    // Data fetching state
    products,
    sequences,
    steps,
    selectedProduct,
    setSelectedProduct,
    isLoading,
    errors,
    
    // Helper functions
    getUnitsByType,
    handleRawQuantityChange,
    handleRawWeightChange,
    handleProductQuantityChange,
    handleProductWeightChange,
    handleScrapQuantityChange,
    handleScrapWeightChange,
    handleUnitChange,
    
    // Custom total weight
    customTotalWeight,
    setCustomTotalWeight,
    customTotalWeightUnitId,
    setCustomTotalWeightUnitId,
    handleCustomTotalWeightChange,
    
    // Auto-calculate scrap
    autoCalculateScrap,
    setAutoCalculateScrap,
    calculateScrapValues,
    calculateScrapWeight,
    
    // Added: Selected product name
    selectedProductName
  };
  }