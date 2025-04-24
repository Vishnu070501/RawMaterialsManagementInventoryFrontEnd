'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchBar } from '@/components/inventories/SearchBar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { getData } from '@/api/API';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import ScrapInventoryTable from '@/components/inventories/ScrapInventoryTable';

export default function ScrapInventoriesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [inventoryData, setInventoryData] = useState({ 
    data: [], 
    totalPages: 1, 
    currentPage: 1 
  });
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState(null);
  const [searchActive, setSearchActive] = useState(false);

  // Fetch scrap inventories
  const fetchScrapInventories = async () => {
    const queryString = searchText
      ? `/inventory/search/scrap/?page=${pageNumber}&q=${encodeURIComponent(searchText)}`
      : `/inventory/search/scrap/?page=${pageNumber}`;
    
    try {
      const response = await getData(queryString);
      console.log("Raw API response:", response);
      
      // Return the response directly without modification
      return response;
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message || "Failed to fetch inventory data");
      throw err;
    }
  };

  // React Query for data fetching
  const { data: queryData, isLoading, refetch } = useQuery({
    queryKey: ['scrap-inventories', pageNumber, searchText],
    queryFn: fetchScrapInventories,
    select: (response) => {
      console.log("Response in select:", response);
      
      // Check different possible structures
      let scrapItems = [];
      let totalPages = 1;
      let currentPage = 1;
      
      if (response) {
        // If response.data is an array
        if (response.data && Array.isArray(response.data)) {
          scrapItems = response.data;
        } 
        // If response.data contains results array
        else if (response.data && response.data.results && Array.isArray(response.data.results)) {
          scrapItems = response.data.results;
          totalPages = response.data.total_pages || 1;
          currentPage = response.data.current_page || 1;
        }
        // If response itself is the array
        else if (Array.isArray(response)) {
          scrapItems = response;
        }
        // If response has results directly
        else if (response.results && Array.isArray(response.results)) {
          scrapItems = response.results;
          totalPages = response.total_pages || 1;
          currentPage = response.current_page || 1;
        }
        
        // Extract pagination info
        if (response.total_pages) totalPages = response.total_pages;
        if (response.current_page) currentPage = response.current_page;
      }
      
      console.log("Extracted scrap items:", scrapItems);
      
      return {
        inventoryData: scrapItems.map((item, index) => ({
          ...item,
          sr_no: item.sr_no || (pageNumber - 1) * 10 + index + 1
        })),
        totalPages: totalPages,
        currentPage: currentPage
      };
    },
    enabled: true,
    onError: (error) => {
      console.error('Fetch Scrap Inventories Error:', error);
      setError(error.message || "An error occurred while fetching data");
    }
  });
  
  // Update inventory data when query data changes
  useEffect(() => {
    console.log("Query data:", queryData);
    if (queryData) {
      setInventoryData({
        data: queryData.inventoryData,
        totalPages: queryData.totalPages,
        currentPage: queryData.currentPage
      });
     
    }
  }, [queryData]);

  // Search handling
  const handleSearch = (searchResults) => {
    try {
      console.log("Search results received:", searchResults);
      
      // Check if searchResults exists and is valid
      if (!searchResults) {
        console.error("Search results are undefined or null");
        setError("Search failed: No results returned");
        return;
      }
      
      // If searchResults is not an array but has a data property that is an array
      const resultsArray = Array.isArray(searchResults) 
        ? searchResults 
        : (searchResults.data && Array.isArray(searchResults.data) 
            ? searchResults.data 
            : (searchResults.results && Array.isArray(searchResults.results) 
                ? searchResults.results 
                : []));
      
      if (resultsArray.length > 0) {
        const firstResult = resultsArray[0];
        if (firstResult && firstResult.searchTerm) {
          setSearchText(firstResult.searchTerm || '');
        }
      }
      
      setSearchActive(true);

      const dataWithSerialNumbers = resultsArray.map((item, index) => ({
        ...item,
        sr_no: item.original_sr_no || item.sr_no || index + 1
      }));
      
      setInventoryData({
        data: dataWithSerialNumbers,
        totalPages: searchResults.total_pages || 1,
        currentPage: searchResults.current_page || 1
      });
      
      // Clear any previous errors
      setError(null);
    } catch (err) {
      console.error("Error processing search results:", err);
      setError("Search failed: " + (err.message || "Unknown error"));
    }
  };

  // Clear search handling
  const handleClearSearch = () => {
    setSearchActive(false);
    setSearchText('');
    setPageNumber(1);
    setError(null);
    refetch();
  };

  // Item click handler
  const handleItemClick = (item) => {
    handleClearSearch();
    localStorage.setItem('lastClickedItemId', item.id);
  };

  // Page change handlers
  const handlePageChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setPageNumber('');
    } else {
      const pageNum = parseInt(value);
      if (!isNaN(pageNum)) {
        setPageNumber(pageNum);
      }
    }
  };

  const handlePageChangeBlur = () => {
    if (pageNumber === '') {
      setPageNumber(1);
    } else {
      const validatedPage = Math.min(Math.max(1, pageNumber), inventoryData.totalPages || 1);
      setPageNumber(validatedPage);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen text-sm">
        <div className="flex-1 bg-gradient-to-br from-amber-50 to-orange-100">
          <PageHeader
            title="Scrap Inventories"
            description="View and manage scrap inventory items"
            className="py-3 md:py-4"
          />
          
          <div className="max-w-[100%] xl:max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <main className="py-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <div className="w-full sm:w-auto">
                  <SearchBar
                    onSearch={handleSearch}
                    onClear={handleClearSearch}
                    className="w-full sm:min-w-[250px]"
                  />
                </div>
                
                <button
                  onClick={() => router.push('/add-stock?type=scrap')}
                  className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md
                    transition-all duration-300 transform hover:scale-105 active:scale-95
                    shadow-md hover:shadow-lg text-xs md:text-sm font-medium
                    flex items-center justify-center gap-2"
                >
                  <span className="hidden sm:inline">Add New</span> Scrap
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-lg">
                {isLoading && !searchActive && (
                  <div className="flex justify-center items-center min-h-[300px]">
                    <LoadingSpinner size="sm"/>
                  </div>
                )}

                {error && (
                  <div className="flex justify-center items-center min-h-[300px]">
                    <ErrorMessage message={error} />
                  </div>
                )}

                {!isLoading && !error && (
                  <div className="overflow-x-auto">
                    <ScrapInventoryTable
                      data={inventoryData.data}
                      pageNumber={pageNumber}
                      onItemClick={handleItemClick}
                    />
                  </div>
                )}
              </div>

              {!searchActive && (
                <div className="flex justify-center items-center gap-2 py-2 mb-4">
                  <button
                    onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                    disabled={pageNumber === 1}
                    className="px-2 py-1 text-amber-600 disabled:text-gray-400 text-xs"
                  >
                    &lt;
                  </button>

                  <input
                    type="text"
                    value={pageNumber}
                    onChange={handlePageChange}
                    onBlur={handlePageChangeBlur}
                    className="w-8 sm:w-10 text-center border border-amber-200 rounded px-1 py-0.5 text-xs"
                  />
                  <span className="text-amber-900 text-xs">
                    of {inventoryData.totalPages}
                  </span>

                  <button
                    onClick={() => setPageNumber(prev => Math.min(inventoryData.totalPages, prev + 1))}
                    disabled={pageNumber === inventoryData.totalPages}
                    className="px-2 py-1 text-amber-600 disabled:text-gray-400 text-xs"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
