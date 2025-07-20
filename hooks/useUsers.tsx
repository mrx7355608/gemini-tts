import { UserData } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

const supabase = createClient();

export default function useUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [bannedUsersIDs, setBannedUsersIDs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchUsers(), fetchBannedUsers()]);
    };

    fetchData();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_profile")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBannedUsers = async () => {
    const response = await fetch("/api/users");
    const data = await response.json();
    setBannedUsersIDs(data.data);
  };

  const refreshUsers = async () => {
    await fetchUsers();
    await fetchBannedUsers();
  };

  return { users, bannedUsersIDs, loading, error, refreshUsers };
}
