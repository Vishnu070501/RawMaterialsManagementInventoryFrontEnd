import { useState } from 'react';
import { motion } from 'framer-motion';

export default function EditPurchaseOrderPopup({ order, onClose, onUpdate }) {
  const [formData, setFormData] = useState(order);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="bg-white rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">Edit Purchase Order</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="px-4 py-2 text-sm font-medium text-gray-700">Vendor</td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm font-medium text-gray-700">Item</td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    name="item"
                    value={formData.item}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm font-medium text-gray-700">Date</td>
                <td className="px-4 py-2">
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm font-medium text-gray-700">PO No</td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    name="poNo"
                    value={formData.poNo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm font-medium text-gray-700">Remark</td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    name="remark"
                    value={formData.remark}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm font-medium text-gray-700">Status</td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm font-medium text-gray-700">Tax Amount</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    name="taxamount"
                    value={formData.taxamount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm font-medium text-gray-700">Total Amount</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    name="totalamount"
                    value={formData.totalamount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm font-medium text-gray-700">Shipping Address</td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm font-medium text-gray-700">Purchase Details</td>
                <td className="px-4 py-2">
                  <textarea
                    name="purchaseDetails"
                    value={formData.purchaseDetails}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              Save
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}