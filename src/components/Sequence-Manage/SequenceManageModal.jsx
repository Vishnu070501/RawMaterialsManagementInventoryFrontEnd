import React, { useState, useEffect } from 'react';
import AddStepComponent from './AddStepModal';
import { getData, deleteData } from '@/api/API';
import EditSequencesModal from './EditSequenceModal';

const SequenceManageModal = ({ isOpen, onClose, sequence, onEdit, onAdd }) => {
  const [activeTab, setActiveTab] = useState('rawDetails');
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [isEditSequenceModalOpen, setIsEditSequenceModalOpen] = useState(false); // Add state for EditSequencesModal
  const [selectedStep, setSelectedStep] = useState(null); // Add state to track the selected step
  const [sequenceData, setSequenceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && sequence?.sequence_id) {
      fetchSequenceSteps(sequence.sequence_id);
    }
  }, [isOpen, sequence]);

  const fetchSequenceSteps = async (sequenceId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getData(`process/sequences/${sequenceId}/steps/`);
      if (response.success) {
        setSequenceData(response.data);
      } else {
        setError(response.message || 'Failed to fetch sequence steps');
      }
    } catch (err) {
      setError('Error fetching sequence steps: ' + (err.message || 'Unknown error'));
      console.error('Error fetching sequence steps:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSequenceStep = async (sequenceId, stepId) => {
    setLoading(true);
    setError(null);
    try {
      // Call the API to delete the step
      const response = await deleteData(`process/sequences/${sequenceId}/steps/${stepId}/delete/`);
      
      if (response && response.success) {
        // Show success message
        alert('Step deleted successfully');
        // Refresh the sequence steps data
        fetchSequenceSteps(sequenceId);
      } else {
        setError(response?.message || 'Failed to delete step');
        alert('Failed to delete step: ' + (response?.message || 'Unknown error'));
      }
    } catch (err) {
      const errorMessage = 'Error deleting step: ' + (err.message || 'Unknown error');
      setError(errorMessage);
      alert(errorMessage);
      console.error('Error deleting step:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleStepAdded = (sequence, newStep) => {
    console.log("Adding step to sequence:", sequence, "New step:", newStep);
    // Refresh the data after adding a step
    if (sequence?.sequence_id) {
      fetchSequenceSteps(sequence.sequence_id);
    }
  };

  // Function to handle opening the edit sequence modal
  const handleEditSequence = () => {
    // If we have steps data, select the first step by default
    if (sequenceData?.steps && sequenceData.steps.length > 0) {
      setSelectedStep(sequenceData.steps[0]);
    } else {
      setSelectedStep(null);
    }
    setIsEditSequenceModalOpen(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-100 to-amber-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-amber-900">Manage Sequence: {sequence?.sequence_name}</h2>
          <button 
            onClick={onClose}
            className="text-amber-900 hover:text-amber-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs and Action Buttons */}
        <div className="flex border-b border-gray-200">
          <div className="flex-1 flex">
            <button
              className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                activeTab === 'rawDetails' 
                  ? 'border-b-2 border-amber-500 text-amber-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('rawDetails')}
            >
              Raw Details
            </button>
          </div>
          <div className="px-4 py-2 flex items-center space-x-3">
            {/* <button
              onClick={handleEditSequence} // Use the new handler function
              disabled={!sequence?.is_editable || !sequenceData?.steps || sequenceData.steps.length === 0}
              className={`${
                sequence?.is_editable && sequenceData?.steps && sequenceData.steps.length > 0
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white text-sm font-medium py-2 px-4 rounded transition-colors duration-200`}
            >
              Edit Sequence steps
            </button> */}
            <button
              onClick={() => setIsAddStepModalOpen(true)}
              disabled={!sequence?.is_editable}
              className={`${
                sequence?.is_editable
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white text-sm font-medium py-2 px-4 rounded transition-colors duration-200`}
            >
              Add Step
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'rawDetails' && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-900">Sequence Details</h3>
                  
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <dl>
                      <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                        <dt className="text-sm font-medium text-gray-500">Sequence Name</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {sequenceData?.sequence?.name || sequence?.sequence_name || 'N/A'}
                        </dd>
                      </div>
                      
                      <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Description</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {sequenceData?.sequence?.description || sequence?.sequence_description || 'No description available'}
                        </dd>
                      </div>
                      
                      <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                        <dt className="text-sm font-medium text-gray-500">Product</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {sequenceData?.sequence?.product?.name || sequence?.product || 'N/A'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <h3 className="text-lg font-medium text-gray-900 mt-8">Sequence Steps</h3>
                  
                  {sequenceData?.steps?.length > 0 ? (
                    sequenceData.steps.map((step) => (
                      <div key={step.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
                        <div className="bg-amber-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                          <h4 className="font-medium text-amber-900">
                            Step {step.step_number}: {step.name}
                          </h4>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedStep(step);
                                setIsEditSequenceModalOpen(true);
                              }}
                              disabled={!sequence?.is_editable}
                              className={`${
                                sequence?.is_editable
                                  ? "bg-amber-500 hover:bg-amber-600"
                                  : "bg-gray-400 cursor-not-allowed"
                              } text-white text-xs font-medium py-1 px-3 rounded transition-colors duration-200`}
                            >
                              Edit Step
                            </button>
                            <button
                              onClick={() => {
                                // Show confirmation dialog before deleting
                                if (window.confirm(`Are you sure you want to delete step "${step.name}"?`)) {
                                  // Call the delete API
                                  deleteSequenceStep(sequence.sequence_id, step.id);
                                }
                              }}
                              disabled={!sequence?.is_editable}
                              className={`${
                                sequence?.is_editable
                                  ? "bg-red-500 hover:bg-red-600"
                                  : "bg-gray-400 cursor-not-allowed"
                              } text-white text-xs font-medium py-1 px-3 rounded transition-colors duration-200`}
                            >
                              Delete Step
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Inputs:</h5>
                            {step.inputs && step.inputs.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm">
                                {step.inputs.map(input => (
                                  <li key={input.id} className="mb-1">
                                    <span className="font-medium">{input.name}</span>
                                    {input.description && <span className="text-gray-500"> - {input.description}</span>}
                                    <span className="text-xs text-gray-500 ml-2">({input.input_type})</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500">No inputs defined</p>
                            )}
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Outputs:</h5>
                            {step.outputs && step.outputs.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm">
                                {step.outputs.map(output => (
                                  <li key={output.id} className="mb-1">
                                    <span className="font-medium">{output.name}</span>
                                    {output.description && <span className="text-gray-500"> - {output.description}</span>}
                                    <span className="text-xs text-gray-500 ml-2">({output.output_type})</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500">No outputs defined</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
                      <p className="text-gray-500">No steps defined for this sequence</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gradient-to-r from-amber-100 to-amber-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>

      {/* Add Step Modal */}
      {isAddStepModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-amber-100 to-amber-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-amber-900">Add New Step to Sequence</h2>
              <button 
                onClick={() => setIsAddStepModalOpen(false)}
                className="text-amber-900 hover:text-amber-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
            <AddStepComponent 
                sequenceId={sequence?.sequence_id} 
                onSuccess={(seq, newStep) => {
                  handleStepAdded(seq, newStep);
                  setIsAddStepModalOpen(false);
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Sequence Step Modal */}
      {isEditSequenceModalOpen && selectedStep && (
        <EditSequencesModal
          isOpen={isEditSequenceModalOpen}
          onClose={() => {
            setIsEditSequenceModalOpen(false);
            // Refresh the sequence steps data when the modal is closed
            if (sequence?.sequence_id) {
              fetchSequenceSteps(sequence.sequence_id);
            }
          }}
          sequenceId={sequence?.sequence_id}
          step={selectedStep}
        />
      )}
    </div>
  );
};

export default SequenceManageModal;

