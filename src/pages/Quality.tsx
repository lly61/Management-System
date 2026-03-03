import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CheckCircle, XCircle } from 'lucide-react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

export default function Quality() {
  const [checks, setChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChecks = async () => {
      try {
        const data = await api.quality.getAll();
        setChecks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchChecks();
  }, []);

  const columns: ColumnsType<any> = [
    { title: '检验单号', dataIndex: 'checkId', key: 'checkId', render: (v: string) => <span className="font-mono text-sm text-gray-600">{v}</span> },
    { title: '批次', dataIndex: 'batchNumber', key: 'batchNumber' },
    { title: '检验员', dataIndex: 'inspector', key: 'inspector' },
    { title: '日期', dataIndex: 'checkDate', key: 'checkDate', render: (v: string) => new Date(v).toLocaleDateString() },
    {
      title: '结果',
      dataIndex: 'passed',
      key: 'passed',
      render: (passed: boolean) => (
        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {passed ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {passed ? '通过' : '未通过'}
        </span>
      ),
    },
    { title: '缺陷数', dataIndex: 'defectsFound', key: 'defectsFound' },
    { title: '备注', dataIndex: 'notes', key: 'notes', render: (v: string) => <span className="text-gray-500 text-sm italic">{v}</span> },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">质量控制</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={checks}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          locale={{ emptyText: '暂无数据' }}
        />
      </div>
    </div>
  );
}
