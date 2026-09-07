import { getAllProductDetails } from "@/services/product.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getAllProductDetails();

    return NextResponse.json(
      {
        success: true,
        data: data || [],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
