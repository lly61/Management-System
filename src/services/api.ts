import { useGlobalStore } from "../store/globalStore";

const API_BASE = "/api";

async function fetchData(endpoint: string, options: RequestInit = {}) {
  try {
    const token = useGlobalStore((state) => state.token);
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) throw new Error("API Error");
    return await response.json();
  } catch (error) {
    return null;
  }
}

export const api = {
  inventory: {
    getAll: () => fetchData("/inventory", {}),
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
  },
  reports: {
    getDashboard: () => fetchData("/reports/dashboard", {}),
  },
  users: {
    getAll: () => fetchData("/auth/users", {}),
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
