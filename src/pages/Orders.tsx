import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Calendar, CheckCircle, Clock, Truck } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.orders.getAll();
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'processing': return Calendar;
      case 'shipped': return Truck;
      case 'delivered': return CheckCircle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>

      <div className="grid gap-4">
        {loading ? (
          <div>Loading orders...</div>
        ) : orders.map((order) => {
          const StatusIcon = getStatusIcon(order.status);
          return (
            <div key={order._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{order.orderId}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                      <StatusIcon size={12} />
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">Customer: <span className="text-gray-900 font-medium">{order.customerName}</span></p>
                  <p className="text-gray-500 text-sm">Date: {new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">${order.totalAmount.toLocaleString()}</p>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2">View Details</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
