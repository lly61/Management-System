import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Search, Plus, Filter } from "lucide-react";

export default function Inventory() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await api.inventory.getAll();
      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Inventory Management
          </h2>
          <p className="text-gray-500">
            Track parts, stock levels, and suppliers
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={20} />
          Add Part
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search parts by name or number..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2">
            <Filter size={18} />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-medium">Part Number</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Stock</th>
                <th className="px-6 py-3 font-medium">Location</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    Loading inventory...
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">
                      {item.partNumber}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            item.quantity <= item.minStockLevel
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {item.quantity}
                        </span>
                        {item.quantity <= item.minStockLevel && (
                          <span
                            className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
                            title="Low Stock"
                          ></span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.location}</td>
                    <td className="px-6 py-4 text-gray-900">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.quantity > item.minStockLevel
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.quantity > item.minStockLevel
                          ? "In Stock"
                          : "Low Stock"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
