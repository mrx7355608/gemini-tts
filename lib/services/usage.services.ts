import { createClient } from "@/lib/supabase/server";

export async function updateUsage(
  userId: string,
  model: string,
  requests_used: number
) {
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
