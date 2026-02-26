// This service handles API calls and provides mock fallbacks if the backend is unavailable

const API_BASE = '/api';

// Mock Data Generators
const mockInventory = [
  { _id: '1', partNumber: 'ENG-001', name: 'V6 Engine Block', category: 'Engine', quantity: 45, minStockLevel: 10, location: 'A-01', supplier: 'MetalWorks Inc', unitPrice: 1200, lastUpdated: new Date().toISOString() },
  { _id: '2', partNumber: 'BRK-202', name: 'Ceramic Brake Pad', category: 'Chassis', quantity: 150, minStockLevel: 50, location: 'B-12', supplier: 'SafeStop', unitPrice: 85, lastUpdated: new Date().toISOString() },
  { _id: '3', partNumber: 'ELC-550', name: 'ECU Control Unit', category: 'Electronics', quantity: 8, minStockLevel: 15, location: 'S-05', supplier: 'TechChips', unitPrice: 450, lastUpdated: new Date().toISOString() },
  { _id: '4', partNumber: 'SUS-101', name: 'Front Strut Assembly', category: 'Suspension', quantity: 32, minStockLevel: 20, location: 'C-03', supplier: 'Dampeners Co', unitPrice: 180, lastUpdated: new Date().toISOString() },
  { _id: '5', partNumber: 'TRN-900', name: '6-Speed Transmission', category: 'Transmission', quantity: 12, minStockLevel: 5, location: 'A-04', supplier: 'GearBox Ltd', unitPrice: 2500, lastUpdated: new Date().toISOString() },
];

const mockOrders = [
  { _id: '1', orderId: 'ORD-2024-001', customerName: 'AutoFix Garage', totalAmount: 5400, status: 'processing', orderDate: '2024-02-20', items: [] },
  { _id: '2', orderId: 'ORD-2024-002', customerName: 'Speedy Repairs', totalAmount: 1250, status: 'shipped', orderDate: '2024-02-18', items: [] },
  { _id: '3', orderId: 'ORD-2024-003', customerName: 'City Motors', totalAmount: 8900, status: 'pending', orderDate: '2024-02-24', items: [] },
];

const mockProduction = [
  { _id: '1', planId: 'PLN-101', partNumber: 'ENG-001', targetQuantity: 50, completedQuantity: 30, startDate: '2024-02-01', endDate: '2024-02-28', status: 'in_progress', assignedLine: 'Line A' },
  { _id: '2', planId: 'PLN-102', partNumber: 'BRK-202', targetQuantity: 200, completedQuantity: 200, startDate: '2024-01-15', endDate: '2024-01-30', status: 'completed', assignedLine: 'Line B' },
  { _id: '3', planId: 'PLN-103', partNumber: 'ELC-550', targetQuantity: 100, completedQuantity: 0, startDate: '2024-03-01', endDate: '2024-03-15', status: 'planned', assignedLine: 'Line C' },
];

const mockQuality = [
  { _id: '1', checkId: 'QC-5501', productionPlanId: 'PLN-101', batchNumber: 'B-001', inspector: 'John Doe', checkDate: '2024-02-20', passed: true, defectsFound: 0, notes: 'All specs within tolerance' },
  { _id: '2', checkId: 'QC-5502', productionPlanId: 'PLN-101', batchNumber: 'B-002', inspector: 'Jane Smith', checkDate: '2024-02-21', passed: false, defectsFound: 3, notes: 'Micro-cracks detected' },
];

const mockStats = {
  stats: {
    totalOrders: 156,
    pendingOrders: 12,
    activeProduction: 5,
    qualityIssues: 3
  },
  revenueData: [
    { name: 'Jan', value: 45000 },
    { name: 'Feb', value: 52000 },
    { name: 'Mar', value: 48000 },
    { name: 'Apr', value: 61000 },
    { name: 'May', value: 55000 },
    { name: 'Jun', value: 67000 },
  ]
};

async function fetchWithMock(endpoint: string, options: RequestInit = {}, mockData: any) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        ...options.headers,
      },
    });
    
    if (!response.ok) throw new Error('API Error');
    return await response.json();
  } catch (error) {
    console.warn(`API call to ${endpoint} failed, using mock data.`, error);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockData;
  }
}

export const api = {
  inventory: {
    getAll: () => fetchWithMock('/inventory', {}, mockInventory),
    create: (data: any) => fetchWithMock('/inventory', { method: 'POST', body: JSON.stringify(data) }, { ...data, _id: Math.random().toString() }),
  },
  orders: {
    getAll: () => fetchWithMock('/orders', {}, mockOrders),
    create: (data: any) => fetchWithMock('/orders', { method: 'POST', body: JSON.stringify(data) }, { ...data, _id: Math.random().toString() }),
  },
  production: {
    getAll: () => fetchWithMock('/production', {}, mockProduction),
  },
  quality: {
    getAll: () => fetchWithMock('/quality', {}, mockQuality),
  },
  reports: {
    getDashboard: () => fetchWithMock('/reports/dashboard', {}, mockStats),
  },
  auth: {
    login: async (credentials: any) => {
      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        if (!response.ok) throw new Error('Login failed');
        return await response.json();
      } catch (e) {
        console.warn('Backend login failed, using mock login');
        return {
          token: 'mock-jwt-token',
          user: { id: 'mock-user', name: 'Demo User', email: credentials.email, role: 'admin', department: 'Management' }
        };
      }
    },
    register: async (data: any) => {
      try {
        const response = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Registration failed');
        return await response.json();
      } catch (e) {
        console.warn('Backend register failed, using mock');
        return { message: 'Mock registration successful' };
      }
    }
  }
};
