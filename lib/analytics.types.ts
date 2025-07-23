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

export type {
  UsageRecord,
  DailyUsage,
  WeeklyUsage,
  MonthlyUsage,
  UserConsumption,
  ModelUsage,
};
