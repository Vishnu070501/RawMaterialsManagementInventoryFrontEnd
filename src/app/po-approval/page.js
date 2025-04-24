"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getData } from "@/api/API";
import DashboardLayout from '@/components/Layout/DashboardLayout';

import { Loading } from '@/components/PO-Approval/loading';
import PoApprovalCards from '@/components/PO-Approval/PoApprovalCards';
import ApprovalDetailsPage from '@/components/PO-Approval/approvals-details';

const fetchRequests = async () => {
  const response = await getData("/inventory/fetch-approvals/check_in/");
  return response.data;
};

const PoApprovalPage = () => {
  const [selectedPoNumber, setSelectedPoNumber] = useState(null);
  const [selectedApproverId, setSelectedApproverId] = useState(null);

  const { data: requests, isLoading, isError, error } = useQuery({
    queryKey: ['requests'],
    queryFn: fetchRequests,
    refetchInterval: 2000,
    refetchOnWindowFocus: true
  });

  const handleApprovalDetailsClick = (po_id, requester_id) => {
    setSelectedPoNumber(po_id);
    setSelectedApproverId(requester_id);
  };

  const handleBackClick = () => {
    setSelectedPoNumber(null);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        {selectedPoNumber ? (
          <ApprovalDetailsPage po_id={selectedPoNumber} onBack={handleBackClick} requester_id={selectedApproverId} />
        ) : (
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <header className="bg-white/30 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-sm border border-amber-100/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-2xl font-bold text-amber-800 tracking-tight">
                      Purchase Order Approvals
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-amber-600">
                      Review and manage pending purchase order requests efficiently
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-amber-100 text-amber-800">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      Active Requests
                    </span>
                  </div>
                </div>
              </header>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loading sizeClass="h-16 w-16" />
                </div>
              ) : isError ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-red-800">Error Loading Requests</h3>
                      <p className="mt-1 text-sm text-red-700">{error.message}</p>
                    </div>
                  </div>
                </div>
              ) : (
               
                <div className="grid gap-6 animate-fadeIn">
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-amber-100/50">
                
                    <PoApprovalCards 
                      
                      requests={requests} 
                      handleApproval={handleApprovalDetailsClick} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PoApprovalPage;
