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
import RawMaterialInventoryTable from '@/components/inventories/RawMaterialInventoryTable';

export default function RawMaterialInventoriesPage() {
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

  // Fetch raw material inventories
  const fetchRawMaterialInventories = async () => {
    const queryString = searchText
      ? `/inventory/search/raw_materials/?page=${pageNumber}&q=${encodeURIComponent(searchText)}`
      : `/inventory/search/raw_materials/?page=${pageNumber}`;

    try {
      const response = await getData(queryString);
      
      // Add serial number to each item
      if (response && response.data && response.data.results) {
        response.data.results = response.data.results.map((item, index) => ({
          ...item,
          sr_no: (pageNumber - 1) * 10 + index + 1 // Calculate serial number
        }));
      }
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // React Query for data fetching
  const { data: queryData, isLoading, refetch } = useQuery({
    queryKey: ['raw-material-inventories', pageNumber, searchText],
    queryFn: fetchRawMaterialInventories,
    select: (response) => ({
      inventoryData: response.data.results.map((item) => ({
        ...item,
        sr_no: item.sr_no || 0
      })),
      totalPages: response.data.total_pages,
      currentPage: response.data.current_page
    }),
    enabled: true,
    onError: (error) => {
      console.error('Fetch Raw Material Inventories Error:', error);
      setError(error.message);
    }
  });

  // Update inventory data when query data changes
  useEffect(() => {
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
    if (searchResults && searchResults.length > 0) {
      const firstResult = searchResults[0];
      if (firstResult.searchTerm) {
        setSearchText(firstResult.searchTerm || '');
      }
    }
    setSearchActive(true);

    // Add serial numbers to search results
    const dataWithSerialNumbers = searchResults.map((item, index) => ({
      ...item,
      sr_no: index + 1 // Simple serial numbering for search results
    }));

    setInventoryData({
      data: dataWithSerialNumbers,
      totalPages: 1,
      currentPage: 1
    });
  };

  // Clear search handling
  const handleClearSearch = () => {
    setSearchActive(false);
    setSearchText('');
    setPageNumber(1);
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
            title="Raw Material Inventories"
            description="View and manage raw material inventory items"
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
                  onClick={() => router.push('/add-stock?type=raw-material')}
                  className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md
                    transition-all duration-300 transform hover:scale-105 active:scale-95
                    shadow-md hover:shadow-lg text-xs md:text-sm font-medium
                    flex items-center justify-center gap-2"
                >
                  <span className="hidden sm:inline">Add New</span> Raw Material
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
                    <RawMaterialInventoryTable
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
