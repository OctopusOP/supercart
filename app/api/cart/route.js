
// app/api/cart/route.js

import {
  getCart,
  addCartItem,
} from "@/services/cart.service";

import { NextResponse } from "next/server";

// ============================================
// SESSION
// ============================================

function getSessionId(request) {
  return request.cookies.get("cart_session")?.value || null;
}

// ============================================
// GET CART
// ============================================

export async function GET(request) {
  try {
    const sessionId = getSessionId(request);

    const cart = await getCart(sessionId);

    return NextResponse.json({
      success: true,
      data: cart.items,
      totalItems: cart.totalItems,
      subtotal: cart.subtotal,
    });
  } catch (error) {
    console.error("GET /api/cart error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cart",
      },
      { status: 500 }
    );
  }
}

// ============================================
// ADD TO CART
// ============================================

export async function POST(request) {
  try {
    const body = await request.json();

    const variantId = Number(body.variantId);
    const quantity = Number(body.quantity || 1);

    if (
      !Number.isInteger(variantId) ||
      variantId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid variantId is required",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Quantity must be a positive integer",
        },
        { status: 400 }
      );
    }

    let sessionId = getSessionId(request);

    const isNewSession = !sessionId;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    const result = await addCartItem({
      sessionId,
      variantId,
      quantity,
    });

    if (!result.success) {
      return NextResponse.json(
        result,
        { status: 400 }
      );
    }

    const response = NextResponse.json(
      result,
      { status: 201 }
    );

    if (isNewSession) {
      response.cookies.set(
        "cart_session",
        sessionId,
        {
          httpOnly: true,
          sameSite: "lax",
          secure:
            process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 30,
          path: "/",
        }
      );
    }

    return response;
  } catch (error) {
    console.error("POST /api/cart error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to add product to cart",
      },
      { status: 500 }
    );
  }
}

