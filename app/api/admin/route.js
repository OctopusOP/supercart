
import { requireAdmin } from "@/lib/requireAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireAdmin();

  if (!auth.authorized) {
    return NextResponse.json(
      {
        success: false,
        error: auth.error,
      },
      { status: auth.status },
    );
  }

  return NextResponse.json({
    success: true,
    admin: auth.user,
  });
}

