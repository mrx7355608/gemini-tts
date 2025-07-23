import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  UsageRecord,
  DailyUsage,
  WeeklyUsage,
  MonthlyUsage,
  UserConsumption,
  ModelUsage,
} from "@/lib/analytics.types";

const MODEL_COLORS = {
  "Gemini 2.5 Pro": "#10B981",
  "Gemini 2.5 Flash": "#3B82F6",
  "Gemini Pro": "#F59E0B",
  "Gemini Flash": "#EF4444",
  default: "#6B7280",
};

export default function useAnalytics(timeRange: string) {
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

      console.log("rawUsageData", rawUsageData);
      const data = rawUsageData.map((item) => {
        return {
          ...item,
          user_profile: item.user_profile[0] || item.user_profile,
        };
      });

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

    // Aggregate requests by day
    data.forEach((item) => {
      const itemDate = new Date(item.created_at);
      const dateKey = itemDate.toISOString().split("T")[0];

      // Only include dates within our 7-day window
      if (dailyMap.hasOwnProperty(dateKey)) {
        dailyMap[dateKey] += item.requests_used;
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

  return {
    usageData,
    dailyUsage,
    weeklyUsage,
    monthlyUsage,
    userConsumption,
    modelUsage,
    loading,
    totalRequests,
    totalUsers,
    mostActiveUser,
  };
}
