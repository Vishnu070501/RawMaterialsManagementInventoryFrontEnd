"use client";

import { useQuery } from "@tanstack/react-query";
import { getData } from "@/api/API";

export const StockInTable = ({ id, modelType }) => {
  const chooseApiEndpoint = () => {
    const endpoint =
      modelType === "coil"
        ? `/inventory/stock-history/coil/?id=${id}`
        : modelType === "product"
        ? `/inventory/stock-history/product/?id=${id}`
        : `/inventory/stock-history/rawmaterial/?id=${id}`;
    return endpoint;
  };

  const {
    data: stockHistory,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["stock-history", id],
    queryFn: async () => {
      const endpoint = chooseApiEndpoint();
      const response = await getData(endpoint);
      return {
        ...response,
        data: response.data.filter((item) => item.history_type === "check_in"),
      };
    },
    enabled: !!id,
  });

  const columns = [
    { key: "history_date", label: "DATE" },
    { key: "history_type", label: "TYPE" },
    { key: "created_by", label: "CREATED BY" },
    { key: "remarks", label: "REMARKS" },
    { key: "from_sequence", label: "SEQUENCE" },
    { key: "from_process_step", label: "PROCESS STEP" },
    { key: "from_input", label: "INPUT" },
    { key: "input_type", label: "INPUT TYPE" },
    { key: "input_name", label: "INPUT NAME" },
    { key: "input_quantity", label: "INPUT QUANTITY" },
    { key: "input_weight", label: "INPUT WEIGHT" },
    { key: "total_scrap_quantity", label: "TOTAL SCRAP QUANTITY" },
    { key: "total_scrap_weight", label: "TOTAL SCRAP WEIGHT" },
    { key: "quantity", label: "QUANTITY" },
    { key: "weight", label: "WEIGHT" },
    { key: "quantity_unit_name", label: "QUANTITY UNIT" },
    { key: "weight_unit_name", label: "WEIGHT UNIT" },
  ];
  

  if (error) {
    return <div className="text-xs">Error loading data: {error.message}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-green-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-3 py-2 text-left font-semibold text-red-900 text-xs whitespace-nowrap"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-2 py-1 text-center text-sm"
              >
                Loading...
              </td>
            </tr>
          ) : stockHistory?.data?.length > 0 ? (
            stockHistory.data.map((item, index) => (
              <tr key={index} className="border-b hover:bg-green-50/50">
                {columns.map((column) => (
                  <td
                  key={column.key}
                  className="px-2 py-1 text-sm whitespace-nowrap"
                >
                  {column.key === "history_date" ? (
                    new Date(item[column.key]).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  ) : column.key === "quantity_unit_name" ? (
                    item.quantity_unit?.name || ""
                  ) : column.key === "weight_unit_name" ? (
                    item.weight_unit?.name || ""
                  ) : (
                    item[column.key]
                  )}
                </td>
                
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-2 py-1 text-center text-gray-500 text-sm"
              >
                No history available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
