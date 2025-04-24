'use client'

import { useQuery } from '@tanstack/react-query';
import { getData } from '@/api/API';

export const StockOutTable = ({ id, modelType }) => {
    const { data: stockHistory, isLoading, error } = useQuery({
        queryKey: ['stock-history', id, 'checkout'],
        queryFn: async () => {
            const endpoint = modelType === 'coil'
                ? `/inventory/stock-history/coil/?id=${id}`
                : modelType === 'product'
                    ? `/inventory/stock-history/product/?id=${id}`
                    : `/inventory/stock-history/rawmaterial/?id=${id}`;
            const response = await getData(endpoint);
            return {
                ...response,
                data: response.data.filter(item => item.history_type === 'check_out')
            };
        },
        enabled: !!id,
    });

    const columns = [
        { key: 'history_date', label: 'DATE' },
        { key: 'history_type', label: 'TYPE' },
        { key: 'quantity', label: 'QUANTITY' },
        { key: "weight", label: "WEIGHT" },
        { key: "for_output", label: "OUTPUT PRODUCT" },
        { key: "for_process_step", label: "PROCESS STEP" },
        { key: "for_sequence", label: "SEQUENCE" },
        { key: "output_quantity", label: "USED QUANTITY" },
        { key: "output_scrap_quantity", label: "SCRAP QUANTITY" },
        { key: "output_scrap_weight", label: " SCRAP WEIGHT" },
        { key: 'output_weight', label: 'USED WEIGHT' },
        { key: 'created_by', label: 'CREATED-BY' },
        { key: 'remarks', label: 'REMARKS' }
    ];

    if (error) {
        return <div>Error loading data: {error.message}</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-red-50">
                    <tr>
                        {columns.map(column => (
                            <th key={column.key} className="px-3 py-2 text-left font-semibold text-red-900 text-xs whitespace-nowrap">
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-2 text-center text-sm">
                                Loading...
                            </td>
                        </tr>
                    ) : stockHistory?.data?.length > 0 ? (
                        stockHistory.data.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-green-50/50">
                                {columns.map((column) => (
                                    <td key={column.key} className="px-3 py-2 text-sm whitespace-nowrap">
                                        {column.key === "history_date"
                                            ? new Date(item[column.key]).toLocaleDateString("en-IN", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })
                                            : item[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-2 text-center text-gray-500 text-sm">
                                No checkout history available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
