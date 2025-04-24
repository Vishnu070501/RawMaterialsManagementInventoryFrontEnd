import React from 'react';

const RawMaterialTable = ({ data, type }) => {
    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-700">
                    {type} {data.length > 0 ? `(${data.length} entries)` : '(No entries)'}
                </h3>
            </div>
            {data.length > 0 ? (
                <div className="overflow-x-auto">
                    <div className="max-h-[250px] overflow-y-auto"> {/* Added max height and scroll */}
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-700 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Raw Material</th>
                                    <th className="px-4 py-3">Quantity</th>
                                    <th className="px-4 py-3">Weight</th>
                                    <th className="px-4 py-3">Process Step</th>
                                    <th className="px-4 py-3">Remarks</th>
                                    <th className="px-4 py-3">Output Products</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((entry, index) => (
                                    <tr
                                        key={index}
                                        className="border-b hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            {new Date(entry.history_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">{entry.raw_material.name}</td>
                                        <td className="px-4 py-3">{entry.quantity}</td>
                                        <td className="px-4 py-3">{entry.weight}</td>
                                        <td className="px-4 py-3">
                                            {entry.process_step && entry.process_step.name ? entry.process_step.name : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">{entry.remarks || 'N/A'}</td>
                                        <td className="px-4 py-3">
                                            {entry.output_products && entry.output_products.length > 0 ? (
                                                entry.output_products.map((product, prodIndex) => (
                                                    <div key={prodIndex} className="mb-1">
                                                        <p className="font-medium">{product.product_name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            Qty: {product.quantity}, Weight: {product.weight}
                                                        </p>
                                                        {product.scrap_quantity > 0 && (
                                                            <p className="text-xs text-red-500">
                                                                Scrap: {product.scrap_quantity} ({product.scrap_weight})
                                                            </p>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-gray-500">No output products</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {data.length > 5 && (
                        <div className="text-center text-xs text-gray-500 mt-2">
                            Showing {Math.min(data.length, 5)} of {data.length} entries
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-4">No entries found</p>
            )}
        </div>
    );
};

export default RawMaterialTable;
