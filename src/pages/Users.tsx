import React, { useEffect, useState } from "react";
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
      message.error("加载用户列表失败");
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
        message.success("用户已更新");
      } else {
        await api.auth.register({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
          role: values.role,
          department: values.department || undefined,
        });
        message.success("成员已添加");
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
      message.success("已删除");
      loadUsers();
    } catch {
      message.error("删除失败");
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: "名称",
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
      title: "角色",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <span className="flex items-center gap-1 text-gray-700">
          <Shield size={14} className="text-blue-500" />
          {roleLabel(role)}
        </span>
      ),
    },
    { title: "部门", dataIndex: "department", key: "department", render: (v: string) => v ?? "-" },
    {
      title: "状态",
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
      title: "操作",
      key: "action",
      render: (_: unknown, user: any) => (
        <Space>
          <Button type="link" size="small" icon={<Pencil size={14} />} onClick={() => openEdit(user)}>编辑</Button>
          <Popconfirm title="确定删除该用户？" onConfirm={() => handleDelete(user._id)}>
            <Button type="link" size="small" danger icon={<Trash2 size={14} />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">用户管理</h2>
        <Button type="primary" icon={<User size={18} />} onClick={openAdd} className="flex items-center gap-2">
          添加成员
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          locale={{ emptyText: "暂无用户" }}
        />
      </div>

      <Modal
        title={editingUser ? "编辑用户" : "添加成员"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitLoading}
        okText={editingUser ? "保存" : "添加"}
        destroyOnClose
        width={440}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: "请输入姓名" }]}>
            <Input placeholder="姓名" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入有效邮箱" },
            ]}
          >
            <Input placeholder="email@example.com" disabled={!!editingUser} />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={editingUser ? [] : [{ required: true, message: "请输入密码" }, { min: 6, message: "至少 6 位" }]}
          >
            <Input.Password placeholder={editingUser ? "不修改请留空" : "密码"} />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select options={ROLES} />
          </Form.Item>
          <Form.Item name="department" label="部门">
            <Select placeholder="选择部门" allowClear options={DEPARTMENTS.map((d) => ({ value: d, label: d }))} />
          </Form.Item>
          {editingUser && (
            <Form.Item name="status" label="状态">
              <Select options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
