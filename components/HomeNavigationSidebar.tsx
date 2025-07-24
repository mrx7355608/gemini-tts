"use client";
import { useAuth } from "../contexts/AuthContext";
import {
  ChartBar,
  History,
  LogOut,
  Mic,
  User,
  Sparkles,
  ChevronRight,
  Shield,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function HomeNavigationSidebar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const navigationItems = [
    {
      name: "Generate Audio",
      href: "/",
      icon: <Mic className="w-5 h-5" />,
    },
    {
      name: "Usage Analytics",
      href: "/usage",
      icon: <ChartBar className="w-5 h-5" />,
    },
    {
      name: "History",
      href: "/history",
      icon: <History className="w-5 h-5" />,
    },
  ];

  // Add admin dashboard link if user is admin
  const isAdmin = user?.user_metadata?.role === "admin";
  const navItems = isAdmin
    ? [
        ...navigationItems,
        {
          name: "Admin Dashboard",
          href: "/dashboard",
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
      ]
    : navigationItems;

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen overflow-y-auto fixed top-0 left-0">
      {/* Logo/Brand */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 font-semibold text-lg">Gemini TTS</h1>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="px-6 mb-6">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          NAVIGATION
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
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
                {item.name === "Admin Dashboard" && (
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-green-500" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Section */}
      <div className="px-6 pb-6 mt-auto">
        <Card className="bg-gray-50 border shadow-none py-3 px-0 w-full">
          <CardContent className="px-4 py-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.user_metadata?.full_name || user?.email || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="mt-5 w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-700 border-gray-200 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-lg transition-all duration-200 group"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
