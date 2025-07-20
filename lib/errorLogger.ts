"use server";

import { createClient } from "./supabase/server";

interface ErrorLoggerData<T> {
  raisedBy: string;
  executionFunc: (...args: any[]) => Promise<T>;
  args: any[];
}

export async function errorLogger<T>({
  raisedBy,
  executionFunc,
  args,
}: ErrorLoggerData<T>) {
  try {
    const response = await executionFunc(...args);
    return response;
  } catch (error: any) {
    console.error(error);
    await logError(error, raisedBy);
    throw error;
  }
}

export async function logError(error: any, raisedBy: string, user_id?: string) {
  try {
    const supabase = await createClient();

    // Get user id
    let userId = user_id;

    if (!user_id) {
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id;
    }

    // Log error
    const { error: err } = await supabase
      .from("error-logs")
      .insert({
        error_message: error.message,
        error_description: "No description provided",
        raised_by: raisedBy,
        user_id: userId,
      })
      .select();
    if (err) {
      console.error("Failed to log error: ", err.message);
    } else {
      console.log("Error logged successfully");
    }

    // Add to notification table
    const [source, operation] = raisedBy.split("-");
    const { error: err2 } = await supabase.from("notifications").insert({
      user_id: userId,
      message: `${source} error occurred while doing ${operation} operation.`,
      has_read: false,
    });
    if (err2) {
      console.error("Failed to log notification: ", err2.message);
    } else {
      console.log("Notification logged successfully");
    }
  } catch (err: any) {
    console.error("Failed to log error: ", err.message);
  }
}
