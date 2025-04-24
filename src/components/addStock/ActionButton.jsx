const ActionButton = ({ label, color, onClick }) => (
    <button
      onClick={onClick}
      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200"
      style={{ backgroundColor: color === 'green' ? '#10B981' : '#3B82F6' }}
    >
      {label}
    </button>
  );
  
  export default ActionButton;
  