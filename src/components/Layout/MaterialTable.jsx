'use client';

import { useState } from 'react';
import TableHeader from '../RawMaterials/table_header';

export default function MaterialTable({ data, handleAdd, buttonText, buttonColor }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-3">{buttonText} Materials</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <TableHeader />
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b">
                {Object.values({
                  id: item.id,
                  item_name: item.item_name,
                  description: item.description,
                  price: item.price,
                }).map((field, i) => (
                  <td key={i} className="px-3 py-2">{field}</td>
                ))}
                <td className="px-3 py-2">
                  <button
                    onClick={() => handleAdd(item)}
                    className={`${buttonColor} text-white px-3 py-1 rounded text-xs`}
                  >
                    {`Add as ${buttonText}`}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
