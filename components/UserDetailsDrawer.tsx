import { useEffect, useState } from "react";
import {
  User,
  Calendar,
  Mail,
  Shield,
  Activity,
  BarChart3,
  Clock,
  TrendingUp,
  Crown,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import Spinner from "@/components/Spinner";

interface UserData {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  created_at: string;
}

interface UsageData {
  model_name: string;
  requests_used: number;
  created_at: string;
}

interface DailyUsage {
  date: string;
  requests: number;
}

interface ModelUsage {
  model_name: string;
  total_requests: number;
  percentage: number;
}

export default function UserDetailsDrawer({
  selectedUser,
  isDrawerOpen,
  setIsDrawerOpen,
  isBlocked,
}: {
  selectedUser: UserData | null;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  isBlocked: boolean;
}) {
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [modelUsage, setModelUsage] = useState<ModelUsage[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedUser && isDrawerOpen) {
      fetchUserUsageData();
    }
  }, [selectedUser, isDrawerOpen]);

  const fetchUserUsageData = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const supabase = createClient();

      // Fetch user's usage data
      const { data: usage, error } = await supabase
        .from("usage")
        .select("model_name, requests_used, created_at")
        .eq("user_id", selectedUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching usage data:", error);
        return;
      }

      const data = usage || [];
      setUsageData(data);

      // Calculate total requests
      const total = data.reduce((sum, item) => sum + item.requests_used, 0);
      setTotalRequests(total);

      // Process daily usage (last 7 days)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        const dayRequests = data
          .filter((item) => item.created_at.startsWith(dateStr))
          .reduce((sum, item) => sum + item.requests_used, 0);

        last7Days.push({
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          requests: dayRequests,
        });
      }
      setDailyUsage(last7Days);

      // Process model usage
      const modelMap: { [key: string]: number } = {};
      data.forEach((item) => {
        modelMap[item.model_name] =
          (modelMap[item.model_name] || 0) + item.requests_used;
      });

      const modelBreakdown = Object.entries(modelMap).map(
        ([model, requests]) => ({
          model_name: model,
          total_requests: requests,
          percentage: total > 0 ? (requests / total) * 100 : 0,
        })
      );

      setModelUsage(modelBreakdown);
    } catch (error) {
      console.error("Error fetching user usage data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedUser) return null;

  const GREEN_SHADES = ["#10b981", "#6ee7b7"];
  const MODEL_DISPLAY_NAMES: { [key: string]: string } = {
    "gemini-tts-2.5-flash": "Gemini TTS 2.5 Flash",
    "gemini-tts-2.5-pro": "Gemini TTS 2.5 Pro",
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <SheetContent className="p-6 py-4 w-[700px] sm:max-w-[700px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-green-600" />
            User Details & Usage
          </SheetTitle>
          <SheetDescription>
            Complete user information and usage analytics
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* User Information */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-green-600" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Full Name
                    </span>
                  </div>
                  <p className="text-sm text-gray-900">
                    {selectedUser.full_name || "N/A"}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Email
                    </span>
                  </div>
                  <p className="text-sm text-gray-900">
                    {selectedUser.email || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Role
                    </span>
                  </div>
                  <Badge variant="secondary">
                    {selectedUser.role === "admin" ? (
                      <Crown className="w-5 h-5 mr-1" />
                    ) : (
                      <User className="w-5 h-5 mr-1" />
                    )}
                    {selectedUser.role.charAt(0).toUpperCase() +
                      selectedUser.role.slice(1)}
                  </Badge>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Status
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      isBlocked
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-green-200 bg-green-50 text-green-700"
                    }`}
                  >
                    {isBlocked ? (
                      <XCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    )}
                    {isBlocked ? "Blocked" : "Active"}
                  </Badge>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">
                    Member Since
                  </span>
                </div>
                <p className="text-sm text-gray-900">
                  {new Date(selectedUser.created_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-2xl font-bold text-gray-600">
                        {totalRequests}
                      </p>
                      <p className="text-sm text-gray-700">Total Requests</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-2xl font-bold text-gray-600">
                        {modelUsage.length}
                      </p>
                      <p className="text-sm text-gray-700">Models Used</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-2xl font-bold text-gray-600">
                        {dailyUsage.length > 0
                          ? Math.round(
                              dailyUsage.reduce(
                                (sum, day) => sum + day.requests,
                                0
                              ) / 7
                            )
                          : 0}
                      </p>
                      <p className="text-sm text-gray-700">Daily Avg (7d)</p>
                    </div>
                  </div>

                  {/* Daily Usage Chart */}
                  {dailyUsage.some((day) => day.requests > 0) && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        Daily Usage (Last 7 Days)
                      </h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={dailyUsage}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip
                            formatter={(value) => [
                              `${value} requests`,
                              "Requests",
                            ]}
                          />
                          <Bar
                            dataKey="requests"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Model Usage Breakdown */}
                  {modelUsage.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-green-600" />
                        Model Usage Breakdown
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {modelUsage.map((model, index) => (
                          <div
                            key={model.model_name}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{
                                  backgroundColor:
                                    GREEN_SHADES[index % GREEN_SHADES.length],
                                }}
                              />
                              <span className="font-medium text-sm">
                                {MODEL_DISPLAY_NAMES[model.model_name] ||
                                  model.model_name}
                              </span>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary" className="text-xs">
                                {model.total_requests} requests
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                {model.percentage.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {totalRequests === 0 && (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">
                        No usage data available for this user
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
