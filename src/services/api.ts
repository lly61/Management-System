import { useGlobalStore } from "../store/globalStore";

const API_BASE = "/api";

async function fetchData(endpoint: string, options: RequestInit = {}) {
  try {
    const token = useGlobalStore.getState().token;
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) throw new Error("API Error");
    return await response.json();
  } catch (error) {
    return null;
  }
}

/** 请求 CSV 并触发浏览器下载 */
async function downloadCsv(
  endpoint: string,
  filename: string
): Promise<boolean> {
  try {
    const token = useGlobalStore.getState().token;
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error("Export failed");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    return false;
  }
}

export const api = {
  inventory: {
    getAll: () => fetchData("/inventory", {}),
    exportCsv: () => downloadCsv("/inventory/export", "inventory.csv"),
    create: (data: any) =>
      fetchData("/inventory", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchData(`/inventory/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) => fetchData(`/inventory/${id}`, { method: "DELETE" }),
  },
  orders: {
    getAll: () => fetchData("/orders", {}),
    exportCsv: () => downloadCsv("/orders/export", "orders.csv"),
    getById: (id: string) => fetchData(`/orders/${id}`, {}),
    create: (data: any) =>
      fetchData("/orders", { method: "POST", body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) =>
      fetchData(`/orders/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    delete: (id: string) => fetchData(`/orders/${id}`, { method: "DELETE" }),
  },
  production: {
    getAll: () => fetchData("/production", {}),
    create: (data: any) =>
      fetchData("/production", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchData(`/production/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchData(`/production/${id}`, { method: "DELETE" }),
  },
  quality: {
    getAll: () => fetchData("/quality", {}),
    exportCsv: () => downloadCsv("/quality/export", "quality-checks.csv"),
  },
  reports: {
    getDashboard: () => fetchData("/reports/dashboard", {}),
  },
  users: {
    getAll: () => fetchData("/auth/users", {}),
    exportCsv: () => downloadCsv("/auth/users/export", "users.csv"),
    update: (id: string, data: any) =>
      fetchData(`/auth/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchData(`/auth/users/${id}`, { method: "DELETE" }),
  },
  auth: {
    login: async (credentials: any) => {
      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });
        if (!response.ok) throw new Error("Login failed");
        return await response.json();
      } catch (e) {
        return null;
      }
    },
    register: async (data: any) => {
      try {
        const response = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Registration failed");
        return await response.json();
      } catch (e) {
        return null;
      }
    },
  },
};
