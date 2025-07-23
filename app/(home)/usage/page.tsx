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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import Spinner from "@/components/Spinner";

interface UsageData {
  model_name: string;
  requests_used: number;
}

interface ProcessedUsageData {
  totalRequests: number;
  remainingRequests: number;
  monthlyLimit: number;
  modelUsage: Array<{
    name: string;
    requests: number;
    color: string;
  }>;
}

const MODEL_COLORS: { [key: string]: string } = {
  "Gemini 2.5 Pro": "#10B981",
  "Gemini 2.5 Flash": "#3B82F6",
  "Gemini Pro": "#F59E0B",
  "Gemini Flash": "#EF4444",
  default: "#6B7280",
};

export default function UsagePage() {
  const { user } = useAuth();
  const [usageData, setUsageData] = useState<ProcessedUsageData>({
    totalRequests: 0,
    remainingRequests: 50,
    monthlyLimit: 50,
    modelUsage: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsageData = async () => {
      if (!user?.id) {
        return;
      }

      try {
        setLoading(true);
        const supabase = createClient();

        const { data: rawData, error } = await supabase
          .from("usage")
          .select("model_name, requests_used")
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }

        // Process the data
        const totalRequests = rawData.reduce(
          (sum, item) => sum + item.requests_used,
          0
        );
        const monthlyLimit = 50;
        const remainingRequests = Math.max(0, monthlyLimit - totalRequests);

        // Group by model and prepare for charts
        const modelUsage = rawData.map((item, index) => ({
          name: item.model_name,
          requests: item.requests_used,
          color: MODEL_COLORS[item.model_name] || MODEL_COLORS.default,
        }));

        setUsageData({
          totalRequests,
          remainingRequests,
          monthlyLimit,
          modelUsage,
        });
      } catch (err) {
        console.error("Error fetching usage data:", err);
        setError("Failed to load usage data");
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, [user?.id]);

  const usagePercentage =
    (usageData.totalRequests / usageData.monthlyLimit) * 100;

  if (loading) {
    return <Spinner message="Please wait while we fetch the usage data..." />;
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Usage Statistics
        </h1>
        <p className="text-gray-600">Track your API usage and request limits</p>
      </div>

      {/* Usage Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Requests
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {usageData.totalRequests}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Remaining Requests
              </p>
              <p
                className={`text-3xl font-bold ${
                  usageData.remainingRequests <= 10
                    ? "text-red-600"
                    : "text-blue-600"
                }`}
              >
                {usageData.remainingRequests}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Limit</p>
              <p className="text-3xl font-bold text-gray-900">
                {usageData.monthlyLimit}
              </p>
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Usage</span>
                  <span className="font-medium">
                    {usagePercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      usagePercentage >= 90
                        ? "bg-red-500"
                        : usagePercentage >= 70
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {usageData.modelUsage.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Model Usage Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Model Usage Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usageData.modelUsage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent || 0) * 100}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="requests"
                >
                  {usageData.modelUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Model Usage Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Requests by Model
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageData.modelUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="requests" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Usage Data
          </h3>
          <p className="text-gray-600">
            You haven't made any API requests yet. Start using the service to
            see your usage statistics here.
          </p>
        </div>
      )}
    </div>
  );
}
