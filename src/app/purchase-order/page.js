'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PurchaseOrderTable from '../../components/Purchase-Order/po-table';
import { getData } from '@/api/API';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Loading } from '@/components/PO-Approval/loading';
import EditPurchaseOrderPopup from '../../components/Purchase-Order/edit-podetails';
import SearchBar from '../../components/Purchase-Order/searchbar';

export default function PurchaseOrderPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);


  const [searchText, setSearchText] = useState('');


  const handleSearch = (searchTerm) => {
    setSearchText(searchTerm);
    setPageNumber(1); // Reset to first page when searching
  };
  const { data, isLoading } = useQuery({
    queryKey: ['purchaseOrders', pageNumber, searchText],
    queryFn: () => getData(`/purchase-order-app/fetch-all-purchase-orders/?page=${pageNumber}&search=${searchText}`),
    select: (response) => ({
      totalPages: response.total_pages,
      currentPage: response.current_page,
      data: response.data.map((obj, index) => ({
        ...obj,
        s_no: (pageNumber - 1) * 30 + index + 1,
      })),
    }),
  });

  const handlePageChange = (event) => {
    let value = event.target.value;
    if (value === "") {
      setPageNumber("");
      return;
    }

    value = parseInt(value.replace(/^0+/, ""), 10);

    if (isNaN(value) || value < 1) {
      setPageNumber(1);
    } else if (value > data?.totalPages) {
      setPageNumber(data?.totalPages);
    } else {
      setPageNumber(value);
    }
  };

  const handlePageChangeBlur = () => {
    if (pageNumber === "") {
      setPageNumber(1);
    }
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleUpdate = (updatedOrder) => {
    // Handle the update logic here
    setIsEditModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen">
        <header className="bg-white/80 backdrop-blur-sm border-b border-amber-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <h1 className="text-2xl sm:text-2xl font-bold text-amber-800">Purchase Order Management</h1>
            <p className="text-sm sm:text-base text-amber-600 mt-2">Search and manage purchase orders</p>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loading />
              </div>
            ) : (

              <div className="flex flex-col h-full">
                <div className='w-8'>
                  <SearchBar onSearch={handleSearch}
                  />
                </div>
                <div className="flex-1 overflow-auto">
                  <PurchaseOrderTable
                    data={data?.data || []}
                    onEdit={handleEdit}
                  />
                </div>


                <div className="flex justify-center items-center gap-4 py-4 mb-8  ">
  
                  <button
                    onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                    disabled={pageNumber === 1}
                    className="px-3 sm:px-4 py-2 text-amber-600 disabled:text-gray-400"
                  >
                    &lt;
                  </button>

                  <input
                    type="text"
                    value={pageNumber}
                    onChange={handlePageChange}
                    onBlur={handlePageChangeBlur}
                    className="w-12 sm:w-16 text-center border border-amber-200 rounded px-2 py-1"
                  />
                  <span className="text-amber-900">
                    of {data?.totalPages || 1}
                  </span>

                  <button
                    onClick={() => setPageNumber(prev => Math.min(data?.totalPages || 1, prev + 1))}
                    disabled={pageNumber === data?.totalPages}
                    className="px-3 sm:px-4 py-2 text-amber-600 disabled:text-gray-400"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isEditModalOpen && (
        <EditPurchaseOrderPopup
          order={selectedOrder}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdate}
        />
      )}
    </DashboardLayout>
  );
}
