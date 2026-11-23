import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(
    {
      authenticated: true,
      role: auth.session.role,
      expiresAt: auth.session.expiresAt,
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
