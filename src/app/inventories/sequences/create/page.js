"use client";

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { useRouter } from 'next/navigation';
import CreateSequenceModal from '@/components/create-product/CreateSequenceModal';
import SequenceTable from '@/components/create-product/SequenceTable';
import axiosInstance from '@/app/lib/apiInstances/axios';

// Function to fetch sequences data
const fetchSequences = async (page = 1) => {
  try {
    const response = await axiosInstance.get(`/process/get/sequence/?page_no=${page}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch sequences');
  }
};

export default function SequencesPage() {
  const router = useRouter();
  const [pageNumber, setPageNumber] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sequenceData, setSequenceData] = useState({
    data: [],
    totalPages: 1,
    currentPage: 1
  });

  // Fetch sequences data using TanStack Query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['sequences', pageNumber],
    queryFn: () => fetchSequences(pageNumber),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (response) => ({
      results: response.data.results || [],
      totalPages: response.data.total_pages || 1,
      currentPage: response.data.current_page || 1,
      totalCount: response.data.total_count || 0
    })
  });

  // Update sequence data when query data changes
  useEffect(() => {
    if (data) {
      setSequenceData({
        data: data.results,
        totalPages: data.totalPages,
        currentPage: data.currentPage
      });
    }
  }, [data]);

  // Modal handlers
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  const handleSequenceCreated = (newSequence) => {
    // Refetch data after creating a new sequence
    refetch();
    closeModal();
  };

  // Handle sequence item click
  const handleSequenceClick = (item) => {
    // You can implement any action when a sequence is clicked
    console.log("Sequence clicked:", item);
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
      const validatedPage = Math.min(Math.max(1, pageNumber), sequenceData.totalPages || 1);
      setPageNumber(validatedPage);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen text-sm">
        <div className="flex-1 bg-gradient-to-br from-amber-50 to-orange-100">
          <PageHeader
            title="Manufacturing Sequences"
            description="Manage your product manufacturing sequences"
            className="py-3 md:py-4"
          />
          <div className="max-w-[100%] xl:max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <main className="py-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <div className="w-full sm:w-auto">
                  {/* Search or filter components can go here */}
                </div>
                {/* Button to open the modal */}
                <button
                  onClick={openModal}
                  className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md
                    transition-all duration-300 transform hover:scale-105 active:scale-95
                    shadow-md hover:shadow-lg text-xs md:text-sm font-medium
                    flex items-center justify-center gap-2"
                >
                  <span className="hidden sm:inline">Add New</span> Sequence
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Display loading state */}
              {isLoading && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              )}

              {/* Display error state */}
              {isError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <strong className="font-bold">Error!</strong>
                  <span className="block sm:inline"> {error.message || 'Failed to load sequences'}</span>
                </div>
              )}

              {/* Display sequences table */}
              {!isLoading && !isError && data && (
                <div className="bg-white rounded-xl shadow-lg">
                  <SequenceTable 
                    data={{
                      results: data.results,
                      total_pages: data.totalPages,
                      current_page: data.currentPage,
                      total_count: data.totalCount
                    }}
                    pageNumber={pageNumber}
                    onItemClick={handleSequenceClick}
                  />
                </div>
              )}

              {/* Pagination controls */}
              {!isLoading && !isError && data && data.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 py-2 mt-4">
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
                  <span className="text-amber-900 text-xs">of {sequenceData.totalPages}</span>
                  <button
                    onClick={() => setPageNumber(prev => Math.min(sequenceData.totalPages, prev + 1))}
                    disabled={pageNumber === sequenceData.totalPages}
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

      {/* Add the CreateSequenceModal component */}
      <CreateSequenceModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onSuccess={handleSequenceCreated} 
      />
    </DashboardLayout>
  );
}
