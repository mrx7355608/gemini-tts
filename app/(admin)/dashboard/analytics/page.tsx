"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  Users,
  Activity,
  Crown,
  BarChart3,
  Clock,
  User,
  ArrowUpRight,
  Download,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UsageRecord {
  user_id: string;
  model_name: string;
  requests_used: number;
  created_at: string;
  user_profile?: {
    full_name: string;
    email: string;
  };
}

interface DailyUsage {
  date: string;
  requests: number;
  day: string;
}

interface WeeklyUsage {
  week: string;
  requests: number;
  weekNumber: number;
}

interface MonthlyUsage {
  month: string;
  requests: number;
  monthName: string;
}

interface UserConsumption {
  user_id: string;
  user_name: string;
  user_email: string;
  total_requests: number;
  models_used: string[];
}

interface ModelUsage {
  model_name: string;
  requests: number;
  percentage: number;
  color: string;
}

const MODEL_COLORS = {
  "Gemini 2.5 Pro": "#10B981",
  "Gemini 2.5 Flash": "#3B82F6",
  "Gemini Pro": "#F59E0B",
  "Gemini Flash": "#EF4444",
  default: "#6B7280",
};

export default function Analytics() {
  const [usageData, setUsageData] = useState<UsageRecord[]>([]);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [weeklyUsage, setWeeklyUsage] = useState<WeeklyUsage[]>([]);
  const [monthlyUsage, setMonthlyUsage] = useState<MonthlyUsage[]>([]);
  const [userConsumption, setUserConsumption] = useState<UserConsumption[]>([]);
  const [modelUsage, setModelUsage] = useState<ModelUsage[]>([]);
  const [mostActiveUser, setMostActiveUser] = useState<UserConsumption | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30"); // days
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(timeRange));

      // Fetch usage data with user profiles
      const { data: rawUsageData, error } = await supabase
        .from("usage")
        .select(
          `
          user_id,
          model_name,
          requests_used,
          created_at,
          user_profile!inner(full_name, email)
        `
        )
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching usage data:", error);
        return;
      }

      const data = rawUsageData || [];
      setUsageData(data);

      // Process the data
      processDaily(data);
      processWeekly(data);
      processMonthly(data);
      processUserConsumption(data);
      processModelUsage(data);

      // Calculate totals
      const total = data.reduce((sum, item) => sum + item.requests_used, 0);
      const uniqueUsers = new Set(data.map((item) => item.user_id)).size;
      setTotalRequests(total);
      setTotalUsers(uniqueUsers);
    } catch (error) {
      console.error("Error in fetchAnalyticsData:", error);
    } finally {
      setLoading(false);
    }
  };

  const processDaily = (data: UsageRecord[]) => {
    const dailyMap: { [key: string]: number } = {};

    // Create last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      dailyMap[dateKey] = 0;
    }

    // Aggregate data by day
    data.forEach((item) => {
      const date = new Date(item.created_at).toISOString().split("T")[0];
      if (dailyMap.hasOwnProperty(date)) {
        dailyMap[date] += item.requests_used;
      }
    });

    const daily = Object.entries(dailyMap).map(([date, requests]) => ({
      date,
      requests,
      day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
    }));

    setDailyUsage(daily);
  };

  const processWeekly = (data: UsageRecord[]) => {
    const weeklyMap: { [key: number]: number } = {};

    data.forEach((item) => {
      const date = new Date(item.created_at);
      const weekNumber = getWeekNumber(date);
      weeklyMap[weekNumber] = (weeklyMap[weekNumber] || 0) + item.requests_used;
    });

    const weekly = Object.entries(weeklyMap)
      .map(([week, requests]) => ({
        week: `Week ${week}`,
        requests: Number(requests),
        weekNumber: Number(week),
      }))
      .slice(-4); // Last 4 weeks

    setWeeklyUsage(weekly);
  };

  const processMonthly = (data: UsageRecord[]) => {
    const monthlyMap: { [key: string]: number } = {};

    data.forEach((item) => {
      const date = new Date(item.created_at);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + item.requests_used;
    });

    const monthly = Object.entries(monthlyMap)
      .map(([month, requests]) => {
        const [year, monthIndex] = month.split("-");
        const date = new Date(Number(year), Number(monthIndex));
        return {
          month,
          requests: Number(requests),
          monthName: date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
        };
      })
      .slice(-6); // Last 6 months

    setMonthlyUsage(monthly);
  };

  const processUserConsumption = (data: UsageRecord[]) => {
    const userMap: { [key: string]: UserConsumption } = {};

    data.forEach((item) => {
      if (!userMap[item.user_id]) {
        userMap[item.user_id] = {
          user_id: item.user_id,
          user_name: item.user_profile?.full_name || "Unknown User",
          user_email: item.user_profile?.email || "unknown@email.com",
          total_requests: 0,
          models_used: [],
        };
      }

      userMap[item.user_id].total_requests += item.requests_used;

      if (!userMap[item.user_id].models_used.includes(item.model_name)) {
        userMap[item.user_id].models_used.push(item.model_name);
      }
    });

    const users = Object.values(userMap).sort(
      (a, b) => b.total_requests - a.total_requests
    );
    setUserConsumption(users);
    setMostActiveUser(users[0] || null);
  };

  const processModelUsage = (data: UsageRecord[]) => {
    const modelMap: { [key: string]: number } = {};
    let total = 0;

    data.forEach((item) => {
      modelMap[item.model_name] =
        (modelMap[item.model_name] || 0) + item.requests_used;
      total += item.requests_used;
    });

    const models = Object.entries(modelMap).map(([model_name, requests]) => ({
      model_name,
      requests,
      percentage: total > 0 ? (requests / total) * 100 : 0,
      color:
        MODEL_COLORS[model_name as keyof typeof MODEL_COLORS] ||
        MODEL_COLORS.default,
    }));

    setModelUsage(models);
  };

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-300 rounded-xl h-32"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-300 rounded-xl h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive usage and consumption analytics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Requests
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {totalRequests.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Last {timeRange} days
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Users
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {totalUsers}
                </p>
                <p className="text-xs text-gray-500 mt-1">Unique users</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg per User
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {totalUsers > 0 ? Math.round(totalRequests / totalUsers) : 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Requests per user</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Most Active</p>
                <p className="text-lg font-bold text-orange-600 truncate">
                  {mostActiveUser?.user_name || "No data"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {mostActiveUser?.total_requests || 0} requests
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Crown className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Usage */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Daily Usage (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} requests`, "Requests"]}
                  labelFormatter={(label) => `Day: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Usage */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Weekly Usage (Last 4 Weeks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} requests`, "Requests"]}
                />
                <Bar dataKey="requests" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Usage */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Monthly Usage Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthName" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} requests`, "Requests"]}
                />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={{ fill: "#F59E0B", strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Model Usage Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Model Usage Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {modelUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={modelUsage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ model_name, percentage }) =>
                      `${model_name} ${percentage.toFixed(1)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="requests"
                  >
                    {modelUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} requests`, "Requests"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>No model usage data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Consumption Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Per User Consumption
            </div>
            <Badge variant="secondary">{userConsumption.length} users</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userConsumption.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      #
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      User
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Requests
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Models Used
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userConsumption.slice(0, 10).map((user, index) => (
                    <tr
                      key={user.user_id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {index + 1}
                          {index === 0 && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {user.user_name}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {user.user_email}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          {user.total_requests} requests
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {user.models_used.map((model) => (
                            <Badge
                              key={model}
                              variant="outline"
                              className="text-xs"
                            >
                              {model}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <p>No user consumption data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
