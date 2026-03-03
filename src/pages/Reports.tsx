import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Line,
  AreaChart,
  Area,
} from "recharts";

const COLORS = ["#10b981", "#ef4444", "#f59e0b"];

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [productionData, setProductionData] = useState<any[]>([]);
  const [qualityData, setQualityData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [dash, plans, quality] = await Promise.all([
          api.reports.getDashboard(),
          api.production.getAll(),
          api.quality.getAll(),
        ]);
        setDashboard(dash);

        // 生产 vs 目标：按计划汇总或按周
        const plansList = Array.isArray(plans) ? plans : [];
        if (plansList.length > 0) {
          const byPlan = plansList.slice(0, 6).map((p: any) => ({
            name: p.planId || p.partNumber,
            output: p.completedQuantity ?? 0,
            target: p.targetQuantity ?? 0,
          }));
          setProductionData(byPlan);
        } else {
          setProductionData([
            { name: "Week 1", output: 4000, target: 4500 },
            { name: "Week 2", output: 3000, target: 3200 },
            { name: "Week 3", output: 2000, target: 2500 },
            { name: "Week 4", output: 2780, target: 2900 },
          ]);
        }

        // 质量分布：从质检记录汇总
        const qualityList = Array.isArray(quality) ? quality : [];
        let qualityChart: { name: string; value: number }[] = [];
        if (qualityList.length > 0) {
          const passed = qualityList.filter((q: any) => q.passed).length;
          const defective = qualityList.filter((q: any) => !q.passed).length;
          const rework = qualityList.reduce((s: number, q: any) => s + (q.defectsFound || 0), 0);
          qualityChart = [
            { name: "Passed", value: passed },
            { name: "Defective", value: defective },
            { name: "Rework/Defects", value: rework },
          ].filter((d) => d.value > 0);
        }
        if (qualityChart.length === 0) {
          qualityChart = [
            { name: "Passed", value: dash?.stats ? Math.max(0, 100 - (dash.stats.qualityIssues || 0)) : 850 },
            { name: "Defective", value: dash?.stats?.qualityIssues ?? 45 },
            { name: "Rework", value: 105 },
          ];
        }
        setQualityData(qualityChart);
      } catch (e) {
        console.error(e);
        setProductionData([
          { name: "Week 1", output: 4000, target: 4500 },
          { name: "Week 2", output: 3000, target: 3200 },
          { name: "Week 3", output: 2000, target: 2500 },
          { name: "Week 4", output: 2780, target: 2900 },
        ]);
        setQualityData([
          { name: "Passed", value: 850 },
          { name: "Defective", value: 45 },
          { name: "Rework", value: 105 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const revenueData = dashboard?.revenueData || [
    { name: "Jan", value: 45000 },
    { name: "Feb", value: 52000 },
    { name: "Mar", value: 48000 },
    { name: "Apr", value: 61000 },
    { name: "May", value: 55000 },
    { name: "Jun", value: 67000 },
  ];

  const stats = dashboard?.stats;

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">报表与分析</h2>
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">报表与分析</h2>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">总订单数</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders ?? 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">待处理订单</p>
            <p className="text-2xl font-bold text-amber-600">{stats.pendingOrders ?? 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">进行中生产</p>
            <p className="text-2xl font-bold text-blue-600">{stats.activeProduction ?? 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">质量异常</p>
            <p className="text-2xl font-bold text-red-600">{stats.qualityIssues ?? 0}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Production vs Target</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productionData}>
                <defs>
                  <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Quality Control Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={qualityData.map((entry, index) => ({ ...entry, fill: COLORS[index % COLORS.length] }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {qualityData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Revenue Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}