'use client';

import { useState, useEffect } from 'react';
import { getData } from '@/api/API';
import debounce from 'lodash/debounce';

export default function ProductSearch({
  onSelect,
  onSearch,
  onClear,
  placeholder = "Search products...",
  className = "",
  minSearchLength = 2
}) {
  const [searchText, setSearchText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  // Remove the leading slash to avoid double slashes
  const searchEndpoint = 'inventory/search/products/';

  // Create a debounced search function that persists between renders
  const debouncedSearch = debounce((text) => {
    if (text.length >= minSearchLength) {
      performSearch(text);
    }
  }, 300);

  // Cleanup the debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  const performSearch = async (text) => {
    if (!text.trim()) {
      if (onClear) {
        onClear();
      }
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Searching for: ${text}`);
      const response = await getData(`${searchEndpoint}?q=${encodeURIComponent(text)}`);
      console.log('Search response:', response);
      
      if (response && response.data && response.data.results) {
        const processedResults = response.data.results.map(item => ({
          ...item,
          searchTerm: text,
          original_sr_no: item.sr_no
        }));
        
        setSearchResults(processedResults);
        console.log('Processed results:', processedResults);
        
        if (onSearch) {
          onSearch(processedResults);
        }
      } else {
        console.log('No results found or unexpected response format');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    performSearch(searchText);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    
    // Show dropdown when typing
    setIsOpen(true);
    
    // Trigger debounced search
    debouncedSearch(value);
    
    // Clear if empty
    if (!value) {
      handleClear();
    }
  };

  const handleSelectItem = (item) => {
    setSearchText(item.product_name);
    setIsOpen(false);
    
    if (onSelect) {
      onSelect({
        value: item.id,
        label: item.product_name,
        item: item
      });
    }
  };

  const handleClear = () => {
    setSearchText('');
    setSearchResults([]);
    setIsOpen(false);
    
    if (onClear) {
      onClear();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle clicks outside to close dropdown
  const handleBlur = () => {
    // Delay closing to allow click events to register
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full px-3 py-1.5 pl-8 rounded-md border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm"
              onFocus={() => setIsOpen(true)}
              onBlur={handleBlur}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-2">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleSearch}
            disabled={isLoading}
            className="px-4 py-1.5 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors disabled:bg-amber-300 text-sm"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
          
          {searchText && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
            >
              Clear
            </button>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-red-500 text-xs">{error}</p>
        )}
        
        {searchResults.length > 0 && searchText && (
          <p className="mt-1 text-amber-700 text-xs">
            Found {searchResults.length} results for "{searchText}"
          </p>
        )}
      </div>

      {/* {isOpen && searchResults.length > 0 && (
        <div className="absolute z-10 w-full -mt-3 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          <ul>
            {searchResults.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelectItem(item)}
                className="px-4 py-2 hover:bg-amber-50 cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-medium">{item.product_name}</div>
                  {item.product_description && (
                    <div className="text-sm text-gray-500">{item.product_description}</div>
                  )}
                  {item.thickness && (
                    <div className="text-xs text-gray-400">
                      Thickness: {item.thickness} | Slit Size: {item.slit_size} | Blank Size: {item.blank_size}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )} */}
    </div>
  );
}
