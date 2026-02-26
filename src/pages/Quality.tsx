import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CheckCircle, XCircle, Clipboard } from 'lucide-react';

export default function Quality() {
  const [checks, setChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChecks = async () => {
      try {
        const data = await api.quality.getAll();
        setChecks(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchChecks();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Quality Control</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 font-medium">Check ID</th>
              <th className="px-6 py-3 font-medium">Batch</th>
              <th className="px-6 py-3 font-medium">Inspector</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Result</th>
              <th className="px-6 py-3 font-medium">Defects</th>
              <th className="px-6 py-3 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8">Loading quality checks...</td></tr>
            ) : checks.map((check) => (
              <tr key={check._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm text-gray-600">{check.checkId}</td>
                <td className="px-6 py-4 text-gray-900">{check.batchNumber}</td>
                <td className="px-6 py-4 text-gray-600">{check.inspector}</td>
                <td className="px-6 py-4 text-gray-600">{new Date(check.checkDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    check.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {check.passed ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {check.passed ? 'Passed' : 'Failed'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900">{check.defectsFound}</td>
                <td className="px-6 py-4 text-gray-500 text-sm italic">{check.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
