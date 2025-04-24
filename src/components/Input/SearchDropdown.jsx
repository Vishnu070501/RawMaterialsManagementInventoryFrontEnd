'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getData } from '@/api/API';
import debounce from 'lodash/debounce';

export default function SearchDropdown({ 
  searchEndpoint, 
  onSelect, 
  placeholder = "Search...",
  displayField = "name",
  valueField = "id",
  minSearchLength = 2,
  className = "",
  renderOption = null,
  resultsPath = null // Add this parameter to specify the path to results
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['search', searchEndpoint, searchTerm],
    queryFn: () => getData(`${searchEndpoint}?q=${searchTerm}`),
    enabled: searchTerm.length >= minSearchLength,
    staleTime: 30000,
  });

  // Get the actual results array based on the resultsPath
  const getResults = () => {
    if (!data) return [];
    if (resultsPath) {
      // Navigate through the nested path to get results
      return resultsPath.split('.').reduce((obj, path) => obj && obj[path], data) || [];
    }
    return data?.data || [];
  };

  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
  }, 300);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(true);
    debouncedSearch(value);
  };

  const handleSelectItem = (item) => {
    // Set both input value and search term when an item is selected
    setInputValue(item[displayField]);
    setSearchTerm(item[displayField]);
    
    onSelect({
      value: item[valueField],
      label: item[displayField],
      item: item
    });

    setIsOpen(false);
  };

  const handleBlur = () => {
    // Delay closing the dropdown to allow click event to register
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const results = getResults();

  return (
    <div className={`relative ${className}`} onBlur={handleBlur}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        onFocus={() => setIsOpen(true)}
      />

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : searchTerm.length >= minSearchLength && results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No results found</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((item) => (
                <li
                  key={item[valueField]}
                  onClick={() => handleSelectItem(item)}
                  className="px-4 py-2 hover:bg-amber-50 cursor-pointer transition-colors"
                >
                  {renderOption ? renderOption(item) : (
                    <div>
                      <div className="font-medium">{item[displayField]}</div>
                      {item.description && (
                        <div className="text-sm text-gray-500">{item.description}</div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}
