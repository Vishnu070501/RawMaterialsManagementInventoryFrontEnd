'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchBar } from '@/components/inventories/SearchBar';
import { InventoryTable } from '@/components/inventories/InventoryTable';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { getData } from '@/api/API';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CoilTable } from '@/components/inventories/CoilIventoryTable';

export default function InventoriesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [inventoryData, setInventoryData] = useState({ data: [], totalPages: 1, currentPage: 1 });
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState(null);
  const [searchActive, setSearchActive] = useState(false);

  const fetchInventories = async () => {
    const queryString = searchText
      ? `inventory/search/inventory/?page=${pageNumber}&q=${encodeURIComponent(searchText)}`
      : `inventory/search/inventory/?page=${pageNumber}`;
    const response = await getData(queryString);

    if (response && response.data && response.data.results) {
      // Add unique identifiers to each item
      response.data.results = response.data.results.map((item, index) => {
        // Create a truly unique ID for each item
        const uniqueId = `item-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
        
        return {
          ...item,
          original_sr_no: item.sr_no || (pageNumber - 1) * 30 + index + 1,
          _uniqueId: uniqueId
        };
      });
    }
    return response;
  };

  const { data: queryData, isLoading, refetch } = useQuery({
    queryKey: ['inventories', pageNumber, searchText],
    queryFn: fetchInventories,
    select: (response) => ({
      inventoryData: response.data.results.map((item) => ({
        ...item,
        sr_no: item.original_sr_no || item.sr_no || 0
      })),
      totalPages: response.data.total_pages,
      currentPage: response.data.current_page
    }),
    enabled: true
  });

  useEffect(() => {
    if (queryData) {
      setInventoryData({
        data: queryData.inventoryData,
        totalPages: queryData.totalPages,
        currentPage: queryData.currentPage
      });
    }
  }, [queryData]);

  const handleSearch = (searchResults) => {
    if (searchResults && searchResults.length > 0) {
      const firstResult = searchResults[0];
      if (firstResult.searchTerm) {
        setSearchText(firstResult.searchTerm || '');
      }
    }
    setSearchActive(true);

    // Add unique identifiers to search results
    const dataWithUniqueIds = searchResults.map((item, index) => {
      const uniqueId = `search-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
      return {
        ...item,
        sr_no: item.original_sr_no || item.sr_no || index + 1,
        _uniqueId: uniqueId
      };
    });

    setInventoryData({
      data: dataWithUniqueIds,
      totalPages: 1,
      currentPage: 1
    });
  };

  const handleClearSearch = () => {
    setSearchActive(false);
    setSearchText('');
    setPageNumber(1);
    refetch();
  };

  // const handleFilterApply = (newFilters) => {
  //   setFilters(newFilters);
  //   setPageNumber(1);
  //   setSearchActive(false);
  //   // refetch();
  // };

  const handleItemClick = (item) => {
    handleClearSearch();
    localStorage.setItem('lastClickedItemId', item.id);
  };

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
            title="Inventories Management"
            description="Search and view inventory by item details"
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
                  {/* <InventoryFilter onFilterApply={handleFilterApply} /> */}
                </div>
                <button
                  onClick={() => router.push('/add-stock')}
                  className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md
                    transition-all duration-300 transform hover:scale-105 active:scale-95
                    shadow-md hover:shadow-lg text-xs md:text-sm font-medium
                    flex items-center justify-center gap-2"
                >
                  <span className="hidden sm:inline">Add New</span> Stock
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
                    <InventoryTable
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
