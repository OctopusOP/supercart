
import { requireAdmin } from "@/lib/requireAdmin";
import supabase from "@/db/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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

    // Products
    const { count: productCount, error: productError } = await supabase
      .from("products")
      .select("*", {
        count: "exact",
        head: true,
      });

    if (productError) throw productError;

    // Variants
    const { count: variantCount, error: variantError } = await supabase
      .from("product_variants")
      .select("*", {
        count: "exact",
        head: true,
      });

    if (variantError) throw variantError;

    // Users
    const { count: userCount, error: userError } = await supabase
      .from("user")
      .select("*", {
        count: "exact",
        head: true,
      });

    if (userError) throw userError;

    // Cart entries
    const { count: cartItemCount, error: cartError } = await supabase
      .from("cart_items")
      .select("*", {
        count: "exact",
        head: true,
      });

    if (cartError) throw cartError;

    // Stock information
    const { data: variants, error: stockError } = await supabase
      .from("product_variants")
      .select("stock");

    if (stockError) throw stockError;

    const totalStock = (variants || []).reduce(
      (total, variant) => total + Number(variant.stock || 0),
      0,
    );

    const outOfStockVariants = (variants || []).filter(
      (variant) => Number(variant.stock || 0) <= 0,
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        products: productCount || 0,
        variants: variantCount || 0,
        users: userCount || 0,
        cartItems: cartItemCount || 0,
        totalStock,
        outOfStockVariants,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load dashboard",
      },
      { status: 500 },
    );
  }
}

