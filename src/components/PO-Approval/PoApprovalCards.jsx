"use client";

const PoApprovalCards = ({ requests, handleApproval }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {requests.map((request) => (
        <div
          key={request.po_id}
          className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
          onClick={() => handleApproval(request.po_id, request.requester_id)}
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="flex flex-col gap-2">
              <span className="text-white/80 text-sm font-medium">Purchase Order</span>
              <h2 className="text-xl font-bold text-white break-words">
                {request.po_number}
              </h2>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Requested By</p>
                <p className="text-sm text-gray-800 font-semibold">
                  {request.requested_by}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button className="w-full py-2 px-4 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors duration-200">
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PoApprovalCards;
