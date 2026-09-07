
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

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("id", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
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

    const body = await request.json();

    const {
      name,
      brand = null,
      description = null,
      variants = [],
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Product name is required",
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(variants)) {
      return NextResponse.json(
        {
          success: false,
          error: "Variants must be an array",
        },
        { status: 400 },
      );
    }

    // Create product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name: name.trim(),
        brand,
        description,
      })
      .select("id, name, brand, description")
      .single();

    if (productError) throw productError;

    // Create variants
    let createdVariants = [];

    if (variants.length > 0) {
      const variantRows = variants.map((variant) => ({
        product_id: product.id,
        color: variant.color || null,
        size: variant.size || null,
        price: Number(variant.price || 0),
        stock: Number(variant.stock || 0),
        sku: variant.sku || null,
      }));

      const { data, error } = await supabase
        .from("product_variants")
        .insert(variantRows)
        .select(`
          id,
          product_id,
          color,
          size,
          price,
          stock,
          sku
        `);

      if (error) {
        // Roll back product if variants fail
        await supabase
          .from("products")
          .delete()
          .eq("id", product.id);

        throw error;
      }

      createdVariants = data || [];
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: {
          ...product,
          product_variants: createdVariants,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/admin/products error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create product",
      },
      { status: 500 },
    );
  }
}

