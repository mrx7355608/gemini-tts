import { NextRequest, NextResponse } from "next/server";
import UserAdminServices from "@/lib/services/user-admin.services";
import { logError } from "@/lib/errorLogger";

const userAdminServices = UserAdminServices();

const { createUser, getBannedUsersIDs } = userAdminServices;

export async function POST(req: NextRequest) {
  const { full_name, email, password, role } = await req.json();
  try {
    await createUser(full_name, email, password, role);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    await logError(error, "API Route - Create User");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const data = await getBannedUsersIDs();
    return NextResponse.json({ data });
  } catch (error: any) {
    await logError(error, "API Route - Get Banned Users IDs");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
