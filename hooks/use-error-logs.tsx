import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface ErrorLog {
  id: string;
  error_message: string;
  error_description: string;
  raised_by: string;
  user_id: string;
  created_at: string;
  user_email?: string;
}

export default function useErrorLogs() {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredLogs, setFilteredLogs] = useState<ErrorLog[]>([]);

  const fetchErrorLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from("error-logs")
        .select(
          `
          *,
          user_profile!inner(email)
        `
        )
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transform the data to include user email at the top level
      const transformedData =
        data?.map((log) => ({
          ...log,
          user_email: log.user_profile?.email || "Unknown",
        })) || [];

      const filteredData = transformedData.filter(
        (log) => log.error_message !== null
      );

      setErrorLogs(filteredData || []);
      setFilteredLogs(filteredData || []);
    } catch (err: any) {
      console.error("Error fetching error logs:", err);
      setError(err.message || "Failed to fetch error logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrorLogs();
  }, []);

  return {
    errorLogs,
    loading,
    error,
    filteredLogs,
    setFilteredLogs,
    fetchErrorLogs,
  };
}
