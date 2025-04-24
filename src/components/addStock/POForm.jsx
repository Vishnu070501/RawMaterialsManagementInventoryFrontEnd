import { useState } from "react";

const POForm = ({ onSubmit, loading }) => {
  const [poNumber, setPoNumber] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (poNumber.trim()) {
      onSubmit(poNumber);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex flex-row items-center gap-2">
        <input
          type="text"
          value={poNumber}
          onChange={(e) => setPoNumber(e.target.value)}
          placeholder="PO/OAPL/2425/0049"
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 text-xs"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg transition-all duration-300 text-xs whitespace-nowrap"
        >
          {loading ? "Searching..." : "Search PO"}
        </button>
      </div>
    </form>
  );
};

export default POForm;
