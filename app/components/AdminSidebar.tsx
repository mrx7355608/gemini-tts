"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  AlertCircle,
  BarChart2,
  ListOrdered,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const adminNavItems = [
  {
    name: "User Management",
    href: "/dashboard/users",
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: "Error Logs",
    href: "/dashboard/error-logs",
    icon: <AlertCircle className="w-5 h-5" />,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: <BarChart2 className="w-5 h-5" />,
  },
  {
    name: "Requests Count",
    href: "/dashboard/requests-count",
    icon: <ListOrdered className="w-5 h-5" />,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Admin Dashboard</h2>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.user_metadata?.full_name || user?.email || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
}
