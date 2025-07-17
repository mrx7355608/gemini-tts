import { createClient } from "@supabase/supabase-js";
import { errorLogger } from "../errorLogger";

export default function UserAdminServices() {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  async function createUser(
    full_name: string,
    email: string,
    password: string,
    role: string
  ) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        role,
        full_name,
      },
    });

    if (error) throw error;

    const { user } = data;
    const { error: error2 } = await supabase
      .from("user_profile")
      .insert({ id: user.id, email: user.email, full_name, role });

    if (error2) throw error2;

    return { success: true };
  }

  async function updateUserEmail(id: string, email: string) {
    const { error } = await supabase.auth.admin.updateUserById(id, { email });

    if (error) throw error;

    const { error: error2 } = await supabase
      .from("user_profile")
      .update({ email })
      .eq("id", id);

    if (error2) throw error2;

    return { success: true };
  }

  // Update user password using Supabase Auth Admin API
  async function updateUserPassword(id: string, password: string) {
    const { error } = await supabase.auth.admin.updateUserById(id, {
      password,
    });

    if (error) throw error;

    return { success: true };
  }

  // Update user full name (custom field in user_profile table)
  async function updateUserFullName(id: string, full_name: string) {
    const { error } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: { full_name },
    });

    if (error) throw error;

    const { error: error2 } = await supabase
      .from("user_profile")
      .update({ full_name })
      .eq("id", id);

    if (error2) throw error2;

    return { success: true };
  }

  // Update user role using Supabase Auth Admin API
  async function updateUserRole(id: string, role: string) {
    const { error } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: { role },
    });
    if (error) {
      return { error: error.message };
    }

    // Update user role in user_profile table
    const { error: error2 } = await supabase
      .from("user_profile")
      .update({ role })
      .eq("id", id);
    if (error2) throw error2;

    return { success: true };
  }

  // Delete user by id
  async function deleteUser(id: string) {
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;

    const { error: error2 } = await supabase
      .from("user_profile")
      .delete()
      .eq("id", id);

    if (error2) throw error2;

    return { success: true };
  }

  // Ban user by setting ban_duration to 1 year
  async function banUser(id: string) {
    const { error } = await supabase.auth.admin.updateUserById(id, {
      ban_duration: "8760h",
    });

    if (error) throw error;

    return { success: true };
  }

  // Unban user by setting ban_duration to none
  async function unbanUser(id: string) {
    const { error } = await supabase.auth.admin.updateUserById(id, {
      ban_duration: "none",
    });

    if (error) throw error;

    return { success: true };
  }

  // Get all users
  async function getBannedUsersIDs() {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;

    const bannedUsers = data.users
      .filter((user) => (user as any).banned_until !== undefined)
      .map((user) => user.id);

    return bannedUsers;
  }

  // #######################################
  //         Error Logging Functions
  // #######################################
  const createUserWithErrorLogging = async (
    full_name: string,
    email: string,
    password: string,
    role: string
  ) => {
    return await errorLogger({
      raisedBy: "Supabase - Create User",
      executionFunc: createUser,
      args: [full_name, email, password, role],
    });
  };

  const updateUserEmailWithErrorLogging = async (id: string, email: string) => {
    return await errorLogger({
      raisedBy: "Supabase - Update User Email",
      executionFunc: updateUserEmail,
      args: [id, email],
    });
  };

  const updateUserFullNameWithErrorLogging = async (
    id: string,
    full_name: string
  ) => {
    return await errorLogger({
      raisedBy: "Supabase - Update Full Name",
      executionFunc: updateUserFullName,
      args: [id, full_name],
    });
  };

  const updateUserRoleWithErrorLogging = async (id: string, role: string) => {
    return await errorLogger({
      raisedBy: "Supabase - Update Role",
      executionFunc: updateUserRole,
      args: [id, role],
    });
  };

  const deleteUserWithErrorLogging = async (id: string) => {
    return await errorLogger({
      raisedBy: "Supabase - Delete User",
      executionFunc: deleteUser,
      args: [id],
    });
  };

  const banUserWithErrorLogging = async (id: string) => {
    return await errorLogger({
      raisedBy: "Supabase - Ban User",
      executionFunc: banUser,
      args: [id],
    });
  };

  const unbanUserWithErrorLogging = async (id: string) => {
    return await errorLogger({
      raisedBy: "Supabase - Unban User",
      executionFunc: unbanUser,
      args: [id],
    });
  };

  const getBannedUsersIDsWithErrorLogging = async () => {
    return await errorLogger({
      raisedBy: "Supabase - Get Banned Users IDs",
      executionFunc: getBannedUsersIDs,
      args: [],
    });
  };

  const updateUserPasswordWithErrorLogging = async (
    id: string,
    password: string
  ) => {
    return await errorLogger({
      raisedBy: "Supabase - Update Password",
      executionFunc: updateUserPassword,
      args: [id, password],
    });
  };

  return {
    createUser: createUserWithErrorLogging,
    updateUserEmail: updateUserEmailWithErrorLogging,
    updateUserFullName: updateUserFullNameWithErrorLogging,
    updateUserRole: updateUserRoleWithErrorLogging,
    deleteUser: deleteUserWithErrorLogging,
    banUser: banUserWithErrorLogging,
    unbanUser: unbanUserWithErrorLogging,
    updateUserPassword: updateUserPasswordWithErrorLogging,
    getBannedUsersIDs: getBannedUsersIDsWithErrorLogging,
  };
}
