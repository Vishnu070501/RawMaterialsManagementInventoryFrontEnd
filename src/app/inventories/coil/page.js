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
import CoilInventoryTable from '@/components/inventories/CoilIventoryTable';

export default function CoilInventoriesPage() {
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

  // Fetch coil inventories
  const fetchCoilInventories = async () => {
    const queryString = searchText
      ? `/inventory/search/coils/?page=${pageNumber}&q=${encodeURIComponent(searchText)}`
      : `/inventory/search/coils/?page=${pageNumber}`;
    
    try {
      const response = await getData(queryString);
      console.log("Response data:", response.data);
      if (response && response.data && response.data.results) {
        response.data.results = response.data.results.map((item, index) => ({
          ...item,
          original_sr_no: item.sr_no || (pageNumber - 1) * 10 + index + 1
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
    queryKey: ['coil-inventories', pageNumber, searchText],
    queryFn: fetchCoilInventories,
    select: (response) => ({
      inventoryData: response.data.results.map((item) => ({
        ...item,
        sr_no: item.original_sr_no || item.sr_no || 0
      })),
      totalPages: response.data.total_pages,
      currentPage: response.data.current_page
    }),
    enabled: true,
    onError: (error) => {
      console.error('Fetch Coil Inventories Error:', error);
      setError(error.message);
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
    if (searchResults && searchResults.length > 0) {
      const firstResult = searchResults[0];
      if (firstResult.searchTerm) {
        setSearchText(firstResult.searchTerm || '');
      }
    }
    setSearchActive(true);

    const dataWithSerialNumbers = searchResults.map((item) => ({
      ...item,
      sr_no: item.original_sr_no || item.sr_no
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
            title="Coil Inventories"
            description="View and manage coil inventory items"
            className="py-3 md:py-4"
          />
          
          <div className="max-w-[100%] xl:max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <main className="py-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <SearchBar
                  onSearch={handleSearch}
                  onClear={handleClearSearch}
                  className="w-full sm:min-w-[250px]"
                />
                
                <button
                  onClick={() => router.push('/add-stock?type=coil')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md 
                    transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  Add New Coil
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
                    <CoilInventoryTable
                      data={inventoryData.data}
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
