import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.reports.getDashboard();
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading dashboard data...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Orders" 
          value={data?.stats?.totalOrders} 
          icon={TrendingUp} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Pending Orders" 
          value={data?.stats?.pendingOrders} 
          icon={Clock} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Active Production" 
          value={data?.stats?.activeProduction} 
          icon={CheckCircle} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Quality Issues" 
          value={data?.stats?.qualityIssues} 
          icon={AlertCircle} 
          color="bg-red-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Revenue Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Production Output</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
      <div className={`${color} p-4 rounded-lg text-white shadow-lg shadow-opacity-20`}>
        <Icon size={24} />
      </div>
      <div className="ml-4">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h4 className="text-2xl font-bold text-gray-800">{value}</h4>
      </div>
    </div>
  );
}
