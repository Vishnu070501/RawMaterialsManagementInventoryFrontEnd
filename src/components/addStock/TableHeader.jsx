const TableHeader = ({ headers }) => (
  <thead className="bg-gray-100">
    <tr>
      {headers.map((header, index) => (
        <th 
          key={index} 
          className="px-1 py-1 text-left text-[10px] font-medium text-gray-500 uppercase tracking-tight whitespace-nowrap truncate"
        >
          {header}
        </th>
      ))}
    </tr>
  </thead>
);

export default TableHeader;
