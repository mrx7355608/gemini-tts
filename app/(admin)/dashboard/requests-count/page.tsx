"use client";

import { useEffect, useState } from "react";
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
} from "recharts";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Zap,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// Progress component created inline
import { Alert, AlertDescription } from "@/components/ui/alert";
import Spinner from "@/components/Spinner";
import AdminNavbar from "@/components/AdminNavbar";

interface ModelUsage {
  model_name: string;
  total_requests: number;
  percentage: number;
  color: string;
}

interface UsageStats {
  totalUsed: number;
  remaining: number;
  limit: number;
  usagePercentage: number;
  modelBreakdown: ModelUsage[];
}

interface RecentUsage {
  date: string;
  requests: number;
  models: { [key: string]: number };
}

const SYSTEM_LIMIT = 1000;

const MODEL_COLORS = {
  "gemini-tts-2.5-flash": "#10b981", // emerald-500
  "gemini-tts-2.5-pro": "#6ee7b7", // emerald-200
  default: "#34d399", // emerald-300
};

const MODEL_DISPLAY_NAMES = {
  "gemini-tts-2.5-flash": "Gemini TTS 2.5 Flash",
  "gemini-tts-2.5-pro": "Gemini TTS 2.5 Pro",
};

export default function RequestCount() {
  const [recentUsage, setRecentUsage] = useState<RecentUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UsageStats>({
    totalUsed: 0,
    remaining: SYSTEM_LIMIT,
    limit: SYSTEM_LIMIT,
    usagePercentage: 0,
    modelBreakdown: [],
  });

  useEffect(() => {
    fetchRequestsData();
  }, []);

  const fetchRequestsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      // Fetch all usage data
      const { data: usageData, error: usageError } = await supabase
        .from("usage")
        .select("model_name, requests_used, created_at");

      if (usageError) {
        throw usageError;
      }

      const data = usageData || [];

      // Calculate total usage
      const totalUsed = data.reduce((sum, item) => sum + item.requests_used, 0);
      const remaining = Math.max(0, SYSTEM_LIMIT - totalUsed);
      const usagePercentage = (totalUsed / SYSTEM_LIMIT) * 100;

      // Process model breakdown
      const modelMap: { [key: string]: number } = {};
      data.forEach((item) => {
        const modelKey = item.model_name;
        modelMap[modelKey] = (modelMap[modelKey] || 0) + item.requests_used;
      });

      const modelBreakdown = Object.entries(modelMap).map(
        ([model, requests], index) => {
          // Log the model name for debugging
          console.log("Model name:", model);

          // Get color by exact match or use alternating emerald colors for 2 models
          let color;
          if (MODEL_COLORS[model as keyof typeof MODEL_COLORS]) {
            color = MODEL_COLORS[model as keyof typeof MODEL_COLORS];
          } else {
            // Use alternating emerald colors if exact match not found
            color = index === 0 ? "#10b981" : "#6ee7b7"; // emerald-500 and emerald-200
          }

          return {
            model_name: model,
            total_requests: requests,
            percentage: totalUsed > 0 ? (requests / totalUsed) * 100 : 0,
            color: color,
          };
        }
      );

      // Process recent usage (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentData = data.filter(
        (item) => new Date(item.created_at) >= sevenDaysAgo
      );

      // Group by day
      const dailyMap: {
        [key: string]: { total: number; models: { [key: string]: number } };
      } = {};

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split("T")[0];
        dailyMap[dateKey] = { total: 0, models: {} };
      }

      recentData.forEach((item) => {
        const dateKey = new Date(item.created_at).toISOString().split("T")[0];
        if (dailyMap[dateKey]) {
          dailyMap[dateKey].total += item.requests_used;
          dailyMap[dateKey].models[item.model_name] =
            (dailyMap[dateKey].models[item.model_name] || 0) +
            item.requests_used;
        }
      });

      const recentUsageArray = Object.entries(dailyMap).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        requests: data.total,
        models: data.models,
      }));

      setStats({
        totalUsed,
        remaining,
        limit: SYSTEM_LIMIT,
        usagePercentage,
        modelBreakdown,
      });

      setRecentUsage(recentUsageArray);
    } catch (err: any) {
      console.error("Error fetching requests data:", err);
      setError(err.message || "Failed to fetch requests data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  const getStatusBgColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-100";
    if (percentage >= 70) return "bg-yellow-100";
    return "bg-green-100";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (loading) {
    return (
      <Spinner message="Please wait while we fetch the requests data..." />
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <AdminNavbar />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Request Count Monitor
          </h1>
          <p className="text-gray-600 mt-2">
            System-wide request usage tracking and limits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              stats.usagePercentage >= 90
                ? "bg-red-500"
                : stats.usagePercentage >= 70
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
          ></div>
          <span className="text-sm text-gray-600">
            {stats.usagePercentage >= 90
              ? "Critical Usage"
              : stats.usagePercentage >= 70
              ? "High Usage"
              : "Normal Usage"}
          </span>
        </div>
      </div>

      {/* Alert for high usage */}
      {stats.usagePercentage >= 80 && (
        <Alert
          className={`border-${
            stats.usagePercentage >= 90 ? "red" : "yellow"
          }-200 bg-${stats.usagePercentage >= 90 ? "red" : "yellow"}-50`}
        >
          <AlertCircle
            className={`w-4 h-4 ${
              stats.usagePercentage >= 90 ? "text-red-600" : "text-yellow-600"
            }`}
          />
          <AlertDescription
            className={
              stats.usagePercentage >= 90 ? "text-red-800" : "text-yellow-800"
            }
          >
            {stats.usagePercentage >= 90
              ? `Critical: You've used ${stats.usagePercentage.toFixed(
                  1
                )}% of your request limit. Only ${
                  stats.remaining
                } requests remaining!`
              : `Warning: High usage detected. ${stats.usagePercentage.toFixed(
                  1
                )}% of limit used with ${stats.remaining} requests remaining.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Used */}
        <Card className="border border-gray-300 shadow-sm py-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Requests Used
                </p>
                <p
                  className={`text-3xl font-bold ${getStatusColor(
                    stats.usagePercentage
                  )}`}
                >
                  {stats.totalUsed.toLocaleString()}
                </p>
              </div>
              <div
                className={`p-3 ${getStatusBgColor(
                  stats.usagePercentage
                )} rounded-lg`}
              >
                <Activity
                  className={`w-6 h-6 ${getStatusColor(stats.usagePercentage)}`}
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Usage Progress</span>
                <span className="font-medium">
                  {stats.usagePercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                    stats.usagePercentage
                  )}`}
                  style={{ width: `${Math.min(stats.usagePercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Remaining */}
        <Card className="border border-gray-300 shadow-sm py-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Requests Remaining
                </p>
                <p
                  className={`text-3xl font-bold ${
                    stats.remaining <= 100
                      ? "text-red-600"
                      : stats.remaining <= 300
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {stats.remaining.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Out of {stats.limit.toLocaleString()} total
                </p>
              </div>
              <div
                className={`p-3 ${
                  stats.remaining <= 100
                    ? "bg-red-100"
                    : stats.remaining <= 300
                    ? "bg-yellow-100"
                    : "bg-green-100"
                } rounded-lg`}
              >
                {stats.remaining <= 100 ? (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Limit */}
        <Card className="border border-gray-300 shadow-sm py-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  System Limit
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.limit.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Maximum requests</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Zap className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Model Breakdown */}
        <Card className="border border-gray-300 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Model Usage Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.modelBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.modelBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ model_name, percentage }) => {
                        const displayName =
                          MODEL_DISPLAY_NAMES[
                            model_name as keyof typeof MODEL_DISPLAY_NAMES
                          ] || model_name;
                        return `${displayName} ${percentage.toFixed(1)}%`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total_requests"
                    >
                      {stats.modelBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} requests (${props.payload.percentage.toFixed(
                          1
                        )}%)`,
                        MODEL_DISPLAY_NAMES[
                          props.payload
                            .model_name as keyof typeof MODEL_DISPLAY_NAMES
                        ] || props.payload.model_name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Model Stats */}
                <div className="mt-4 space-y-3">
                  {stats.modelBreakdown.map((model) => (
                    <div
                      key={model.model_name}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: model.color }}
                        ></div>
                        <span className="font-medium">
                          {MODEL_DISPLAY_NAMES[
                            model.model_name as keyof typeof MODEL_DISPLAY_NAMES
                          ] || model.model_name}
                        </span>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">
                          {model.total_requests.toLocaleString()} requests
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {model.percentage.toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No usage data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Usage Trend */}
        <Card className="border border-gray-300 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Usage (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recentUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} requests`, "Requests"]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar dataKey="requests" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Daily breakdown */}
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Daily Summary
              </p>
              <div className="grid grid-cols-7 gap-2">
                {recentUsage.map((day, index) => (
                  <div
                    key={index}
                    className="text-center p-2 bg-gray-50 rounded"
                  >
                    <p className="text-xs text-gray-500">
                      {day.date.split(" ")[0]}
                    </p>
                    <p className="text-sm font-medium">{day.requests}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
