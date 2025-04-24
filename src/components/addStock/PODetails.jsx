const PODetails = ({ poNumber, status }) => (
    <div className="mb-4">
      <h3 className="text-lg font-semibold">PO Details</h3>
      <p className="text-gray-600">PO Number: {poNumber}</p>
      <p className="text-gray-600">Status: {status}</p>
    </div>
  );
  
  export default PODetails;
  