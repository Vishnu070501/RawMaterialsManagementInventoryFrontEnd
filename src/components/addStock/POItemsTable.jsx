import TableHeader from "./TableHeader";

const POItemsTable = ({ items, headers, handleAction }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 text-xs">
      <TableHeader headers={headers} />
      <tbody className="bg-white divide-y divide-gray-200">
        {Array.isArray(items) && items.length > 0 ? (
          items.map((item, index) => {
            const rowData = [
              item.name,
              item.description,
              item.hsn_code || "-",
              item.po_quantity,
              item.remaining_quantity,
              item.unit_price,
              `${item.tax_percent}%`,
              item.expected_delivery_date,
            ];

            return (
              <tr key={index} className="hover:bg-gray-50">
                {rowData.map((data, idx) => (
                  <td key={idx} className="px-1 py-1 whitespace-nowrap text-xs truncate max-w-xs">
                    {data}
                  </td>
                ))}

                <td className="px-2 py-1 whitespace-nowrap">
                  <div className="flex gap-1">
                    {/* Show Sheet button only when existing_material_type is not 'coil' */}
                    {item.existing_material_type !== "coil" && (
                      <button
                        onClick={() => handleAction("sheet", item)}
                        className="px-1 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors duration-200 flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-2.5 w-2.5 mr-0.5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                        </svg>
                        Sheet
                      </button>
                    )}

                    {/* Show Coil button only when existing_material_type is not 'sheet' */}
                    {item.existing_material_type !== "sheet" && (
                      <button
                        onClick={() => handleAction("coil", item)}
                        className="px-1 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors duration-200 flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-2.5 w-2.5 mr-0.5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Coil
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={headers.length} className="px-1 py-1 text-center text-xs">
              No items found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default POItemsTable;
