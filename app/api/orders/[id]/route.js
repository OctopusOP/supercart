
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyJWT } from "@/utils/jwt";
import {
  getUserOrder,
  cancelUserOrder,
} from "@/services/orders.service";

function getValidId(value, name) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error(`Invalid ${name}`);
  }

  return id;
}

async function authenticateUser() {
  const cookieStore = await cookies();

  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      ),
    };
  }

  const payload = verifyJWT(token);

  if (!payload || !payload.id) {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Invalid or expired authentication token",
        },
        { status: 401 }
      ),
    };
  }

  const userId = Number(payload.id);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Invalid user ID",
        },
        { status: 401 }
      ),
    };
  }

  return {
    success: true,
    userId,
  };
}


/*
|--------------------------------------------------------------------------
| GET /api/orders/[id]
|--------------------------------------------------------------------------
*/
export async function GET(request, { params }) {
  try {
    /*
     * IMPORTANT:
     * In current Next.js versions, dynamic params are async.
     *
     * /api/orders/2
     *       ↓
     * id = "2"
     */
    const { id } = await params;

    console.log("GET /api/orders/[id] raw id:", id);

    const orderId = getValidId(id, "order ID");

    console.log(
      "GET /api/orders/[id] parsed orderId:",
      orderId
    );

    const auth = await authenticateUser();

    if (!auth.success) {
      return auth.response;
    }

    const result = await getUserOrder(
      auth.userId,
      orderId
    );

    if (!result || !result.data) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      result,
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET /api/orders/[id] error:",
      error
    );

    const message =
      error?.message || "Failed to fetch order";

    if (message === "Invalid order ID") {
      return NextResponse.json(
        {
          success: false,
          error: message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch order",
      },
      { status: 500 }
    );
  }
}


/*
|--------------------------------------------------------------------------
| PATCH /api/orders/[id]
|--------------------------------------------------------------------------
*/
export async function PATCH(request, { params }) {
  try {
    /*
     * IMPORTANT FIX:
     *
     * Do NOT use:
     *
     * const { id } = params;
     *
     * Use:
     *
     * const { id } = await params;
     */
    const { id } = await params;

    console.log(
      "PATCH /api/orders/[id] raw id:",
      id
    );

    const orderId = getValidId(id, "order ID");

    console.log(
      "PATCH /api/orders/[id] parsed orderId:",
      orderId
    );

    const auth = await authenticateUser();

    if (!auth.success) {
      return auth.response;
    }

    let body = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const action = body?.action;

    console.log("PATCH order request:", {
      orderId,
      userId: auth.userId,
      action,
    });

    if (action !== "cancel") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action",
        },
        { status: 400 }
      );
    }

    /*
     * The service verifies that this order belongs
     * to the logged-in user and that its status can
     * be cancelled.
     */
    const result = await cancelUserOrder(
      auth.userId,
      orderId
    );

    return NextResponse.json(
      result,
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "PATCH /api/orders/[id] error:",
      error
    );

    const message =
      error?.message ||
      "Failed to cancel order";

    if (message === "Invalid order ID") {
      return NextResponse.json(
        {
          success: false,
          error: message,
        },
        { status: 400 }
      );
    }

    /*
     * Return the actual service error so you can
     * see why cancellation failed instead of getting
     * a generic error.
     */
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}

