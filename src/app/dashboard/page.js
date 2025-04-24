'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/apiInstances/axios';
import { 
  ChartBarIcon, 
  RefreshIcon, 
  ExclamationCircleIcon,
  DocumentDownloadIcon,
  FilterIcon,
  SearchIcon,
  ArrowSmDownIcon,
  ArrowSmUpIcon,
  ClockIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from '@heroicons/react/outline';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('raw_materials');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      const response = await axiosInstance.get('/inventory/dashboard/');
      return response.data;
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Helper function to safely access nested properties
  const getNestedValue = (obj, path) => {
    if (!path || !obj) return '';
    const properties = path.split('.');
    let value = obj;
    
    for (const prop of properties) {
      if (prop.includes('[')) {
        const arrayProp = prop.split('[')[0];
        const index = parseInt(prop.split('[')[1].split(']')[0]);
        
        if (!value[arrayProp] || !value[arrayProp][index]) return '';
        value = value[arrayProp][index];
      } else {
        if (value === null || value === undefined || !value.hasOwnProperty(prop)) {
          return '';
        }
        value = value[prop];
      }
    }
    
    return value;
  };

  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Column configurations for different data types
  const columnConfigs = {
    raw_materials: {
      check_in: [
        { header: 'Date', accessor: 'history_date', formatter: formatDate },
        { header: 'Material', accessor: 'raw_material.name' },
        { header: 'Quantity', accessor: 'quantity' },
        { header: 'Weight', accessor: 'weight' },
        { header: 'Process', accessor: 'process_step.name' },
        { header: 'Scrap Qty', accessor: 'scrap.quantity' },
        { header: 'Scrap Weight', accessor: 'scrap.weight' },
        { header: 'Created by', accessor: 'done_by' }
      ],
      check_out: [
        { header: 'Date', accessor: 'history_date', formatter: formatDate },
        { header: 'Material', accessor: 'raw_material.name' },
        { header: 'Quantity', accessor: 'quantity' },
        { header: 'Weight', accessor: 'weight' },
        { header: 'Process', accessor: 'process_step.name' },
        { header: 'Output', accessor: 'output_products[0].product_name' },
        { header: 'Scrap Qty', accessor: 'output_products[0].scrap_quantity' },
        { header: 'Scrap Weight', accessor: 'output_products[0].scrap_weight' },
        { header: 'Created by', accessor: 'done_by' }
      ]
    },
    products: {
      check_in: [
        { header: 'Date', accessor: 'history_date', formatter: formatDate },
        { header: 'Product', accessor: 'product.name' },
        { header: 'Quantity', accessor: 'quantity' },
        { header: 'Weight', accessor: 'weight' },
        { header: 'Process', accessor: 'process_step.name' },
        { header: 'Input', accessor: 'input_material.name' },
        { header: 'Scrap Qty', accessor: 'scrap.quantity' },
        { header: 'Scrap Weight', accessor: 'scrap.weight' },
        { header: 'Created by', accessor: 'done_by' }
       

      ],
      check_out: [
        { header: 'Date', accessor: 'history_date', formatter: formatDate },
        { header: 'Product', accessor: 'product.name' },
        { header: 'Quantity', accessor: 'quantity' },
        { header: 'Weight', accessor: 'weight' },
        { header: 'Process', accessor: 'process_step.name' },
        { header: 'Scrap Qty', accessor: 'scrap.quantity' },
        { header: 'Scrap Weight', accessor: 'scrap.weight' },
        { header: 'Created By', accessor: 'done_by' }
      ]
    },
    coils: {
      check_in: [
        { header: 'Date', accessor: 'history_date', formatter: formatDate },
        { header: 'Coil', accessor: 'coil.name' },
        { header: 'Quantity', accessor: 'quantity' },
        { header: 'Weight', accessor: 'weight' },
        { header: 'Thickness', accessor: 'coil.thickness' },
        { header: 'Slit Size', accessor: 'coil.slit_size' },
        { header: 'Created By', accessor: 'done_by' }
      ],
      check_out: [
        { header: 'Date', accessor: 'history_date', formatter: formatDate },
        { header: 'Coil', accessor: 'coil.name' },
        { header: 'Quantity', accessor: 'quantity' },
        { header: 'Weight', accessor: 'weight' },
        { header: 'Remarks', accessor: 'remarks' },
        { header: 'Created By', accessor: 'done_by' }
      ]
    }
  };

  // Filter data based on search term
  const filterData = (items, type, operation) => {
    if (!items || !searchTerm) return items;
    
    return items.filter(item => {
      // Get searchable columns based on type and operation
      const columns = columnConfigs[type][operation];
      
      // Check if any column value includes the search term
      return columns.some(column => {
        const value = getNestedValue(item, column.accessor);
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  };

  // Table loading skeleton
  const TableSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded-md mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-md"></div>
        ))}
      </div>
    </div>
  );

  // Add this function before the renderTable function
  // const calculateScrapSummary = (items, type, operation) => {
  //   if (!items || items.length === 0) return 'No scrap data available';
    
  //   let totalScrapQuantity = 0;
  //   let totalScrapWeight = 0;
  //   let hasScrapData = false;
    
  //   items.forEach(item => {
  //     if (type === 'products' && item.scrap) {
  //       totalScrapQuantity += parseFloat(item.scrap.quantity || 0);
  //       totalScrapWeight += parseFloat(item.scrap.weight?.replace(' kg', '') || 0);
  //       hasScrapData = true;
  //     } else if (type === 'raw_materials' && operation === 'check_out' && item.output_products && item.output_products[0]) {
  //       totalScrapQuantity += parseFloat(item.output_products[0].scrap_quantity || 0);
  //       totalScrapWeight += parseFloat(item.output_products[0].scrap_weight?.replace(' kg', '') || 0);
  //       hasScrapData = true;
  //     }
  //   });
    
  //   if (!hasScrapData) return 'No scrap data available';
    
  //   return `Total Scrap Quantity: ${totalScrapQuantity.toFixed(2)}, Total Scrap Weight: ${totalScrapWeight.toFixed(2)} kg`;
  // };

  // Render data table
  const renderTable = (type, operation) => {
    if (isLoading) {
      return <TableSkeleton />;
    }

    if (!data || !data.data || !data.data[type] || !data.data[type][operation]) {
      return (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No data available</h3>
          <p className="mt-2 text-sm text-gray-500">
            There is no data to display for this section.
          </p>
        </div>
      );
    }

    let items = data.data[type][operation];
    
    if (items.length === 0) {
      return (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No records found</h3>
          <p className="mt-2 text-sm text-gray-500">
            No records were found for this section.
          </p>
        </div>
      );
    }

    // Apply search filter
    items = filterData(items, type, operation);
    
    if (items.length === 0) {
      return (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No matching records</h3>
          <p className="mt-2 text-sm text-gray-500">
            No records match your search criteria. Try adjusting your search.
          </p>
        </div>
      );
    }

    const columns = columnConfigs[type][operation];

    return (
      <div className="overflow-hidden rounded-lg shadow-sm border border-gray-200 animate-fadeIn">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {/* Add Serial Number column */}
                <th 
                  scope="col"
                  className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b"
                >
                  <div className="flex items-center space-x-1 group">
                    <span>S.No</span>
                  </div>
                </th>
                {columns.map((column, index) => (
                  <th 
                    key={index}
                    scope="col"
                    className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b"
                  >
                    <div className="flex items-center space-x-1 group">
                      <span>{column.header}</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowSmUpIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className="hover:bg-blue-50 transition-colors duration-150"
                >
                  {/* Add Serial Number cell */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    {rowIndex + 1}
                  </td>
                  {columns.map((column, colIndex) => {
                    const value = getNestedValue(item, column.accessor);
                    const displayValue = column.formatter ? column.formatter(value) : value;
                    
                    // Special handling for scrap-related columns
                    if (column.accessor.includes('scrap') && !value) {
                      return (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 italic">
                          N/A
                        </td>
                      );
                    }
                    
                    return (
                      <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
         
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{items.length}</span> records
          </div>
          <div className="flex space-x-2">
            {/* <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button> */} 
          </div>
        </div>
      </div>
    );
  };

  // Loading state for the entire page
  if (isLoading && !data) {
    return (
      <DashboardLayout>
        <div className="p-8 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            
            <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8 max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Error loading dashboard data</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>There was an error loading the dashboard data. Please try refreshing the page or contact support if the problem persists.</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <RefreshIcon className={`-ml-1 mr-2 h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate trends (mock data - in a real app, you'd calculate from actual data)
  const getTrend = (type) => {
    const trends = {
      raw_materials: { value: '', isPositive: true },
      products: { value: '', isPositive: true },
      coils: { value: '', isPositive: true },
    };
    return trends[type] || { value: '', isPositive: true };
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Production Dashboard</h1>
                <div className="flex items-center">
                  <div className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse mr-2"></div>
                  <p className="text-blue-100 text-lg">
                    Real-time overview of inventory and production activities
                  </p>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search records..."
                    className="block w-full pl-10 pr-3 py-2 border border-blue-300 rounded-md leading-5 bg-white bg-opacity-90 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                  />
                </div>
                
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-colors duration-150 shadow-sm"
                >
                  <RefreshIcon className={`-ml-1 mr-2 h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fadeIn">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md p-3">
                  <ChartBarIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Raw Materials</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {data?.data?.metadata?.raw_materials_count || 0}
                      </div>
                      <div className="ml-2 flex items-center text-sm font-medium">
                        {getTrend('raw_materials').isPositive ? (
                          <ArrowSmUpIcon className="self-center flex-shrink-0 h-5 w-5 text-green-500" />
                        ) : (
                          <ArrowSmDownIcon className="self-center flex-shrink-0 h-5 w-5 text-red-500" />
                        )}
                        <span className={getTrend('raw_materials').isPositive ? 'text-green-600' : 'text-red-600'}>
                          {getTrend('raw_materials').value}
                        </span>
                      </div>
                    </dd>
                    <dd className="mt-1 text-sm text-gray-500 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" /> Last updated: {new Date().toLocaleTimeString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-r from-green-500 to-green-600 rounded-md p-3">
                  <TrendingUpIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {data?.data?.metadata?.products_count || 0}
                      </div>
                      <div className="ml-2 flex items-center text-sm font-medium">
                        {getTrend('products').isPositive ? (
                          <ArrowSmUpIcon className="self-center flex-shrink-0 h-5 w-5 text-green-500" />
                        ) : (
                          <ArrowSmDownIcon className="self-center flex-shrink-0 h-5 w-5 text-red-500" />
                        )}
                        <span className={getTrend('products').isPositive ? 'text-green-600' : 'text-red-600'}>
                          {getTrend('products').value}
                        </span>
                      </div>
                    </dd>
                    <dd className="mt-1 text-sm text-gray-500 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" /> Last updated: {new Date().toLocaleTimeString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-purple-600 rounded-md p-3">
                  <TrendingDownIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Coils</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {data?.data?.metadata?.coils_count || 0}
                      </div>
                      <div className="ml-2 flex items-center text-sm font-medium">
                        {getTrend('coils').isPositive ? (
                          <ArrowSmUpIcon className="self-center flex-shrink-0 h-5 w-5 text-green-500" />
                        ) : (
                          <ArrowSmDownIcon className="self-center flex-shrink-0 h-5 w-5 text-red-500" />
                        )}
                        <span className={getTrend('coils').isPositive ? 'text-green-600' : 'text-red-600'}>
                          {getTrend('coils').value}
                        </span>
                      </div>
                    </dd>
                    <dd className="mt-1 text-sm text-gray-500 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" /> Last updated: {new Date().toLocaleTimeString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="bg-white rounded-t-lg shadow-sm border border-gray-200 mb-0 animate-fadeIn">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('raw_materials')}
              className={`${
                activeTab === 'raw_materials'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              } flex-1 whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-colors duration-150 focus:outline-none`}
            >
              Raw Materials
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              } flex-1 whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-colors duration-150 focus:outline-none`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('coils')}
              className={`${
                activeTab === 'coils'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              } flex-1 whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-colors duration-150 focus:outline-none`}
            >
              Coils
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        <div className="bg-white shadow-sm border-x border-b border-gray-200 rounded-b-lg p-6 mb-8 animate-fadeIn">
          {activeTab === 'raw_materials' && (
            <>
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Raw Materials Check In</h3>
               
                </div>
                {renderTable('raw_materials', 'check_in')}
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Raw Materials Check Out</h3>
                 
                </div>
                {renderTable('raw_materials', 'check_out')}
              </div>
            </>
          )}

          {activeTab === 'products' && (
            <>
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Products Check In</h3>
                 
                  
                </div>
                {renderTable('products', 'check_in')}
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Products Check Out</h3>
                  
                </div>
                {renderTable('products', 'check_out')}
              </div>
            </>
          )}

          {activeTab === 'coils' && (
            <>
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Coils Check In</h3>
                
                
                </div>
                {renderTable('coils', 'check_in')}
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Coils Check Out</h3>
                 
                </div>
                {renderTable('coils', 'check_out')}
              </div>
            </>
          )}
        </div>
      </div>
      
    
    </DashboardLayout>
  );
}
