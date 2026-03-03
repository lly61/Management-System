import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";
import { Search, Plus, Filter, Pencil, Trash2, Download } from "lucide-react";
import { Modal, Form, Input, InputNumber, Select, Button, message, Popconfirm, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";

const CATEGORIES = ["Engine", "Chassis", "Electronics", "Suspension", "Transmission", "其他"];

const defaultForm = {
  partNumber: "",
  name: "",
  category: "Engine",
  quantity: 0,
  minStockLevel: 10,
  location: "",
  supplier: "",
  unitPrice: undefined as number | undefined,
};

export default function Inventory() {
  const { t } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStock, setFilterStock] = useState<"all" | "low" | "ok">("all");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await api.inventory.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      message.error(t("inventory.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !searchTerm ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.partNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = !filterCategory || item.category === filterCategory;
      const isLow = item.quantity != null && item.minStockLevel != null && item.quantity <= item.minStockLevel;
      const matchStock =
        filterStock === "all" || (filterStock === "low" && isLow) || (filterStock === "ok" && !isLow);
      return matchSearch && matchCategory && matchStock;
    });
  }, [items, searchTerm, filterCategory, filterStock]);

  const openAdd = () => {
    setEditingItem(null);
    form.setFieldsValue(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    form.setFieldsValue({
      partNumber: item.partNumber,
      name: item.name,
      category: item.category,
      quantity: item.quantity ?? 0,
      minStockLevel: item.minStockLevel ?? 10,
      location: item.location ?? "",
      supplier: item.supplier ?? "",
      unitPrice: item.unitPrice,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        partNumber: values.partNumber.trim(),
        name: values.name.trim(),
        category: values.category,
        quantity: Number(values.quantity) || 0,
        minStockLevel: Number(values.minStockLevel) ?? 10,
        location: values.location?.trim() || undefined,
        supplier: values.supplier?.trim() || undefined,
        unitPrice: values.unitPrice != null ? Number(values.unitPrice) : undefined,
      };
      setSubmitLoading(true);
      if (editingItem) {
        await api.inventory.update(editingItem._id, payload);
        message.success(t("inventory.updateSuccess"));
      } else {
        await api.inventory.create(payload);
        message.success(t("inventory.createSuccess"));
      }
      setModalOpen(false);
      loadInventory();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || "操作失败");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.inventory.delete(id);
      message.success("已删除");
      loadInventory();
    } catch (e) {
      message.error(t("inventory.deleteFailed"));
    }
  };

  const clearFilters = () => {
    setFilterStock("all");
    setFilterCategory("");
    setFilterVisible(false);
  };

  const handleExport = async () => {
    const ok = await api.inventory.exportCsv();
    if (ok) message.success(t("inventory.exportSuccess"));
    else message.error(t("inventory.loadFailed"));
  };

  const hasActiveFilters = filterStock !== "all" || !!filterCategory;

  const columns: ColumnsType<any> = [
    { title: t("inventory.partNumber"), dataIndex: "partNumber", key: "partNumber", render: (v: string) => <span className="font-mono text-sm text-gray-600">{v}</span> },
    { title: t("inventory.name"), dataIndex: "name", key: "name", render: (v: string) => <span className="font-medium text-gray-900">{v}</span> },
    {
      title: t("inventory.category"),
      dataIndex: "category",
      key: "category",
      render: (v: string) => <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">{v}</span>,
    },
    {
      title: t("inventory.quantity"),
      key: "quantity",
      render: (_: unknown, r: any) => (
        <div className="flex items-center gap-2">
          <span className={r.quantity <= r.minStockLevel ? "font-medium text-red-600" : "font-medium text-gray-900"}>{r.quantity}</span>
          {r.quantity <= r.minStockLevel && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="低库存" />}
        </div>
      ),
    },
    { title: t("inventory.location"), dataIndex: "location", key: "location", render: (v: string) => v ?? "-" },
    {
      title: t("inventory.price"),
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (v: number) => (v != null ? `$${Number(v).toFixed(2)}` : "-"),
    },
    {
      title: t("inventory.status"),
      key: "status",
      render: (_: unknown, r: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.quantity > r.minStockLevel ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
          {r.quantity > r.minStockLevel ? t("inventory.normal") : t("inventory.lowStock")}
        </span>
      ),
    },
    {
      title: t("inventory.action"),
      key: "action",
      render: (_: unknown, r: any) => (
        <Space>
          <Button type="link" size="small" icon={<Pencil size={14} />} onClick={() => openEdit(r)}>{t("inventory.edit")}</Button>
          <Popconfirm title={t("inventory.deleteConfirm")} onConfirm={() => handleDelete(r._id)}>
            <Button type="link" size="small" danger icon={<Trash2 size={14} />}>{t("inventory.delete")}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t("inventory.title")}</h2>
          <p className="text-gray-500">{t("inventory.subtitle")}</p>
        </div>
        <Space>
          <Button icon={<Download size={18} />} onClick={handleExport}>
            {t("inventory.export")}
          </Button>
          <Button type="primary" icon={<Plus size={18} />} onClick={openAdd} className="flex items-center gap-2">
            {t("inventory.addPart")}
          </Button>
        </Space>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder={t("inventory.searchPlaceholder")}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Space wrap>
            <Button
              icon={<Filter size={16} />}
              onClick={() => setFilterVisible(!filterVisible)}
              type={hasActiveFilters ? "primary" : "default"}
            >
              {t("inventory.filter")}
              {hasActiveFilters && ` (${t("inventory.filtered")})`}
            </Button>
            {hasActiveFilters && (
              <Button onClick={clearFilters}>{t("inventory.clearFilter")}</Button>
            )}
          </Space>
        </div>

        {filterVisible && (
          <div className="px-4 pb-4 flex gap-4 flex-wrap items-center border-b border-gray-100">
            <span className="text-gray-600 text-sm">{t("inventory.stockStatus")}：</span>
            <Select
              value={filterStock}
              onChange={setFilterStock}
              style={{ width: 120 }}
              options={[
                { value: "all", label: t("inventory.all") },
                { value: "low", label: t("inventory.lowStock") },
                { value: "ok", label: t("inventory.normal") },
              ]}
            />
            <span className="text-gray-600 text-sm ml-2">{t("inventory.category")}：</span>
            <Select
              value={filterCategory || undefined}
              onChange={(v) => setFilterCategory(v || "")}
              style={{ width: 140 }}
              placeholder={t("inventory.all")}
              allowClear
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </div>
        )}

        <Table
          rowKey="_id"
          columns={columns}
          dataSource={filteredItems}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => t("inventory.total", { count: total }) }}
          locale={{ emptyText: t("inventory.empty") }}
        />
      </div>

      <Modal
        title={editingItem ? t("inventory.editPartTitle") : t("inventory.addPartTitle")}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitLoading}
        width={520}
        destroyOnClose
        okText={editingItem ? t("inventory.save") : t("inventory.add")}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="partNumber"
            label={t("inventory.partNumber")}
            rules={[{ required: true, message: " " }]}
          >
            <Input placeholder="ENG-001" disabled={!!editingItem} />
          </Form.Item>
          <Form.Item
            name="name"
            label={t("inventory.name")}
            rules={[{ required: true, message: " " }]}
          >
            <Input placeholder="" />
          </Form.Item>
          <Form.Item
            name="category"
            label={t("inventory.category")}
            rules={[{ required: true }]}
          >
            <Select placeholder="" options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="quantity" label={t("inventory.quantity")} initialValue={0}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="minStockLevel" label={t("inventory.minStock")} initialValue={10}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          </div>
          <Form.Item name="location" label={t("inventory.location")}>
            <Input placeholder="A-01" />
          </Form.Item>
          <Form.Item name="supplier" label={t("inventory.supplier")}>
            <Input placeholder="" />
          </Form.Item>
          <Form.Item name="unitPrice" label={t("inventory.unitPrice")}>
            <InputNumber min={0} step={0.01} className="w-full" placeholder="0.00" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
