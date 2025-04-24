import React, { useState, useEffect } from 'react';
import { getData, postData } from '@/api/API';

const AddStepComponent = ({ sequenceId, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stepNo, setStepNo] = useState(1);
  const [inputs, setInputs] = useState([{ input_type: 'raw_materials', input_id: null }]);
  const [outputs, setOutputs] = useState([{ output_type: 'products', output_id: null }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for dropdown options
  const [inputOptions, setInputOptions] = useState({
    raw_material: [],
    product: [],
    coil: []
  });
  const [outputOptions, setOutputOptions] = useState({
    raw_material: [],
    product: [],
    coil: []
  });

  // Fetch options for a specific model type
  const fetchOptions = async (model_type) => {
    try {
      const endpoint = `/inventory/search/${model_type}/?q=&is_dropdown=true`;
      const response = await getData(endpoint);
      // Check if the response has the expected structure
      if (response && response.success && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error(`Unexpected response format for ${model_type}:`, response);
        return [];
      }
    } catch (err) {
      console.error(`Error fetching ${model_type} options:`, err);
      return [];
    }
  };

  // Load initial options for all types
  useEffect(() => {
    const loadAllOptions = async () => {
      const rawMaterials = await fetchOptions('raw_materials');
      const products = await fetchOptions('products');
      const coil = await fetchOptions('coils');
      
      const options = {
        raw_material: [...rawMaterials],
        product: [...products],
        coil: [...coil]
      };
      
      setInputOptions(options);
      setOutputOptions(options);
    };
    
    loadAllOptions();
  }, []);

  const handleAddInput = () => {
    setInputs([...inputs, { input_type: 'raw_material', input_id: null }]);
  };

  const handleAddOutput = () => {
    setOutputs([...outputs, { output_type: 'product', output_id: null }]);
  };

  const handleInputChange = (index, field, value) => {
    const newInputs = [...inputs];
    // If changing the type, reset the input_id
    if (field === 'input_type') {
      newInputs[index] = { input_type: value, input_id: null };
    } else {
      newInputs[index][field] = field === 'input_id' ? Number(value) : value;
    }
    setInputs(newInputs);
  };

  const handleOutputChange = (index, field, value) => {
    const newOutputs = [...outputs];
    // If changing the type, reset the output_id
    if (field === 'output_type') {
      newOutputs[index] = { output_type: value, output_id: null };
    } else {
      newOutputs[index][field] = field === 'output_id' ? Number(value) : value;
    }
    setOutputs(newOutputs);
  };

  const handleRemoveInput = (index) => {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
  };

  const handleRemoveOutput = (index) => {
    const newOutputs = [...outputs];
    newOutputs.splice(index, 1);
    setOutputs(newOutputs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Filter out inputs/outputs with null IDs
    const validInputs = inputs.filter(input => input.input_id !== null);
    const validOutputs = outputs.filter(output => output.output_id !== null);

    const stepData = {
      name,
      description,
      step_no: stepNo,
      inputs: validInputs,
      outputs: validOutputs
    };

    try {
      const endpoint = `/process/sequences/${sequenceId}/steps/add/`;
      const response = await postData(endpoint, { step_data: stepData });
      setLoading(false);
      
      if (onSuccess) {
        onSuccess(response);
      }
      
      // Reset form
      setName('');
      setDescription('');
      setStepNo(1);
      setInputs([{ input_type: 'raw_material', input_id: null }]);
      setOutputs([{ output_type: 'product', output_id: null }]);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'An error occurred while adding the step');
      console.error("Error adding step:", err);
    }
  };

  // Get display name for an item based on its type
  const getItemDisplayName = (item, type) => {
    if (!item) return '';
    
    if (type === 'raw_materials') {
      const name = item.item_name || item.item_description || 'Unnamed Raw Material';
      return `${name} (${item.id})`;
    } else if (type === 'products') {
      const name = item.item_name || item.name || 'Unnamed Product';
      return `${name} (${item.id})`;
    } else if (type === 'coils') {
      const name = item.item_name || item.name || 'Unnamed Coil';
      return `${name} (${item.id})`;
    } else {
      return `${item.item_name || item.name || 'Unnamed Item'} (${item.id})`;
    }
  };

  return (
    <div className="bg-white rounded-lg">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Step Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
        
        <div>
          <label htmlFor="stepNo" className="block text-sm font-medium text-gray-700 mb-1">
            Step Number
          </label>
          <input
            type="number"
            id="stepNo"
            value={stepNo}
            onChange={(e) => setStepNo(Number(e.target.value))}
            min="1"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-medium text-gray-700">Inputs</h3>
            <button
              type="button"
              onClick={handleAddInput}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Add Input
            </button>
          </div>
          
          <div className="space-y-3">
            {inputs.map((input, index) => (
              <div key={`input-${index}`} className="flex items-center space-x-2">
                <select
                  value={input.input_type}
                  onChange={(e) => handleInputChange(index, 'input_type', e.target.value)}
                  required
                  className="w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="raw_material">Raw Material</option>
                  <option value="product">Product</option>
                  <option value="coil">Coil</option>
                </select>
                
                <select
                  value={input.input_id || ''}
                  onChange={(e) => handleInputChange(index, 'input_id', e.target.value)}
                  required
                  className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Select {input.input_type.replace('_', ' ')}</option>
                  {Array.isArray(inputOptions[input.input_type]) && 
                    inputOptions[input.input_type].map(item => (
                      <option
                        key={`input-option-${item.id || Math.random()}`}
                        value={item.id}
                      >
                        {getItemDisplayName(item, input.input_type)}
                      </option>
                    ))
                  }
                </select>
                
                <button
                  type="button"
                  onClick={() => handleRemoveInput(index)}
                  disabled={inputs.length === 1}
                  className={`inline-flex items-center p-1 border border-transparent rounded-full ${
                    inputs.length === 1
                      ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
                      : 'text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-medium text-gray-700">Outputs</h3>
            <button
              type="button"
              onClick={handleAddOutput}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Add Output
            </button>
          </div>
          
          <div className="space-y-3">
            {outputs.map((output, index) => (
              <div key={`output-${index}`} className="flex items-center space-x-2">
                <select
                  value={output.output_type}
                  onChange={(e) => handleOutputChange(index, 'output_type', e.target.value)}
                  required
                  className="w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="product">Product</option>
                  <option value="raw_material">Raw Material</option>
                  <option value="coil">Coil</option>
                </select>
                
                <select
                  value={output.output_id || ''}
                  onChange={(e) => handleOutputChange(index, 'output_id', e.target.value)}
                  required
                  className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Select {output.output_type.replace('_', ' ')}</option>
                  {Array.isArray(outputOptions[output.output_type]) && 
                    outputOptions[output.output_type].map(item => (
                      <option
                        key={`output-option-${item.id || Math.random()}`}
                        value={item.id}
                      >
                        {getItemDisplayName(item, output.output_type)}
                      </option>
                    ))
                  }
                </select>
                
                <button
                  type="button"
                  onClick={() => handleRemoveOutput(index)}
                  disabled={outputs.length === 1}
                  className={`inline-flex items-center p-1 border border-transparent rounded-full ${
                    outputs.length === 1
                      ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
                      : 'text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              loading
                ? 'bg-amber-400 cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              'Add Step'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStepComponent;
