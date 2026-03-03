import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";
import { User, Mail, Shield, Trash2, Pencil } from "lucide-react";
import { Button, Modal, Form, Input, Select, message, Popconfirm, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "worker", label: "Worker" },
  { value: "inspector", label: "Inspector" },
];
const DEPARTMENTS = ["Management", "Production", "Assembly", "Quality", "Warehouse", "Sales"];

function roleLabel(role: string) {
  return ROLES.find((r) => r.value === role)?.label ?? role;
}

export default function UsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.users.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      message.error(t("users.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openAdd = () => {
    setEditingUser(null);
    form.setFieldsValue({
      name: "",
      email: "",
      password: "",
      role: "worker",
      department: "",
    });
    setModalOpen(true);
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role || "worker",
      department: user.department ?? "",
      status: user.status || "active",
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitLoading(true);
      if (editingUser) {
        const payload: any = {
          name: values.name.trim(),
          role: values.role,
          department: values.department || undefined,
          status: values.status,
        };
        if (values.password) payload.password = values.password;
        await api.users.update(editingUser._id, payload);
        message.success(t("users.userUpdated"));
      } else {
        await api.auth.register({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
          role: values.role,
          department: values.department || undefined,
        });
        message.success(t("users.memberAdded"));
      }
      setModalOpen(false);
      loadUsers();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || "操作失败");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.users.delete(id);
      message.success(t("users.deleted"));
      loadUsers();
    } catch {
      message.error(t("users.deleteFailed"));
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: t("users.name"),
      key: "name",
      render: (_: unknown, user: any) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
            {(user.name || "?").charAt(0)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Mail size={12} /> {user.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("users.role"),
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <span className="flex items-center gap-1 text-gray-700">
          <Shield size={14} className="text-blue-500" />
          {roleLabel(role)}
        </span>
      ),
    },
    { title: t("users.department"), dataIndex: "department", key: "department", render: (v: string) => v ?? "-" },
    {
      title: t("users.status"),
      dataIndex: "status",
      key: "status",
      render: (s: string) => {
        const status = s || "active";
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
            {status === "active" ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      title: t("users.action"),
      key: "action",
      render: (_: unknown, user: any) => (
        <Space>
          <Button type="link" size="small" icon={<Pencil size={14} />} onClick={() => openEdit(user)}>{t("users.edit")}</Button>
          <Popconfirm title={t("users.deleteConfirm")} onConfirm={() => handleDelete(user._id)}>
            <Button type="link" size="small" danger icon={<Trash2 size={14} />}>{t("users.delete")}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{t("users.title")}</h2>
        <Button type="primary" icon={<User size={18} />} onClick={openAdd} className="flex items-center gap-2">
          {t("users.addMember")}
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => t("users.total", { count: total }) }}
          locale={{ emptyText: t("users.empty") }}
        />
      </div>

      <Modal
        title={editingUser ? t("users.editUserTitle") : t("users.addMemberTitle")}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitLoading}
        okText={editingUser ? t("users.save") : t("users.add")}
        destroyOnClose
        width={440}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label={t("users.name")} rules={[{ required: true }]}>
            <Input placeholder="" />
          </Form.Item>
          <Form.Item
            name="email"
            label={t("login.email")}
            rules={[{ required: true }, { type: "email" }]}
          >
            <Input placeholder="email@example.com" disabled={!!editingUser} />
          </Form.Item>
          <Form.Item
            name="password"
            label={t("users.password")}
            rules={editingUser ? [] : [{ required: true }, { min: 6 }]}
          >
            <Input.Password placeholder={editingUser ? t("users.passwordPlaceholder") : ""} />
          </Form.Item>
          <Form.Item name="role" label={t("users.role")} rules={[{ required: true }]}>
            <Select options={ROLES} />
          </Form.Item>
          <Form.Item name="department" label={t("users.department")}>
            <Select placeholder="" allowClear options={DEPARTMENTS.map((d) => ({ value: d, label: d }))} />
          </Form.Item>
          {editingUser && (
            <Form.Item name="status" label={t("users.status")}>
              <Select options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
