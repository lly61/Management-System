import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Factory, 
  ClipboardCheck, 
  Users, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  Settings
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { name: 'Workbench', path: '/home', icon: LayoutDashboard },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Orders', path: '/orders', icon: ShoppingCart },
    { name: 'Production', path: '/production', icon: Factory },
    { name: 'Quality', path: '/quality', icon: ClipboardCheck },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 256 : 80 }}
        className="bg-slate-900 text-white flex-shrink-0 flex flex-col transition-all duration-300 z-20"
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {isSidebarOpen ? (
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              AutoParts Pro
            </span>
          ) : (
            <span className="text-xl font-bold text-blue-400 mx-auto">AP</span>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-800 rounded">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-3 rounded-lg transition-colors group",
                  isActive 
                    ? "bg-blue-600 text-white" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon size={22} className={cn("flex-shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="ml-3 font-medium whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {isSidebarOpen && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.role}</p>
              </div>
            )}
          </div>
          <button 
            onClick={logout}
            className={cn(
              "mt-4 flex items-center w-full px-3 py-2 text-sm font-medium text-red-400 hover:bg-slate-800 rounded-lg transition-colors",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden h-screen">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
          <h1 className="text-xl font-semibold text-gray-800">
            {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Settings size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
