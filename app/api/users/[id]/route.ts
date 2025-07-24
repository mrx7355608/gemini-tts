import { NextRequest, NextResponse } from "next/server";
import UserAdminServices from "@/lib/services/user-admin.services";
import { logError } from "@/lib/errorLogger";

const userAdminServices = UserAdminServices();

const {
  updateUserEmail,
  updateUserFullName,
  updateUserRole,
  deleteUser,
  updateUserPassword,
} = userAdminServices;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { email, full_name, role, password } = await req.json();
  try {
    if (email) {
      console.log("Updating email");
      await updateUserEmail(id, email);
    }
    if (full_name) {
      console.log("Updating full name");
      await updateUserFullName(id, full_name);
    }
    if (role) {
      console.log("Updating role");
      await updateUserRole(id, role);
    }
    if (password) {
      console.log("Updating password");
      await updateUserPassword(id, password);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.log(error);
    await logError(error, "API Error - Update User");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
