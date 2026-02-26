import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Production from './pages/Production';
import Quality from './pages/Quality';
import UsersPage from './pages/Users';
import Reports from './pages/Reports';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <DashboardLayout>{children}</DashboardLayout> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/production" element={<PrivateRoute><Production /></PrivateRoute>} />
          <Route path="/quality" element={<PrivateRoute><Quality /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/home" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
