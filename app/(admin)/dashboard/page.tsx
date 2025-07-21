"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Activity,
  AlertTriangle,
  TrendingUp,
  Clock,
  ShieldCheck,
  BarChart3,
  UserPlus,
  Mic2,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Server,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import useUsers from "@/hooks/useUsers";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  totalRequests: number;
  totalErrors: number;
  systemHealth: boolean;
  unreadNotifications: number;
}

interface UsageData {
  model_name: string;
  total_requests: number;
}

interface RecentActivity {
  id: string;
  type: "user_signup" | "error" | "request";
  message: string;
  timestamp: string;
  user_email?: string;
}

const MODEL_COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function Dashboard() {
  const { users, bannedUsersIDs, loading: usersLoading } = useUsers();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    totalRequests: 0,
    totalErrors: 0,
    systemHealth: false,
    unreadNotifications: 0,
  });
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (usersLoading) return;

      try {
        setLoading(true);
        const supabase = createClient();

        // Fetch system health
        const healthResponse = await fetch("/api/health-check");
        const systemHealth = healthResponse.ok;

        // Fetch total requests from usage table
        const { data: usageRawData } = await supabase
          .from("usage")
          .select("model_name, requests_used");

        const totalRequests =
          usageRawData?.reduce((sum, item) => sum + item.requests_used, 0) || 0;

        // Process usage data for charts
        const modelUsage: { [key: string]: number } = {};
        usageRawData?.forEach((item) => {
          modelUsage[item.model_name] =
            (modelUsage[item.model_name] || 0) + item.requests_used;
        });

        const chartUsageData = Object.entries(modelUsage).map(
          ([model, requests]) => ({
            model_name: model,
            total_requests: requests,
          })
        );

        // Fetch error logs count
        const { data: errorLogs } = await supabase
          .from("error-logs")
          .select("id")
          .not("error_message", "is", null);

        // Fetch unread notifications
        const { data: notifications } = await supabase
          .from("notifications")
          .select("id")
          .eq("has_read", false);

        // Create recent activity
        const activity: RecentActivity[] = [];

        // Add recent user signups (last 5)
        const recentUsers = users.slice(0, 5).map((user) => ({
          id: user.id,
          type: "user_signup" as const,
          message: `New user registered: ${user.full_name}`,
          timestamp: user.created_at,
          user_email: user.email,
        }));

        // Add recent errors (last 3)
        const { data: recentErrors } = await supabase
          .from("error-logs")
          .select("id, error_message, created_at, user_profile!inner(email)")
          .not("error_message", "is", null)
          .order("created_at", { ascending: false })
          .limit(3);

        const errorActivities =
          recentErrors?.map((error) => ({
            id: error.id,
            type: "error" as const,
            message: `Error: ${error.error_message.substring(0, 50)}...`,
            timestamp: error.created_at,
            user_email: error.user_profile?.email,
          })) || [];

        activity.push(...recentUsers, ...errorActivities);
        activity.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setStats({
          totalUsers: users.length,
          activeUsers: users.length - bannedUsersIDs.length,
          bannedUsers: bannedUsersIDs.length,
          totalRequests,
          totalErrors: errorLogs?.length || 0,
          systemHealth,
          unreadNotifications: notifications?.length || 0,
        });

        setUsageData(chartUsageData);
        setRecentActivity(activity.slice(0, 8));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [users, bannedUsersIDs, usersLoading]);

  if (loading || usersLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-300 rounded-xl h-32"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-gray-300 rounded-xl h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome to your admin panel overview
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              stats.systemHealth ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm text-gray-600">
            {stats.systemHealth ? "System Operational" : "System Issues"}
          </span>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalUsers}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.activeUsers} active, {stats.bannedUsers} banned
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Requests
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.totalRequests}
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  All time
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  System Errors
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.totalErrors}
                </p>
                <p className="text-xs text-gray-500 mt-1">Logged errors</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Notifications
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.unreadNotifications}
                </p>
                <p className="text-xs text-gray-500 mt-1">Unread alerts</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Model Usage Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Model Usage Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={usageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ model_name, percent }) =>
                      `${model_name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_requests"
                  >
                    {usageData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={MODEL_COLORS[index % MODEL_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <Mic2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No usage data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/notifications">
                  View All <ArrowUpRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        activity.type === "user_signup"
                          ? "bg-green-100"
                          : activity.type === "error"
                          ? "bg-red-100"
                          : "bg-blue-100"
                      }`}
                    >
                      {activity.type === "user_signup" && (
                        <UserPlus className="w-4 h-4 text-green-600" />
                      )}
                      {activity.type === "error" && (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                      {activity.type === "request" && (
                        <Activity className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                        {activity.user_email && (
                          <Badge variant="secondary" className="text-xs">
                            {activity.user_email}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  <div className="text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-auto p-4">
              <Link
                href="/dashboard/users"
                className="flex flex-col items-center gap-2"
              >
                <Users className="w-6 h-6" />
                <span>Manage Users</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4">
              <Link
                href="/dashboard/error-logs"
                className="flex flex-col items-center gap-2"
              >
                <AlertTriangle className="w-6 h-6" />
                <span>View Error Logs</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4">
              <Link
                href="/dashboard/analytics"
                className="flex flex-col items-center gap-2"
              >
                <BarChart3 className="w-6 h-6" />
                <span>Analytics</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4">
              <Link
                href="/dashboard/notifications"
                className="flex flex-col items-center gap-2"
              >
                <Bell className="w-6 h-6" />
                <span>Notifications</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
