import { createClient } from "@/lib/supabase/server";

export async function updateUsage(userId: string, model: string) {
  const supabase = await createClient();

  // Get existing usage record
  const { data, error } = await supabase
    .from("usage")
    .select("*")
    .eq("user_id", userId)
    .eq("model_name", model)
    .maybeSingle();

  if (error) {
    throw error;
  }

  // Update usage record
  if (data) {
    const { error: updateError } = await supabase
      .from("usage")
      .update({ requests_used: data.requests_used + 1 })
      .eq("id", data.id);
    if (updateError) {
      throw updateError;
    }
  } else {
    // Create new usage record
    const { error: createError } = await supabase
      .from("usage")
      .insert({ user_id: userId, model_name: model, requests_used: 1 });
    if (createError) {
      throw createError;
    }
  }

  return;
}
