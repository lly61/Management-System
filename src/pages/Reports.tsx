import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';

const PRODUCTION_DATA = [
  { name: 'Week 1', output: 4000, target: 4500 },
  { name: 'Week 2', output: 3000, target: 3200 },
  { name: 'Week 3', output: 2000, target: 2500 },
  { name: 'Week 4', output: 2780, target: 2900 },
];

const QUALITY_DATA = [
  { name: 'Passed', value: 850 },
  { name: 'Defective', value: 45 },
  { name: 'Rework', value: 105 },
];

const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

export default function Reports() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Analytics & Reports</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Performance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Production vs Target</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PRODUCTION_DATA}>
                <defs>
                  <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Area type="monotone" dataKey="output" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOutput)" />
                <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Quality Control Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={QUALITY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {QUALITY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {QUALITY_DATA.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
