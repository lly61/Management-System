import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Calendar, CheckCircle, Clock, Truck, Plus, Eye } from "lucide-react";
import { Button, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Table } from "antd";
import type { ColumnsType } from "antd/es/table";

const STATUS_OPTIONS = [
  { value: "pending", label: "待处理" },
  { value: "processing", label: "处理中" },
  { value: "shipped", label: "已发货" },
  { value: "delivered", label: "已送达" },
  { value: "cancelled", label: "已取消" },
];

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<any>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form] = Form.useForm();
  const [itemsForm] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.orders.getAll();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      message.error("加载订单失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-700";
      case "processing": return "bg-blue-100 text-blue-700";
      case "shipped": return "bg-purple-100 text-purple-700";
      case "delivered": return "bg-emerald-100 text-emerald-700";
      case "cancelled": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return Clock;
      case "processing": return Calendar;
      case "shipped": return Truck;
      case "delivered": return CheckCircle;
      default: return Clock;
    }
  };

  const openDetail = (order: any) => {
    setDetailOrder(order);
    setDetailOpen(true);
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await api.orders.updateStatus(orderId, status);
      message.success("状态已更新");
      loadOrders();
      if (detailOrder?._id === orderId) setDetailOrder((prev: any) => (prev ? { ...prev, status } : null));
    } catch {
      message.error("更新失败");
    }
  };

  const handleAddOrder = async () => {
    try {
      const values = await form.validateFields();
      const items = itemsForm.getFieldValue("items") || [];
      const totalAmount = (items as any[]).reduce((sum, row) => sum + (row.quantity || 0) * (row.price || 0), 0);
      await api.orders.create({
        orderId: values.orderId.trim(),
        customerName: values.customerName.trim(),
        totalAmount: Number(values.totalAmount ?? totalAmount),
        status: "pending",
        items: items.map((r: any) => ({
          partNumber: r.partNumber,
          quantity: Number(r.quantity) || 0,
          price: Number(r.price) || 0,
        })),
      });
      message.success("订单已创建");
      setAddOpen(false);
      form.resetFields();
      itemsForm.setFieldsValue({ items: [] });
      loadOrders();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || "创建失败");
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await api.orders.delete(id);
      message.success("订单已删除");
      setDetailOpen(false);
      loadOrders();
    } catch {
      message.error("删除失败");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">订单管理</h2>
        <Button type="primary" icon={<Plus size={18} />} onClick={() => { form.resetFields(); itemsForm.setFieldsValue({ items: [] }); setAddOpen(true); }}>
          新建订单
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div>正在加载订单...</div>
        ) : (
          orders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            return (
              <div
                key={order._id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{order.orderId}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                        <StatusIcon size={12} />
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">
                      Customer: <span className="text-gray-900 font-medium">{order.customerName}</span>
                    </p>
                    <p className="text-gray-500 text-sm">
                      Date: {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className="text-2xl font-bold text-gray-900">${Number(order.totalAmount || 0).toLocaleString()}</p>
                    <Select
                      value={order.status}
                      onChange={(v) => handleStatusChange(order._id, v)}
                      options={STATUS_OPTIONS}
                      className="w-28"
                    />
                    <Button type="link" size="small" icon={<Eye size={14} />} onClick={() => openDetail(order)}>
                      查看详情
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal
        title="订单详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailOpen(false)}>关闭</Button>,
          detailOrder && (
            <Popconfirm key="del" title="确定删除该订单？" onConfirm={() => handleDeleteOrder(detailOrder._id)}>
              <Button danger>删除订单</Button>
            </Popconfirm>
          ),
        ]}
        width={560}
      >
        {detailOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">订单号：</span>{detailOrder.orderId}</div>
              <div><span className="text-gray-500">客户：</span>{detailOrder.customerName}</div>
              <div><span className="text-gray-500">日期：</span>{new Date(detailOrder.orderDate).toLocaleDateString()}</div>
              <div><span className="text-gray-500">状态：</span>{detailOrder.status}</div>
              <div><span className="text-gray-500">金额：</span>${Number(detailOrder.totalAmount || 0).toLocaleString()}</div>
            </div>
            <div>
              <p className="text-gray-700 font-medium mb-2">订单明细</p>
              {detailOrder.items?.length ? (
                <Table
                  size="small"
                  rowKey={(_, i) => String(i)}
                  columns={[
                    { title: "零件号", dataIndex: "partNumber", key: "partNumber" },
                    { title: "数量", dataIndex: "quantity", key: "quantity", align: "right" },
                    { title: "单价", key: "price", align: "right", render: (_: unknown, r: any) => `$${Number(r.price || 0).toFixed(2)}` },
                    { title: "小计", key: "subtotal", align: "right", render: (_: unknown, r: any) => `$${((r.quantity || 0) * (r.price || 0)).toFixed(2)}` },
                  ] as ColumnsType<any>}
                  dataSource={detailOrder.items}
                  pagination={false}
                  locale={{ emptyText: "暂无明细" }}
                />
              ) : (
                <p className="text-gray-500 text-sm">暂无明细</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="新建订单"
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        onOk={handleAddOrder}
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="orderId" label="订单号" rules={[{ required: true, message: "请输入订单号" }]}>
            <Input placeholder="如 ORD-2024-004" />
          </Form.Item>
          <Form.Item name="customerName" label="客户名称" rules={[{ required: true, message: "请输入客户名称" }]}>
            <Input placeholder="客户名称" />
          </Form.Item>
          <Form.Item name="totalAmount" label="总金额">
            <InputNumber min={0} step={0.01} className="w-full" placeholder="可选，或由明细自动计算" />
          </Form.Item>
        </Form>
        <p className="text-gray-600 text-sm mb-2">订单明细（可选）</p>
        <Form form={itemsForm} initialValues={{ items: [] }}>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <div key={key} className="flex gap-2 mb-2">
                    <Form.Item name={[name, "partNumber"]} noStyle><Input placeholder="零件号" style={{ width: 120 }} /></Form.Item>
                    <Form.Item name={[name, "quantity"]} noStyle><InputNumber min={1} placeholder="数量" style={{ width: 80 }} /></Form.Item>
                    <Form.Item name={[name, "price"]} noStyle><InputNumber min={0} step={0.01} placeholder="单价" style={{ width: 90 }} /></Form.Item>
                    <Button type="text" danger onClick={() => remove(name)}>删除</Button>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block>+ 添加明细行</Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}