import { createClient } from "./supabase/client";

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

export async function logError(error: any, raisedBy: string) {
  try {
    const supabase = createClient();
    const { error: err } = await supabase
      .from("error-logs")
      .insert({
        error_message: error.message,
        error_description: "No description provided",
        raised_by: raisedBy,
        user_id: "bca7e52f-5437-4e9e-83df-0a1729762c66",
      })
      .select();
    if (err) {
      console.error("Failed to log error: ", err.message);
    } else {
      console.log("Error logged successfully");
    }
  } catch (err: any) {
    console.error("Failed to log error: ", err.message);
  }
}
