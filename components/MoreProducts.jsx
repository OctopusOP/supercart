
// components/MoreProducts.jsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import Spinner from "@/components/Spinner";

export function MoreProducts({ currentProductId }) {
  const fetchProducts = async () => {
    const res = await fetch("/api/products");

    if (!res.ok) {
      throw new Error("Failed to load products");
    }

    const result = await res.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to load products");
    }

    return result.data || [];
  };

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 3000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <section className="mt-16">
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </section>
    );
  }

  if (isError) {
    return null;
  }

  // Remove the product currently being viewed
  const otherProducts = products.filter(
    (product) => String(product.id) !== String(currentProductId)
  );

  // Show maximum 4 products
  const moreProducts = otherProducts.slice(0, 4);

  // Don't show the section if there are no other products
  if (moreProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-zinc-200 pt-10 dark:border-zinc-800">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          You Might Also Like
        </h2>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Explore more products from our collection.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {moreProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}

export default MoreProducts;

