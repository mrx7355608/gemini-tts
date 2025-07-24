"use client";

import { useEffect, useState, useMemo } from "react";
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
  User,
  Calendar,
  CalendarDays,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import useUsers from "@/hooks/useUsers";
import useAnalytics from "@/hooks/use-analytics";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import AdminNavbar from "@/components/AdminNavbar";
import Spinner from "@/components/Spinner";

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

interface DailyErrors {
  date: string;
  errors: number;
  day: string;
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
  const {
    dailyUsage,
    weeklyUsage,
    monthlyUsage,
    loading: analyticsLoading,
  } = useAnalytics("30"); // Last 30 days
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
  const [dailyErrors, setDailyErrors] = useState<DailyErrors[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate summary stats for charts
  const dailyTotal = useMemo(() => {
    return dailyUsage.reduce((sum, day) => sum + day.requests, 0);
  }, [dailyUsage]);

  const weeklyTotal = useMemo(() => {
    return weeklyUsage.reduce((sum, week) => sum + week.requests, 0);
  }, [weeklyUsage]);

  const monthlyTotal = useMemo(() => {
    return monthlyUsage.reduce((sum, month) => sum + month.requests, 0);
  }, [monthlyUsage]);

  const modelTotal = useMemo(() => {
    return usageData.reduce((sum, model) => sum + model.total_requests, 0);
  }, [usageData]);

  const errorsTotal = useMemo(() => {
    return dailyErrors.reduce((sum, day) => sum + day.errors, 0);
  }, [dailyErrors]);

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

        // Fetch daily error logs for the past week
        const { data: weeklyErrorLogs } = await supabase
          .from("error-logs")
          .select("created_at")
          .not("error_message", "is", null)
          .gte(
            "created_at",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          )
          .order("created_at", { ascending: true });

        // Process daily error data
        const dailyErrorMap: { [key: string]: number } = {};

        // Create last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateKey = date.toISOString().split("T")[0];
          dailyErrorMap[dateKey] = 0;
        }

        // Aggregate error data by day
        weeklyErrorLogs?.forEach((error) => {
          const date = new Date(error.created_at).toISOString().split("T")[0];
          if (dailyErrorMap.hasOwnProperty(date)) {
            dailyErrorMap[date] += 1;
          }
        });

        const dailyErrorsData = Object.entries(dailyErrorMap).map(
          ([date, errors]) => ({
            date,
            errors,
            day: new Date(date).toLocaleDateString("en-US", {
              weekday: "short",
            }),
          })
        );

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
          recentErrors?.map((error: any) => ({
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
        setDailyErrors(dailyErrorsData);
        setRecentActivity(activity.slice(0, 8));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [users, bannedUsersIDs, usersLoading]);

  if (loading || usersLoading || analyticsLoading) {
    return <Spinner />;
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
    <>
      <AdminNavbar />
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border border-gray-300 py-1 shadow-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.totalUsers}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.activeUsers} active, {stats.bannedUsers} banned
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-300 py-1 shadow-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    System Errors
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.totalErrors}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Logged errors</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-300 py-1 shadow-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Notifications
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.unreadNotifications}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Unread alerts</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Bell className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Count Bar Chart */}
          <Card className="border border-gray-300 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Requests by Model
              </CardTitle>
              <div className="text-sm text-gray-600 mt-1">
                Total requests: {modelTotal.toLocaleString()} •{" "}
                {usageData.length} models
              </div>
            </CardHeader>
            <CardContent>
              {usageData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="model_name"
                      fontSize={12}
                      tick={{ fill: "#6b7280" }}
                    />
                    <YAxis fontSize={12} tick={{ fill: "#6b7280" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="total_requests"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No request data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Error Logs Chart */}
          <Card className="border border-gray-300 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Daily Error Logs
              </CardTitle>
              <div className="text-sm text-gray-600 mt-1">
                Total errors: {errorsTotal.toLocaleString()} • Last 7 days
              </div>
            </CardHeader>
            <CardContent>
              {dailyErrors.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyErrors}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="day"
                      fontSize={12}
                      tick={{ fill: "#6b7280" }}
                    />
                    <YAxis fontSize={12} tick={{ fill: "#6b7280" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="errors"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No error data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Analytics */}
          <Card className="border border-gray-300 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Daily Analytics
              </CardTitle>
              <div className="text-sm text-gray-600 mt-1">
                Total requests: {dailyTotal.toLocaleString()} • Last{" "}
                {dailyUsage.length} days
              </div>
            </CardHeader>
            <CardContent>
              {dailyUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyUsage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="day"
                      fontSize={12}
                      tick={{ fill: "#6b7280" }}
                    />
                    <YAxis fontSize={12} tick={{ fill: "#6b7280" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="requests"
                      fill="#10b981"
                      fillOpacity={0.3}
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No daily data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Analytics */}
          <Card className="border border-gray-300 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Weekly Analytics
              </CardTitle>
              <div className="text-sm text-gray-600 mt-1">
                Total requests: {weeklyTotal.toLocaleString()} • Last{" "}
                {weeklyUsage.length} weeks
              </div>
            </CardHeader>
            <CardContent>
              {weeklyUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyUsage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="week"
                      fontSize={12}
                      tick={{ fill: "#6b7280" }}
                    />
                    <YAxis fontSize={12} tick={{ fill: "#6b7280" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="requests"
                      fill="#10b981"
                      fillOpacity={0.3}
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No weekly data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Analytics */}
          <Card className="border border-gray-300 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Monthly Analytics
              </CardTitle>
              <div className="text-sm text-gray-600 mt-1">
                Total requests: {monthlyTotal.toLocaleString()} • Last{" "}
                {monthlyUsage.length} months
              </div>
            </CardHeader>
            <CardContent>
              {monthlyUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyUsage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="monthName"
                      fontSize={12}
                      tick={{ fill: "#6b7280" }}
                    />
                    <YAxis fontSize={12} tick={{ fill: "#6b7280" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="requests"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <CalendarDays className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No monthly data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 gap-8">
          {/* Recent Activity */}
          <Card className="border border-gray-300 shadow-none">
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
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border"
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
                            <Badge
                              variant="outline"
                              className="border-gray-200 text-xs"
                            >
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
        <Card className="border border-gray-300 shadow-none">
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
    </>
  );
}
