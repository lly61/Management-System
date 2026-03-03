import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";
import { Calendar, CheckCircle, Clock, Truck, Plus, Eye } from "lucide-react";
import { Button, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Table } from "antd";
import type { ColumnsType } from "antd/es/table";

export default function Orders() {
  const { t } = useTranslation();
  const statusOptions = useMemo(
    () => [
      { value: "pending", label: t("ordersStatus.pending") },
      { value: "processing", label: t("ordersStatus.processing") },
      { value: "shipped", label: t("ordersStatus.shipped") },
      { value: "delivered", label: t("ordersStatus.delivered") },
      { value: "cancelled", label: t("ordersStatus.cancelled") },
    ],
    [t]
  );
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
      message.error(t("orders.loadFailed"));
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
      message.success(t("orders.statusUpdated"));
      loadOrders();
      if (detailOrder?._id === orderId) setDetailOrder((prev: any) => (prev ? { ...prev, status } : null));
    } catch {
      message.error(t("orders.updateFailed"));
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
      message.success(t("orders.orderCreated"));
      setAddOpen(false);
      form.resetFields();
      itemsForm.setFieldsValue({ items: [] });
      loadOrders();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || t("orders.createFailed"));
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await api.orders.delete(id);
      message.success(t("orders.orderDeleted"));
      setDetailOpen(false);
      loadOrders();
    } catch {
      message.error(t("orders.deleteFailed"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{t("orders.title")}</h2>
        <Button type="primary" icon={<Plus size={18} />} onClick={() => { form.resetFields(); itemsForm.setFieldsValue({ items: [] }); setAddOpen(true); }}>
          {t("orders.newOrder")}
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div>{t("orders.loading")}</div>
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
                        {t(`ordersStatus.${order.status}`)}
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
                      options={statusOptions}
                      className="w-28"
                    />
                    <Button type="link" size="small" icon={<Eye size={14} />} onClick={() => openDetail(order)}>
                      {t("orders.viewDetail")}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal
        title={t("orders.orderDetail")}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailOpen(false)}>{t("orders.close")}</Button>,
          detailOrder && (
            <Popconfirm key="del" title={t("orders.deleteOrderConfirm")} onConfirm={() => handleDeleteOrder(detailOrder._id)}>
              <Button danger>{t("orders.deleteOrder")}</Button>
            </Popconfirm>
          ),
        ]}
        width={560}
      >
        {detailOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">{t("orders.orderId")}：</span>{detailOrder.orderId}</div>
              <div><span className="text-gray-500">{t("orders.customer")}：</span>{detailOrder.customerName}</div>
              <div><span className="text-gray-500">{t("orders.date")}：</span>{new Date(detailOrder.orderDate).toLocaleDateString()}</div>
              <div><span className="text-gray-500">{t("orders.status")}：</span>{t(`ordersStatus.${detailOrder.status}`)}</div>
              <div><span className="text-gray-500">{t("orders.amount")}：</span>${Number(detailOrder.totalAmount || 0).toLocaleString()}</div>
            </div>
            <div>
              <p className="text-gray-700 font-medium mb-2">{t("orders.orderItems")}</p>
              {detailOrder.items?.length ? (
                <Table
                  size="small"
                  rowKey={(_, i) => String(i)}
                  columns={[
                    { title: t("orders.partNumber"), dataIndex: "partNumber", key: "partNumber" },
                    { title: t("orders.quantity"), dataIndex: "quantity", key: "quantity", align: "right" },
                    { title: t("orders.unitPrice"), key: "price", align: "right", render: (_: unknown, r: any) => `$${Number(r.price || 0).toFixed(2)}` },
                    { title: t("orders.subtotal"), key: "subtotal", align: "right", render: (_: unknown, r: any) => `$${((r.quantity || 0) * (r.price || 0)).toFixed(2)}` },
                  ] as ColumnsType<any>}
                  dataSource={detailOrder.items}
                  pagination={false}
                  locale={{ emptyText: t("orders.noItems") }}
                />
              ) : (
                <p className="text-gray-500 text-sm">{t("orders.noItems")}</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={t("orders.newOrder")}
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        onOk={handleAddOrder}
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="orderId" label={t("orders.orderId")} rules={[{ required: true }]}>
            <Input placeholder="ORD-2024-004" />
          </Form.Item>
          <Form.Item name="customerName" label={t("orders.customerName")} rules={[{ required: true }]}>
            <Input placeholder="" />
          </Form.Item>
          <Form.Item name="totalAmount" label={t("orders.totalAmount")}>
            <InputNumber min={0} step={0.01} className="w-full" placeholder={t("orders.totalAmountPlaceholder")} />
          </Form.Item>
        </Form>
        <p className="text-gray-600 text-sm mb-2">{t("orders.itemsOptional")}</p>
        <Form form={itemsForm} initialValues={{ items: [] }}>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <div key={key} className="flex gap-2 mb-2">
                    <Form.Item name={[name, "partNumber"]} noStyle><Input placeholder={t("orders.partNumber")} style={{ width: 120 }} /></Form.Item>
                    <Form.Item name={[name, "quantity"]} noStyle><InputNumber min={1} placeholder={t("orders.quantity")} style={{ width: 80 }} /></Form.Item>
                    <Form.Item name={[name, "price"]} noStyle><InputNumber min={0} step={0.01} placeholder={t("orders.unitPrice")} style={{ width: 90 }} /></Form.Item>
                    <Button type="text" danger onClick={() => remove(name)}>{t("inventory.delete")}</Button>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block>+ {t("orders.addRow")}</Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}