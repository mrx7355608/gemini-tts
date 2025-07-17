import { NextRequest, NextResponse } from "next/server";
import UserAdminServices from "@/lib/services/user-admin.services";

const userAdminServices = UserAdminServices();

const { createUser, getBannedUsersIDs } = userAdminServices;

export async function POST(req: NextRequest) {
  const { full_name, email, password, role } = await req.json();
  try {
    await createUser(full_name, email, password, role);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const data = await getBannedUsersIDs();
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
