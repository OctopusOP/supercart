
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyJWT } from "@/utils/jwt";
import { getUserOrders, createOrder } from "@/services/orders.service";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    const payload = verifyJWT(token);

    if (!payload || !payload.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired authentication token",
        },
        { status: 401 }
      );
    }

    // JWT contains the user ID.
    // Convert it explicitly to a number because users.id is BIGINT.
    const userId = Number(payload.id);

    if (!Number.isSafeInteger(userId)) {
      console.error("Invalid user ID from JWT:", payload.id);

      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const page = Math.max(
      1,
      Number(searchParams.get("page")) || 1
    );

    const limit = Math.min(
      50,
      Math.max(
        1,
        Number(searchParams.get("limit")) || 10
      )
    );

    const status = searchParams.get("status") || undefined;

    console.log("GET /api/orders:", {
      userId,
      page,
      limit,
      status,
    });

    const result = await getUserOrders({
      userId,
      page,
      limit,
      status,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("GET /api/orders error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
        details:
          process.env.NODE_ENV === "development"
            ? error?.message
            : undefined,
      },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    const payload = verifyJWT(token);

    if (!payload || !payload.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired authentication token",
        },
        { status: 401 }
      );
    }

    const userId = Number(payload.id);

    if (!Number.isSafeInteger(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      addressId,
      paymentMethod = "COD",
      shippingCost = 0,
    } = body;

    if (!addressId) {
      return NextResponse.json(
        {
          success: false,
          error: "Address is required",
        },
        { status: 400 }
      );
    }

    const addressIdNumber = Number(addressId);

    if (!Number.isSafeInteger(addressIdNumber)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid address ID",
        },
        { status: 400 }
      );
    }

    const result = await createOrder({
      userId,
      addressId: addressIdNumber,
      paymentMethod,
      shippingCost: Number(shippingCost) || 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);

    const message = error?.message || "Failed to create order";

    let status = 500;

    if (
      message.toLowerCase().includes("cart") ||
      message.toLowerCase().includes("address") ||
      message.toLowerCase().includes("payment")
    ) {
      status = 400;
    }

    if (message.toLowerCase().includes("stock")) {
      status = 409;
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status }
    );
  }
}

