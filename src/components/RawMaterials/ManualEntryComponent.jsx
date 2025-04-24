"use client";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { getData } from "@/api/API";
import SearchDropdown from "../Input/SearchDropdown";

const REQUIRED_FIELDS = {
  name: "Name",
  description: "Description",
  unit_price: "Price",
  quantity_requested: "Quantity",
  quantity_requested_unit_id: "Quantity Unit",
  blank_size: "Blank Size",
  blank_size_unit_id: "Blank Size Unit",
  weight: "Weight",
  weight_requested_unit_id: "Weight Unit",
  thickness: "Thickness",
  thickness_unit_id: "Thickness Unit",
  slit_size: "Slit Size",
  slit_size_unit_id: "Slit Size Unit",
};

const InputField = ({ label, type, value, onChange, className, error }) => (
  <div className={`${className} relative`}>
    <label className="text-xs font-medium text-gray-600">
      {label} <span className="text-red-500">*</span>
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      min={type === "number" ? "0" : undefined}
      step={type === "number" ? "any" : undefined}
      className="w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
    />
    {error && (
      <span className="absolute right-0 top-0 text-red-500 text-xs">!</span>
    )}
  </div>
);

const UnitField = ({
  label,
  value,
  unitValue,
  onChangeValue,
  onChangeUnit,
  units,
  unitType,
  error,
}) => (
  <div className="flex gap-1">
    <div className="flex-1">
      <InputField
        label={label}
        type="number"
        value={value}
        onChange={onChangeValue}
        error={error}
      />
    </div>
    <div className="w-24">
      <label className="text-xs font-medium text-gray-600">
        Unit <span className="text-red-500">*</span>
      </label>
      <select
        value={unitValue}
        onChange={(e) => onChangeUnit(e.target.value)}
        required
        className="w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
      >
        <option value="">Unit</option>
        {units
          .filter((unit) => unit.type === unitType)
          .map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
      </select>
    </div>
  </div>
);

const INITIAL_FORM_STATE = {
  name: "",
  description: "",
  unit_price: "",
  quantity_requested: "",
  quantity_requested_unit_id: "",
  blank_size: "",
  blank_size_unit_id: "",
  weight: "",
  weight_requested_unit_id: "",
  thickness: "",
  thickness_unit_id: "",
  slit_size: "",
  slit_size_unit_id: "",
  existingRawMaterialId: "",
  history_date: new Date().toISOString().split("T")[0],
  history_id:"",
};

const MEASUREMENT_FIELDS = [
  {
    label: "Quantity",
    value: "quantity_requested",
    unit: "quantity_requested_unit_id",
    type: "NUMBER",
  },
  {
    label: "Weight",
    value: "weight",
    unit: "weight_requested_unit_id",
    type: "WEIGHT",
  },
  {
    label: "Thickness",
    value: "thickness",
    unit: "thickness_unit_id",
    type: "DISTANCE",
  },
  {
    label: "Slit Size",
    value: "slit_size",
    unit: "slit_size_unit_id",
    type: "DISTANCE",
  },
];

export default function ManualEntryComponent({ onSubmit, type }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [units, setUnits] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [useExistingMaterial, setUseExistingMaterial] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const getMeasurementFields = () => {
    const fields = [...MEASUREMENT_FIELDS];
    console.log("Current type:", type);
    if (type !== "coil") {
      fields.splice(2, 0, {
        label: "Blank Size",
        value: "blank_size",
        unit: "blank_size_unit_id",
        type: "DISTANCE",
      });
    }
    return fields;
  };
  const fetchHistoryItems = async (materialId) => {
    if (!materialId) return;
    
    try {
      const endpoint = type === "coil" 
        ? `/inventory/stock-history/coil/?id=${materialId}`
        : `/inventory/stock-history/rawmaterial/?id=${materialId}`;
      
      const response = await getData(endpoint);
      
      if (response && response.data) {
        setHistoryItems(response.data);
      } else {
        setHistoryItems([]);
      }
    } catch (error) {
      console.error("Error fetching history items:", error);
      setHistoryItems([]);
    }
  };
  // Calculate volume based on dimensions
  const calculateVolume = useMemo(() => {
    if (
      type === "coil" ||
      !formData.blank_size ||
      !formData.slit_size ||
      !formData.thickness
    ) {
      return 0;
    }

    // Convert mm to m³
    const blankSize = parseFloat(formData.blank_size) / 1000;
    const slitSize = parseFloat(formData.slit_size) / 1000;
    const thickness = parseFloat(formData.thickness) / 1000;

    return blankSize * slitSize * thickness;
  }, [formData.blank_size, formData.slit_size, formData.thickness, type]);

  // Calculate weight from quantity
  // In the calculateWeightFromQuantity function
  const calculateWeightFromQuantity = (quantity) => {
    if (!calculateVolume || quantity <= 0) return 0;

    // Calculate weight in kg (density of steel is approximately 7865 kg/m³)
    const weightKg = calculateVolume * 7865 * quantity;

    // Get the selected weight unit
    const selectedUnit = units.find(
      (u) => u.id === parseInt(formData.weight_requested_unit_id)
    );
    const unitType = selectedUnit?.symbol === "T" ? "TONNES" : "KG";

    // Convert to tonnes if needed and round to 6 decimal places
    const result = unitType === "TONNES" ? weightKg / 1000 : weightKg;
    return parseFloat(result.toFixed(6));
  };

  // In the calculateQuantityFromWeight function
  const calculateQuantityFromWeight = (weight) => {
    if (!calculateVolume || weight <= 0) return 0;

    // Get the selected weight unit
    const selectedUnit = units.find(
      (u) => u.id === parseInt(formData.weight_requested_unit_id)
    );
    const unitType = selectedUnit?.symbol === "T" ? "TONNES" : "KG";

    // Convert to kg if in tonnes
    const weightKg = unitType === "TONNES" ? weight * 1000 : weight;

    // Calculate quantity and round to 6 decimal places
    const result = weightKg / (calculateVolume * 7865);
    return parseFloat(result.toFixed(6));
  };

  useEffect(() => {
    const fetchUnits = async () => {
      const response = await getData("/master/units/");
      setUnits(response.data);

      // Set default units after fetching
      if (response.data && response.data.length > 0) {
        const defaultNumberUnit = response.data.find(
          (unit) => unit.type === "NUMBER" && unit.symbol === "nos"
        );
        const defaultWeightUnit = response.data.find(
          (unit) => unit.type === "WEIGHT" && unit.symbol === "Kg"
        );
        const defaultDistanceUnit = response.data.find(
          (unit) => unit.type === "DISTANCE" && unit.symbol === "mm"
        );

        const defaults = {};

        if (defaultNumberUnit) {
          defaults.quantity_requested_unit_id = defaultNumberUnit.id;
        }

        if (defaultWeightUnit) {
          defaults.weight_requested_unit_id = defaultWeightUnit.id;
        }

        if (defaultDistanceUnit) {
          defaults.thickness_unit_id = defaultDistanceUnit.id;
          defaults.slit_size_unit_id = defaultDistanceUnit.id;
          defaults.blank_size_unit_id = defaultDistanceUnit.id;
        }

        setFormData((prev) => ({
          ...prev,
          ...defaults,
        }));
      }
    };

    fetchUnits();
  }, []);

  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (
      !useExistingMaterial &&
      type !== "coil" &&
      !isCalculating &&
      formData.blank_size &&
      formData.slit_size &&
      formData.thickness
    ) {
      if (
        lastUpdated === "quantity_requested" ||
        (lastUpdated &&
          ["blank_size", "slit_size", "thickness"].includes(lastUpdated))
      ) {
        // Calculate weight from quantity
        const quantity = parseFloat(formData.quantity_requested);
        if (!isNaN(quantity) && quantity > 0) {
          const calculatedWeight = calculateWeightFromQuantity(quantity);
          if (
            calculatedWeight > 0 &&
            calculatedWeight !== parseFloat(formData.weight)
          ) {
            setFormData((prev) => ({
              ...prev,
              weight: calculatedWeight,
            }));
          }
        }
        // } else if (lastUpdated === "weight") {
        //   // Calculate quantity from weight
        //   const weight = parseFloat(formData.weight);
        //   if (!isNaN(weight) && weight > 0) {
        //     const calculatedQuantity = calculateQuantityFromWeight(weight);
        //     if (calculatedQuantity > 0) {
        //       setFormData((prev) => ({
        //         ...prev,
        //         quantity_requested: calculatedQuantity,
        //       }));
        //     }
        //   }
        // }
      }
    }
  }, [
    // Remove formData from the dependency array and only include specific fields
    formData.blank_size,
    formData.slit_size,
    formData.thickness,
    formData.quantity_requested,
    formData.weight,
    lastUpdated,
    type,
    isCalculating,
    calculateWeightFromQuantity,
    calculateQuantityFromWeight,
    calculateVolume,
    useExistingMaterial,
  ]);
  const validateForm = () => {
    const newErrors = {};

    // If using existing material, only validate quantity and weight
    if (useExistingMaterial && formData.existingRawMaterialId) {
      if (!formData.quantity_requested) {
        newErrors.quantity_requested = "Quantity is required";
      }
      if (!formData.quantity_requested_unit_id) {
        newErrors.quantity_requested_unit_id = "Quantity Unit is required";
      }
      if (!formData.weight) {
        newErrors.weight = "Weight is required";
      }
      if (!formData.weight_requested_unit_id) {
        newErrors.weight_requested_unit_id = "Weight Unit is required";
      }
      if (!formData.unit_price) {
        newErrors.unit_price = "Price is required";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    // Otherwise validate all required fields
    const fieldsToCheck = { ...REQUIRED_FIELDS };
    if (type === "coil") {
      delete fieldsToCheck.blank_size;
      delete fieldsToCheck.blank_size_unit_id;
    }

    Object.entries(fieldsToCheck).forEach(([key, label]) => {
      if (!formData[key]) {
        newErrors[key] = `${label} is required`;
      }
      const numericKeys = [
        "unit_price",
        "quantity_requested",
        "weight",
        "thickness",
        "slit_size",
        "blank_size",
      ];
      if (numericKeys.includes(key)) {
        const num = Number(formData[key]);
        if (!isNaN(num) && num < 0) {
          newErrors[key] = `${label} cannot be negative`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setIsCalculating(true);
    setFormData((prev) => ({ ...prev, [field]: value }));
    setLastUpdated(field); // Track which field was updated
    setTimeout(() => setIsCalculating(false), 0);
  };

  const handleMaterialSelect = (selected) => {
    setFormData((prev) => ({
      ...prev,
      existingRawMaterialId: selected.value,
      name: selected.label,
      // You can also pre-fill other fields if they're available in the selected item
      description: selected.item.item_description || "",
      thickness: selected.item.thickness || "",
      slit_size: selected.item.slit_size || "",
      blank_size: selected.item.blank_size || "",
      po_item_list_id: selected.value,
    }));fetchHistoryItems(selected.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Submitting form data:", { ...formData });
      onSubmit(formData);

      // Reset form but keep the default units
      const defaultUnits = {
        quantity_requested_unit_id: formData.quantity_requested_unit_id,
        weight_requested_unit_id: formData.weight_requested_unit_id,
        thickness_unit_id: formData.thickness_unit_id,
        slit_size_unit_id: formData.slit_size_unit_id,
        blank_size_unit_id: formData.blank_size_unit_id,
      };

      setFormData({
        ...INITIAL_FORM_STATE,
        ...defaultUnits,
      });
      setErrors({});
      setUseExistingMaterial(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-4"
    >
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setUseExistingMaterial(!useExistingMaterial)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            useExistingMaterial
              ? "bg-amber-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {useExistingMaterial
            ? "Creating New Material"
            : "Use Existing Material"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {useExistingMaterial ? (
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Select Existing Material <span className="text-red-500">*</span>
            </label>
            <SearchDropdown
              searchEndpoint={
                type === "coil"
                  ? "/inventory/search/coils/?q=&is_dropdown=true"
                  : "/inventory/search/raw_materials/?q=&is_dropdown=true"
              }
              onSelect={handleMaterialSelect}
              placeholder={
                type === "coil" ? "Search coils..." : "Search materials..."
              }
              displayField="item_name"
              valueField="id"
              className="w-full"
              resultsPath="data.results"
            />

            {/* Show quantity and weight fields when using existing material */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <UnitField
                label="Quantity"
                value={formData.quantity_requested}
                unitValue={formData.quantity_requested_unit_id}
                onChangeValue={(value) => {
                  handleChange("quantity_requested", value);

                  // Calculate weight from quantity if we have dimensions
                  if (
                    formData.thickness &&
                    (type !== "coil"
                      ? formData.blank_size && formData.slit_size
                      : true)
                  ) {
                    const quantity = parseFloat(value);
                    if (!isNaN(quantity) && quantity > 0) {
                      const calculatedWeight =
                        calculateWeightFromQuantity(quantity);
                      if (calculatedWeight > 0) {
                        handleChange("weight", calculatedWeight.toFixed(6));
                      }
                    }
                  }
                }}
                onChangeUnit={(value) =>
                  handleChange("quantity_requested_unit_id", value)
                }
                units={units}
                unitType="NUMBER"
                error={
                  errors.quantity_requested || errors.quantity_requested_unit_id
                }
              />

              <UnitField
                label="Weight"
                value={formData.weight}
                unitValue={formData.weight_requested_unit_id}
                onChangeValue={(value) => {
                  handleChange("weight", value);

                  // Calculate quantity from weight if we have dimensions
                  // if (formData.thickness && (type !== "coil" ? formData.blank_size && formData.slit_size : true)) {
                  //   const weight = parseFloat(value);
                  //   if (!isNaN(weight) && weight > 0) {
                  //     const calculatedQuantity = calculateQuantityFromWeight(weight);
                  //     if (calculatedQuantity > 0) {
                  //       handleChange("quantity_requested", calculatedQuantity.toString());
                  //     }
                  //   }
                  // }
                }}
                onChangeUnit={(value) =>
                  handleChange("weight_requested_unit_id", value)
                }
                units={units}
                unitType="WEIGHT"
                error={errors.weight || errors.weight_requested_unit_id}
              />
              <InputField
                label="Price"
                type="number"
                value={formData.unit_price}
                onChange={(value) => handleChange("unit_price", value)}
                error={errors.unit_price}
                className="col-span-1"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <InputField
              label="Name"
              type="text"
              value={formData.name}
              onChange={(value) => handleChange("name", value)}
              error={errors.name}
            />
            <InputField
              label="Description"
              type="text"
              value={formData.description}
              onChange={(value) => handleChange("description", value)}
              error={errors.description}
            />
            <InputField
              label="Price"
              type="number"
              value={formData.unit_price}
              onChange={(value) => handleChange("unit_price", value)}
              error={errors.unit_price}
            />

            {getMeasurementFields(type).map((field) => (
              <UnitField
                key={field.value}
                label={field.label}
                value={formData[field.value]}
                unitValue={formData[field.unit]}
                onChangeValue={(value) => handleChange(field.value, value)}
                onChangeUnit={(value) => handleChange(field.unit, value)}
                units={units}
                unitType={field.type}
                error={errors[field.value] || errors[field.unit]}
              />
            ))}
          </div>
        )}
        <div
          className={`${
            useExistingMaterial
              ? "col-span-2"
              : "col-span-1 md:col-span-2 lg:col-span-3"
          } mt-2`}
        >
          <label className="text-xs font-medium text-gray-600">
            History Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.history_date}
            onChange={(e) => handleChange("history_date", e.target.value)}
            required
            className="w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
          >
            Add Item
          </button>
        </div>
      </form>
    </motion.div>
  );
}
