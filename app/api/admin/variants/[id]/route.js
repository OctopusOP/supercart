
import { requireAdmin } from "@/lib/requireAdmin";
import supabase from "@/db/supabase";
import { NextResponse } from "next/server";

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
    const variantId = Number(id);

    if (!Number.isInteger(variantId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid variant ID",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const updateData = {};

    if (body.color !== undefined) {
      updateData.color = body.color;
    }

    if (body.size !== undefined) {
      updateData.size = body.size;
    }

    if (body.price !== undefined) {
      const price = Number(body.price);

      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid price",
          },
          { status: 400 },
        );
      }

      updateData.price = price;
    }

    if (body.stock !== undefined) {
      const stock = Number(body.stock);

      if (!Number.isInteger(stock) || stock < 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Stock must be a non-negative integer",
          },
          { status: 400 },
        );
      }

      updateData.stock = stock;
    }

    if (body.sku !== undefined) {
      updateData.sku = body.sku;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No variant fields to update",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("product_variants")
      .update(updateData)
      .eq("id", variantId)
      .select(`
        id,
        product_id,
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
      `)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "Variant not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Variant updated successfully",
      data,
    });
  } catch (error) {
    console.error("PUT admin variant error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update variant",
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
    const variantId = Number(id);

    if (!Number.isInteger(variantId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid variant ID",
        },
        { status: 400 },
      );
    }

    // Remove variant images
    const { error: imageError } = await supabase
      .from("variant_images")
      .delete()
      .eq("variant_id", variantId);

    if (imageError) throw imageError;

    // Remove variant
    const { data, error } = await supabase
      .from("product_variants")
      .delete()
      .eq("id", variantId)
      .select("id")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "Variant not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Variant deleted successfully",
    });
  } catch (error) {
    console.error("DELETE admin variant error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete variant",
      },
      { status: 500 },
    );
  }
}

