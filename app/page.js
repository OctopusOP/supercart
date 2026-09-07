"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";

import Spinner from "@/components/Spinner";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";

export default function Home() {
  const [addingToCart, setAddingToCart] = useState(null);
  const queryClient = useQueryClient();
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
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 3000,
    refetchOnWindowFocus: false,
  });

  // ============================================
  // ADD TO CART
  // ============================================

  const handleAddToCart = async (product) => {
    const variants = product?.product_variants || [];

    // Select the first variant that has stock
    const variant = variants.find((item) => Number(item.stock || 0) > 0);

    if (!variant) {
      toast.error("Product is out of stock");
      return;
    }

    try {
      setAddingToCart(product.id);

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variantId: variant.id,
          quantity: 1,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add product to cart");
      }

      toast.success("Added to cart", {
        description: product.name,
        duration: 2500,
      });
      await queryClient.invalidateQueries({
        queryKey: ["cart-count"],
      });
    } catch (error) {
      console.error("Add to cart error:", error);

      toast.error("Failed to add to cart", {
        description: error.message || "Something went wrong",
        duration: 3000,
      });
    } finally {
      setAddingToCart(null);
    }
  };

  // ============================================
  // LOADING
  // ============================================

  if (isLoading) {
    return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 bg-white dark:bg-zinc-950">
  <Spinner />

  <p className="text-sm text-zinc-500 dark:text-zinc-400">
    Loading products...
  </p>
</div>
    );
  }

  // ============================================
  // ERROR
  // ============================================

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-base font-medium text-red-500 dark:text-red-400">
          Failed to load products
        </p>

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {error.message}
        </p>
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl bg-white px-4 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-white sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Featured Products
        </h1>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Explore our latest collection of premium goods.
        </p>
      </div>

      {/* Empty */}
      {products.length === 0 ? (
        <div className="py-16 text-center text-zinc-500 dark:text-zinc-400">
          <p className="text-lg font-medium">No products found</p>

          <p className="mt-1 text-sm">Check back soon for new arrivals!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
          {products.map((product) => {
            const variants = product?.product_variants || [];

            // Lowest variant price
            const validPrices = variants
              .map((variant) => Number(variant.price))
              .filter((price) => Number.isFinite(price));

            const lowestPrice =
              validPrices.length > 0 ? Math.min(...validPrices) : null;

            // First available image
            let productImage = null;

            for (const variant of variants) {
              const image = variant?.variant_images
                ?.slice()
                ?.sort(
                  (a, b) =>
                    Number(a.display_order || 0) - Number(b.display_order || 0),
                )
                ?.find((image) => image?.image_url);

              if (image?.image_url) {
                productImage = image.image_url;
                break;
              }
            }

            productImage = productImage || FALLBACK_IMAGE;

            // At least one variant in stock
            const hasStock = variants.some(
              (variant) => Number(variant.stock || 0) > 0,
            );

            const isAdding = addingToCart === product.id;

            return (
              <article
                key={product.id}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Product link / image */}
                <Link href={`/products/${product.id}`} className="block">
                  <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <Image
                      src={productImage}
                      alt={product.name || "Product image"}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center transition duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>

                {/* Information */}
                <div className="flex flex-1 flex-col p-4">
                  {/* Brand */}
                  {product.brand && (
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {product.brand}
                    </p>
                  )}

                  {/* Name + Price */}
                  <div className="mt-1 flex items-start justify-between gap-3">
                    <Link href={`/products/${product.id}`} className="min-w-0">
                      <h2 className="line-clamp-1 text-base font-semibold text-zinc-900 hover:underline dark:text-white">
                        {product.name || "Product"}
                      </h2>
                    </Link>

                    {lowestPrice !== null && (
                      <span className="shrink-0 text-base font-bold text-zinc-900 dark:text-white">
                        ₹{lowestPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Starting price */}
                  {validPrices.length > 1 && (
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Starting from
                    </p>
                  )}

                  {/* Description */}
                  {product.description && (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                      {product.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-auto flex gap-2 pt-4">
                    {/* Add to Cart */}
                    <button
                      type="button"
                      disabled={!hasStock || isAdding}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        handleAddToCart(product);
                      }}
                      aria-label={
                        isAdding
                          ? `Adding ${product.name} to cart`
                          : `Add ${product.name} to cart`
                      }
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                    >
                      {isAdding ? (
                        <Loader2
                          size={19}
                          className="animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <ShoppingCart
                          size={19}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      )}
                    </button>

                    {/* Buy Now */}
                    <Link
                      href={`/products/${product.id}`}
                      className="flex h-11 flex-1 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                    >
                      {hasStock ? "Buy Now" : "View Product"}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
