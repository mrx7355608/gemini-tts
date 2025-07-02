"use server";

import { createClient } from "./supabase/server";

const supabase = await createClient();

export async function getHistory() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    console.error("No user found");
    return {
      error: "Unauthorized",
    };
  }

  const { data: history, error } = await supabase
    .from("history")
    .select()
    .eq("user_id", data.user.id);

  if (error) {
    console.error(error);
    return {
      error: error.message,
    };
  }

  return history;
}
