
// app/products/[id]/page.js

import { notFound } from "next/navigation";
import { getProductDetails } from "@/services/product.service";
import ProductDetails from "@/components/ProductDetails";
import MoreProducts from "@/components/MoreProducts";

export async function generateMetadata({ params }) {
  const { id } = await params;

  const product = await getProductDetails(id);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} | Store`,
    description:
      product.description ||
      `View ${product.name} product details.`,
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;

  const product = await getProductDetails(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">
      <ProductDetails product={product} />

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <MoreProducts currentProductId={product.id} />
      </div>
    </main>
  );
}

