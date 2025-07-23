import { createClient } from "@/lib/supabase/server";

export async function updateUsage(
  userId: string,
  model: string,
  requests_used: number
) {
  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isoToday = today.toISOString();

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const isoTomorrow = tomorrow.toISOString();

  // Get existing usage record
  const { data, error } = await supabase
    .from("usage")
    .select("*")
    .eq("user_id", userId)
    .eq("model_name", model)
    .gte("created_at", isoToday)
    .lt("created_at", isoTomorrow)
    .maybeSingle();

  if (error) {
    throw error;
  }

  // Update usage record
  if (data) {
    const { error: updateError } = await supabase
      .from("usage")
      .update({ requests_used: data.requests_used + requests_used })
      .eq("id", data.id);
    if (updateError) {
      throw updateError;
    }
  } else {
    // Create new usage record
    const { error: createError } = await supabase.from("usage").insert({
      user_id: userId,
      model_name: model,
      requests_used,
    });
    if (createError) {
      throw createError;
    }
  }

  return;
}
