import { useState } from 'react';
import { getData } from '@/api/API';
import { usePathname } from 'next/navigation';

export function SearchBar({ onSearch, onClear }) {
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const pathname = usePathname();
  const getModelType = () => {
    if (pathname.includes('/inventories/scrap')) {
      return 'scrap';
    } else if (pathname.includes('/inventories/raw-material')) {
      return 'raw_materials';
    } else if (pathname.includes('/inventories/coil')) {
      return 'coil';
    } else if (pathname.includes('/inventories/product')) {
      return 'product';
    }
    // Default fallback
    return 'raw_materials';
  };
  const search = async () => {
    if (!searchText.trim()) {
      if (onClear) {
        onClear();
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const response = await getData('/inventory/');
        setSearchResults(response.data);
        onSearch(response.data);
      } catch (error) {
        console.error('Error fetching all inventory items:', error);
        setError('Failed to fetch inventory items');
      } finally {
        setIsLoading(false);
      }
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const model_type = getModelType();
      // Simple search across all fields
      const response = await getData(`/inventory/search/${model_type}/?q=${encodeURIComponent(searchText)}`);
      const processedResults = response.data.results.map(item => ({
        ...item,
        searchTerm: searchText,
        original_sr_no: item.sr_no
      }));
      setSearchResults(processedResults);
      onSearch(processedResults);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSearchText('');
    setSearchResults([]);
    if (onClear) {
      onClear();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      search();
    }
  };

  return (
    <div className="mb-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by item name, description, coil name..."
            className="w-full px-3 py-1.5 pl-8 rounded-md border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm"
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
          onClick={search}
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
  );
}
