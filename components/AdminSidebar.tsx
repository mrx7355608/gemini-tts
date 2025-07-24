"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  AlertCircle,
  BarChart2,
  ListOrdered,
  Home,
  LayoutDashboard,
  Shield,
  Bell,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const adminNavItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    name: "User Management",
    href: "/dashboard/users",
    icon: <Users className="w-4 h-4" />,
  },
  {
    name: "Error Logs",
    href: "/dashboard/error-logs",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: <Bell className="w-4 h-4" />,
    hasNotifications: true,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: <BarChart2 className="w-4 h-4" />,
  },
  {
    name: "Requests Count",
    href: "/dashboard/requests-count",
    icon: <ListOrdered className="w-4 h-4" />,
  },
  {
    name: "Home",
    href: "/",
    icon: <Home className="w-4 h-4" />,
  },
];

const supabase = createClient();

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isHealthy, setIsHealthy] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      const response = await fetch("/api/health-check");
      if (response.ok) {
        setIsHealthy(true);
        setIsLoading(false);
      } else {
        setIsHealthy(false);
        setIsLoading(false);
      }
    };

    const checkNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("has_read", false);

      if (error) {
        console.error("Error fetching notifications:", error);
      } else {
        console.log("Notifications fetched:", data);
        setUnreadNotifications(data.length);
        setIsNotificationsLoading(false);
      }
    };

    checkHealth();
    checkNotifications();
  }, []);

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-screen overflow-y-auto fixed top-0 left-0">
      {/* Logo/Brand */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 font-semibold text-lg">Admin Panel</h1>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="px-6 mb-6">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          DASHBOARDS
        </div>
        <nav className="space-y-1">
          {adminNavItems.slice(0, 1).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-600"
                }`}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Management Section */}
      <div className="px-6 mb-6">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          MANAGEMENT
        </div>
        <nav className="space-y-1">
          {adminNavItems.slice(1, 6).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-600"
                }`}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                {item.hasNotifications &&
                  !isNotificationsLoading &&
                  unreadNotifications > 0 && (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-green-500" />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Navigation Section */}
      <div className="px-6 mb-6">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          NAVIGATION
        </div>
        <nav className="space-y-1">
          {adminNavItems.slice(6).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-600"
                }`}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status */}
      <div className="px-6 mb-6">
        <div className="flex items-center gap-2 text-sm">
          {isLoading ? (
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
          ) : (
            <div
              className={`w-2 h-2 rounded-full ${
                isHealthy ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
          )}
          <span className="text-gray-500 text-xs">
            {isLoading
              ? "Checking..."
              : isHealthy
              ? "System operational"
              : "System degraded"}
          </span>
        </div>
      </div>
    </div>
  );
}
