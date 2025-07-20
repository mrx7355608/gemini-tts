"use client";
import { useAuth } from "../contexts/AuthContext";
import {
  ChartBar,
  History,
  LogOut,
  Mic,
  User,
  Sparkles,
  Activity,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function HomeNavigationSidebar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const navigationItems = [
    {
      name: "Generate Audio",
      href: "/",
      icon: <Mic className="w-5 h-5" />,
      description: "Create speech from text",
    },
    {
      name: "Usage Analytics",
      href: "/usage",
      icon: <ChartBar className="w-5 h-5" />,
      description: "View your usage stats",
    },
    {
      name: "History",
      href: "/history",
      icon: <History className="w-5 h-5" />,
      description: "Your generated audio",
    },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="w-72 bg-gradient-to-b from-white to-gray-50/50 border-r border-gray-200/50 h-screen flex flex-col backdrop-blur-sm">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Gemini TTS
            </h1>
            <p className="text-xs text-gray-500 mt-1">AI Speech Generator</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center gap-4 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "border border-green-300 bg-green-100/50 text-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div
                  className={`bg-gray-100 p-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-green-700 bg-green-200"
                      : "text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-900"
                  }`}
                >
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{item.name}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200/50">
        <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-sm py-3">
          <CardContent className="px-4 py-0">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <User className="w-6 h-6 text-green-600" />
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

            <Separator className="my-3" />

            {/* Logout Button */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="cursor-pointer w-full flex items-center justify-start px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
            >
              <LogOut className="w-4 h-4 mr-3 transition-transform duration-200" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
