import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { CheckCircle, XCircle } from 'lucide-react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

export default function Quality() {
  const { t } = useTranslation();
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
    { title: t('quality.checkId'), dataIndex: 'checkId', key: 'checkId', render: (v: string) => <span className="font-mono text-sm text-gray-600">{v}</span> },
    { title: t('quality.batch'), dataIndex: 'batchNumber', key: 'batchNumber' },
    { title: t('quality.inspector'), dataIndex: 'inspector', key: 'inspector' },
    { title: t('quality.date'), dataIndex: 'checkDate', key: 'checkDate', render: (v: string) => new Date(v).toLocaleDateString() },
    {
      title: t('quality.result'),
      dataIndex: 'passed',
      key: 'passed',
      render: (passed: boolean) => (
        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {passed ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {passed ? t('quality.passed') : t('quality.failed')}
        </span>
      ),
    },
    { title: t('quality.defects'), dataIndex: 'defectsFound', key: 'defectsFound' },
    { title: t('quality.notes'), dataIndex: 'notes', key: 'notes', render: (v: string) => <span className="text-gray-500 text-sm italic">{v}</span> },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">{t('quality.title')}</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={checks}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => t('quality.total', { count: total }) }}
          locale={{ emptyText: t('quality.empty') }}
        />
      </div>
    </div>
  );
}
