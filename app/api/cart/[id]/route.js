
// app/api/cart/[id]/route.js

import {
  updateCartItemQuantity,
  removeCartItem,
} from "@/services/cart.service";

import { NextResponse } from "next/server";

// ============================================
// UPDATE CART ITEM
// ============================================

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;

    const itemId = Number(id);

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid cart item ID",
        },
        { status: 400 }
      );
    }

    const sessionId =
      request.cookies.get("cart_session")?.value;

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Cart not found",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const quantity = Number(body.quantity);

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Quantity must be greater than 0",
        },
        { status: 400 }
      );
    }

    const result =
      await updateCartItemQuantity({
        sessionId,
        itemId,
        quantity,
      });

    if (!result.success) {
      return NextResponse.json(
        result,
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "PATCH /api/cart/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update cart item",
      },
      { status: 500 }
    );
  }
}

// ============================================
// REMOVE CART ITEM
// ============================================

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const itemId = Number(id);

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid cart item ID",
        },
        { status: 400 }
      );
    }

    const sessionId =
      request.cookies.get("cart_session")?.value;

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Cart not found",
        },
        { status: 404 }
      );
    }

    const result = await removeCartItem({
      sessionId,
      itemId,
    });

    if (!result.success) {
      return NextResponse.json(
        result,
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "DELETE /api/cart/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to remove cart item",
      },
      { status: 500 }
    );
  }
}
