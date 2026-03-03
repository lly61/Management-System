import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";
import { Calendar, Clock, Plus, Pencil, Trash2, TrendingUp } from "lucide-react";
import { Button, Modal, Form, Input, InputNumber, Select, DatePicker, message, Popconfirm, Space } from "antd";
import dayjs from "dayjs";

export default function Production() {
  const { t } = useTranslation();
  const statusOptions = useMemo(
    () => [
      { value: "planned", label: t("production.statusPlanned") },
      { value: "in_progress", label: t("production.statusInProgress") },
      { value: "completed", label: t("production.statusCompleted") },
      { value: "delayed", label: t("production.statusDelayed") },
    ],
    [t]
  );
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [form] = Form.useForm();
  const [progressForm] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await api.production.getAll();
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      message.error(t("production.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned": return "bg-blue-100 text-blue-700";
      case "in_progress": return "bg-amber-100 text-amber-700";
      case "completed": return "bg-emerald-100 text-emerald-700";
      case "delayed": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const openAdd = () => {
    setEditingPlan(null);
    form.setFieldsValue({
      planId: "",
      partNumber: "",
      targetQuantity: 100,
      completedQuantity: 0,
      startDate: dayjs(),
      endDate: dayjs().add(2, "week"),
      status: "planned",
      assignedLine: "",
    });
    setModalOpen(true);
  };

  const openEdit = (plan: any) => {
    setEditingPlan(plan);
    form.setFieldsValue({
      planId: plan.planId,
      partNumber: plan.partNumber,
      targetQuantity: plan.targetQuantity ?? 100,
      completedQuantity: plan.completedQuantity ?? 0,
      startDate: plan.startDate ? dayjs(plan.startDate) : dayjs(),
      endDate: plan.endDate ? dayjs(plan.endDate) : dayjs().add(2, "week"),
      status: plan.status || "planned",
      assignedLine: plan.assignedLine ?? "",
    });
    setModalOpen(true);
  };

  const openProgress = (plan: any) => {
    setEditingPlan(plan);
    progressForm.setFieldsValue({
      completedQuantity: plan.completedQuantity ?? 0,
      status: plan.status || "in_progress",
    });
    setProgressOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        planId: values.planId.trim(),
        partNumber: values.partNumber.trim(),
        targetQuantity: Number(values.targetQuantity) || 0,
        completedQuantity: Number(values.completedQuantity) ?? 0,
        startDate: values.startDate?.toDate?.() ?? values.startDate,
        endDate: values.endDate?.toDate?.() ?? values.endDate,
        status: values.status,
        assignedLine: values.assignedLine?.trim() || undefined,
      };
      setSubmitLoading(true);
      if (editingPlan) {
        await api.production.update(editingPlan._id, payload);
        message.success(t("production.planUpdated"));
      } else {
        await api.production.create(payload);
        message.success(t("production.planCreated"));
      }
      setModalOpen(false);
      loadPlans();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || "操作失败");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleProgressSubmit = async () => {
    try {
      const values = await progressForm.validateFields();
      if (!editingPlan) return;
      await api.production.update(editingPlan._id, {
        completedQuantity: Number(values.completedQuantity) ?? 0,
        status: values.status,
      });
      message.success(t("production.progressUpdated"));
      setProgressOpen(false);
      loadPlans();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || "");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.production.delete(id);
      message.success(t("production.planDeleted"));
      loadPlans();
    } catch {
      message.error(t("production.deleteFailed"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{t("production.title")}</h2>
        <Button type="primary" icon={<Plus size={18} />} onClick={openAdd}>
          {t("production.newPlan")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div>{t("production.loading")}</div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan._id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-gray-900">{plan.planId}</h3>
                <Space>
                  <Button type="link" size="small" icon={<TrendingUp size={14} />} onClick={() => openProgress(plan)}>
                    {t("production.progress")}
                  </Button>
                  <Button type="link" size="small" icon={<Pencil size={14} />} onClick={() => openEdit(plan)}>
                    {t("production.edit")}
                  </Button>
                  <Popconfirm title={t("production.deleteConfirm")} onConfirm={() => handleDelete(plan._id)}>
                    <Button type="link" size="small" danger icon={<Trash2 size={14} />}>
                      {t("production.delete")}
                    </Button>
                  </Popconfirm>
                </Space>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(plan.status)}`}>
                {t(plan.status === "in_progress" ? "production.statusInProgress" : plan.status === "planned" ? "production.statusPlanned" : plan.status === "completed" ? "production.statusCompleted" : "production.statusDelayed")}
              </span>

              <div className="space-y-3 mt-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Part Number</p>
                  <p className="font-medium text-gray-800">{plan.partNumber}</p>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Target</p>
                    <p className="font-medium text-gray-800">{plan.targetQuantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase">Completed</p>
                    <p className="font-medium text-gray-800">{plan.completedQuantity ?? 0}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        ((plan.completedQuantity ?? 0) / (plan.targetQuantity || 1)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Calendar size={14} /> {new Date(plan.startDate).toLocaleDateString()}
                  </span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <Clock size={14} /> {new Date(plan.endDate).toLocaleDateString()}
                  </span>
                </div>
                {plan.assignedLine && (
                  <p className="text-xs text-gray-500">产线: {plan.assignedLine}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        title={editingPlan ? t("production.editPlan") : t("production.newPlanTitle")}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitLoading}
        okText={editingPlan ? t("production.save") : t("production.create")}
        destroyOnClose
        width={480}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="planId" label={t("production.planId")} rules={[{ required: true }]}>
            <Input placeholder="PLN-104" disabled={!!editingPlan} />
          </Form.Item>
          <Form.Item name="partNumber" label={t("production.partNumber")} rules={[{ required: true }]}>
            <Input placeholder="ENG-001" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="targetQuantity" label={t("production.targetQuantity")} rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            <Form.Item name="completedQuantity" label={t("production.completedQuantity")}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          </div>
          <Form.Item name="startDate" label={t("production.startDate")} rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="endDate" label={t("production.endDate")} rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="status" label={t("production.status")}>
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item name="assignedLine" label={t("production.assignedLine")}>
            <Input placeholder="Line A" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t("production.updateProgress")}
        open={progressOpen}
        onCancel={() => setProgressOpen(false)}
        onOk={handleProgressSubmit}
        okText={t("production.save")}
        width={360}
      >
        {editingPlan && (
          <p className="text-gray-600 mb-4">{editingPlan.planId} - {editingPlan.partNumber}</p>
        )}
        <Form form={progressForm} layout="vertical">
          <Form.Item name="completedQuantity" label={t("production.completedQuantity")} rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="status" label={t("production.status")}>
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}