import { useState, useEffect, useRef } from 'react';
import { getData } from '@/api/API';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

/**
 * A reusable filter dropdown component
 * @param {Object} props
 * @param {Function} props.onFilterApply - Callback when filters are applied
 * @param {string} props.endpoint - API endpoint to fetch filter options
 * @param {Array} props.filterOptions - Array of filter option configurations
 * @param {string} props.title - Title for the filter dropdown
 * @param {Object} props.initialFilters - Initial filter values
 * @param {string} props.buttonClassName - Additional class names for the filter button
 * @param {string} props.dropdownClassName - Additional class names for the dropdown
 */
export const FilterDropdown = ({
  onFilterApply,
  endpoint = '',
  filterOptions = [],
  title = 'Filter',
  initialFilters = {},
  buttonClassName = '',
  dropdownClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [resources, setResources] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(initialFilters);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchResources = async () => {
    if (!endpoint) return;
    
    setIsLoading(true);
    try {
      const response = await getData(endpoint);
      if (response.success) {
        setResources(response.data);
      }
    } catch (error) {
      console.error(`Error fetching resources from ${endpoint}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!resources && !isOpen && endpoint) {
      fetchResources();
    }
  };

  const handleFilterChange = (key, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    onFilterApply(selectedFilters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    const emptyFilters = {};
    filterOptions.forEach(option => {
      emptyFilters[option.key] = null;
    });
    
    setSelectedFilters(emptyFilters);
    onFilterApply(emptyFilters);
    setIsOpen(false);
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return Object.values(selectedFilters).some(value => value !== null && value !== undefined && value !== '');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`flex items-center justify-center px-3 py-1.5 bg-white rounded-md border border-amber-200 
        hover:bg-amber-50 transition-colors shadow-sm hover:shadow-md text-amber-700
        ${hasActiveFilters() ? 'bg-amber-50 border-amber-300' : ''} ${buttonClassName}`}
        aria-label={title}
        title={title}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-medium">Filters</span>
        {hasActiveFilters() && (
          <span className="ml-1.5 inline-flex items-center justify-center bg-orange-500 text-white rounded-full w-4 h-4 text-[10px] font-bold">
            {Object.values(selectedFilters).filter(v => v !== null && v !== undefined && v !== '').length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center`}>
          <div className={`relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto z-50 animate-fadeIn ${dropdownClassName}`}>
            <div className="sticky top-0 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 border-b border-amber-100 flex justify-between items-center">
              <h3 className="text-lg font-medium text-amber-800">{title}</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {filterOptions.map((option) => (
                      <div key={option.key} className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{option.label}</label>
                        <select 
                          className="w-full p-2 text-sm border border-amber-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          value={selectedFilters[option.key] || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              handleFilterChange(option.key, null);
                            } else {
                              const selectedItem = resources?.[option.dataKey]?.find(
                                item => item.id.toString() === value
                              );
                              handleFilterChange(option.key, selectedItem?.id || null);
                            }
                          }}
                        >
                          <option value="">{option.allLabel || `All ${option.label}s`}</option>
                          {resources?.[option.dataKey]?.map(item => (
                            <option key={item.id} value={item.id}>
                              {item[option.displayField || 'name']}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-4 border-t border-gray-100">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={applyFilters}
                      className="px-4 py-2 text-sm text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-colors shadow-sm hover:shadow"
                    >
                      Apply Filters
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};