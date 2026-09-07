
// app/api/cart/clear/route.js

import { clearCart } from "@/services/cart.service";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const sessionId =
      request.cookies.get("cart_session")?.value || null;

    const result = await clearCart(sessionId);

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "DELETE /api/cart/clear error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to clear cart",
      },
      { status: 500 }
    );
  }
}

