import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
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
  Settings,
} from "lucide-react";
import { Select } from "antd";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import { useGlobalStore, type Lang } from "../store/globalStore";

const LANGUAGE_OPTIONS = [
  { value: "zh" as const, label: "中文" },
  { value: "en" as const, label: "English" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const lang = useGlobalStore((s) => s.lang);
  const setLang = useGlobalStore((s) => s.setLang);
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { nameKey: "nav.workbench", path: "/home", icon: LayoutDashboard },
    { nameKey: "nav.inventory", path: "/inventory", icon: Package },
    { nameKey: "nav.orders", path: "/orders", icon: ShoppingCart },
    { nameKey: "nav.production", path: "/production", icon: Factory },
    { nameKey: "nav.quality", path: "/quality", icon: ClipboardCheck },
    { nameKey: "nav.users", path: "/users", icon: Users },
    { nameKey: "nav.reports", path: "/reports", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 256 : 80 }}
        className="bg-slate-900 text-white shrink-0 flex flex-col transition-all duration-300 z-20"
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {isSidebarOpen ? (
            <span className="text-xl font-bold bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              {t("layout.appName")}
            </span>
          ) : (
            <span className="text-xl font-bold text-blue-400 mx-auto">{t("layout.appShort")}</span>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-slate-800 rounded"
          >
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
                <item.icon
                  size={22}
                  className={cn(
                    "shrink-0",
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-white"
                  )}
                />
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-3 font-medium whitespace-nowrap"
                  >
                    {t(item.nameKey)}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
            {isSidebarOpen && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name}
                </p>
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
            {isSidebarOpen && <span className="ml-3">{t("layout.logout")}</span>}
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col overflow-hidden h-screen">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
          <h1 className="text-xl font-semibold text-gray-800">
            {(() => {
              const item = navItems.find((i) => i.path === location.pathname);
              return item ? t(item.nameKey) : t("layout.dashboard");
            })()}
          </h1>
          <div className="flex items-center gap-3">
            <Select
              value={lang}
              onChange={(v) => setLang(v as Lang)}
              options={LANGUAGE_OPTIONS}
              className="w-28"
              size="middle"
            />
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
