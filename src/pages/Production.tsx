import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function Production() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await api.production.getAll();
        setPlans(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-amber-100 text-amber-700';
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'delayed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Production Planning</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div>Loading production plans...</div>
        ) : plans.map((plan) => (
          <div key={plan._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-gray-900">{plan.planId}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(plan.status)}`}>
                {plan.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase">Part Number</p>
                <p className="font-medium text-gray-800">{plan.partNumber}</p>
              </div>
              
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Target</p>
                  <p className="font-medium text-gray-800">{plan.targetQuantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase">Completed</p>
                  <p className="font-medium text-gray-800">{plan.completedQuantity}</p>
                </div>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((plan.completedQuantity / plan.targetQuantity) * 100, 100)}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                <span className="text-gray-500 flex items-center gap-1">
                  <Calendar size={14} /> {new Date(plan.startDate).toLocaleDateString()}
                </span>
                <span className="text-gray-500 flex items-center gap-1">
                  <Clock size={14} /> {new Date(plan.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
