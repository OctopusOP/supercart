import { requireAdmin } from "@/lib/requireAdmin";
import supabase from "@/db/supabase";
import { NextResponse } from "next/server";

const PRODUCT_SELECT = `
  id,
  name,
  brand,
  description,
  product_variants (
    id,
    color,
    size,
    price,
    stock,
    sku,
    variant_images (
      id,
      image_url,
      display_order
    )
  )
`;

export async function GET(request, { params }) {
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

    const { id } = await params;
    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid product ID",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", productId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET admin product error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
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

    const { id } = await params;
    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid product ID",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const updateData = {};

    if (body.name !== undefined) {
      if (!String(body.name).trim()) {
        return NextResponse.json(
          {
            success: false,
            error: "Product name cannot be empty",
          },
          { status: 400 },
        );
      }

      updateData.name = String(body.name).trim();
    }

    if (body.brand !== undefined) {
      updateData.brand = body.brand;
    }

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No product fields to update",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", productId)
      .select(PRODUCT_SELECT)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data,
    });
  } catch (error) {
    console.error("PUT admin product error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update product",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
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

    const { id } = await params;
    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid product ID",
        },
        { status: 400 },
      );
    }

    // Check product exists
    const { data: product, error: findError } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .maybeSingle();

    if (findError) throw findError;

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 },
      );
    }

    // Get variants
    const { data: variants, error: variantError } = await supabase
      .from("product_variants")
      .select("id")
      .eq("product_id", productId);

    if (variantError) throw variantError;

    const variantIds = (variants || []).map((variant) => variant.id);

    // Delete variant images first
    if (variantIds.length > 0) {
      const { error: imageError } = await supabase
        .from("variant_images")
        .delete()
        .in("variant_id", variantIds);

      if (imageError) throw imageError;

      // Delete variants
      const { error: deleteVariantError } = await supabase
        .from("product_variants")
        .delete()
        .eq("product_id", productId);

      if (deleteVariantError) throw deleteVariantError;
    }

    // Delete product
    const { error: deleteProductError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (deleteProductError) throw deleteProductError;

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE admin product error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete product",
      },
      { status: 500 },
    );
  }
}

