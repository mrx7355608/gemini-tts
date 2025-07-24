"use client";

import { useState } from "react";
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
import { Calendar, Activity, BarChart3, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAnalytics from "@/hooks/use-analytics";
import Spinner from "@/components/Spinner";
import UserConsumptionTable from "@/components/UserConsumptionTable";
import AdminNavbar from "@/components/AdminNavbar";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30");
  const {
    dailyUsage,
    weeklyUsage,
    monthlyUsage,
    userConsumption,
    modelUsage,
    loading,
  } = useAnalytics(timeRange);

  // Light green color shades for pie chart (2 models)
  const GREEN_SHADES = [
    "#34d399", // emerald-300
    "#6ee7b7", // emerald-200
  ];

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="p-6 space-y-8">
      <AdminNavbar />
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
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  {truncate(mostActiveUser?.user_name || "No data", 20)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {mostActiveUser?.total_requests || 0} requests
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
        {/* Daily Usage */}
        <Card className="border border-gray-300 shadow-none">
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
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Usage */}
        <Card className="border border-gray-300 shadow-none">
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
        <Card className="border border-gray-300 shadow-none">
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
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Model Usage Distribution */}
        <Card className="border border-gray-300 shadow-none">
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
                    fill="#10B981"
                    dataKey="requests"
                  >
                    {modelUsage.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={GREEN_SHADES[index % GREEN_SHADES.length]}
                      />
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
      <Card className="border border-gray-300 shadow-none">
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
            <UserConsumptionTable userConsumption={userConsumption} />
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
