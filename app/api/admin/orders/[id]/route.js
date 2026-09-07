import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/requireAdmin";
import {
  getAdminOrder,
  updateAdminOrder,
} from "@/services/orders.service";

/**
 * GET /api/admin/orders/[id]
 *
 * Get complete order details for admin.
 */
export async function GET(request, { params }) {
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
    // Order ID
    // -----------------------------
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID is required",
        },
        { status: 400 },
      );
    }

    // -----------------------------
    // Get order
    // -----------------------------
    const order = await getAdminOrder({
      orderId: id,
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: order,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "GET /api/admin/orders/[id] error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch order",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/admin/orders/[id]
 *
 * Update order information.
 *
 * Example:
 *
 * {
 *   "status": "shipped"
 * }
 *
 * or:
 *
 * {
 *   "paymentStatus": "paid"
 * }
 *
 * or:
 *
 * {
 *   "paymentMethod": "UPI"
 * }
 *
 * or multiple:
 *
 * {
 *   "status": "shipped",
 *   "paymentStatus": "paid",
 *   "paymentMethod": "UPI"
 * }
 */
export async function PATCH(request, { params }) {
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
    // Order ID
    // -----------------------------
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID is required",
        },
        { status: 400 },
      );
    }

    // -----------------------------
    // Request body
    // -----------------------------
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body",
        },
        { status: 400 },
      );
    }

    const {
      status,
      paymentStatus,
      paymentMethod,
      transactionId,
    } = body;

    // -----------------------------
    // Validate that something
    // was actually provided
    // -----------------------------
    if (
      status === undefined &&
      paymentStatus === undefined &&
      paymentMethod === undefined &&
      transactionId === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "No update fields provided",
        },
        { status: 400 },
      );
    }

    // -----------------------------
    // Update order
    // -----------------------------
    const order = await updateAdminOrder({
      orderId: id,
      status,
      paymentStatus,
      paymentMethod,
      transactionId,
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order updated successfully",
        data: order,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "PATCH /api/admin/orders/[id] error:",
      error,
    );

    const message =
      error?.message || "Failed to update order";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 },
    );
  }
}