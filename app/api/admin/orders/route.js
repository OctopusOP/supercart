import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/requireAdmin";
import {
  getAllOrders,
} from "@/services/orders.service";

/**
 * GET /api/admin/orders
 *
 * Admin order list.
 *
 * Query parameters:
 *
 * ?page=1
 * ?limit=20
 * ?status=pending
 * ?paymentStatus=paid
 * ?search=SC-20260907
 */
export async function GET(request) {
  try {
    // -----------------------------
    // Admin authentication
    // -----------------------------
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

    // -----------------------------
    // Query parameters
    // -----------------------------
    const { searchParams } = new URL(request.url);

    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1,
    );

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 20, 1),
      100,
    );

    const status =
      searchParams.get("status") || null;

    const paymentStatus =
      searchParams.get("paymentStatus") || null;

    const search =
      searchParams.get("search")?.trim() || null;

    // -----------------------------
    // Get orders
    // -----------------------------
    const result = await getAllOrders({
      page,
      limit,
      status,
      paymentStatus,
      search,
    });

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "GET /api/admin/orders error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch admin orders",
      },
      { status: 500 },
    );
  }
}