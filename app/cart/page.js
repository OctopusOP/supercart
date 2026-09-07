"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  CreditCard,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import Spinner from "@/components/Spinner";
import LoadingCard from "@/components/LoadingCard";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";

// ============================================
// FETCH CART
// ============================================

async function fetchCart() {
  const res = await fetch("/api/cart", {
    method: "GET",
    cache: "no-store",
  });

  const result = await res.json();

  if (!res.ok || !result.success) {
    throw new Error(result.error || "Failed to load cart");
  }

  return result;
}

// ============================================
// CART PAGE
// ============================================

export default function CartPage() {
  const queryClient = useQueryClient();

  // ============================================
  // GET CART
  // ============================================

  const {
    data: cart,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
  });

  // ============================================
  // UPDATE QUANTITY
  // ============================================

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }) => {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to update cart");
      }

      return result;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },

    onError: (error) => {
      toast.error("Couldn't update cart", {
        description: error.message || "Something went wrong",
        duration: 3000,
      });
    },
  });

  // ============================================
  // REMOVE ITEM
  // ============================================

  const removeItemMutation = useMutation({
    mutationFn: async (itemId) => {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to remove item");
      }

      return result;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });

      toast.success("Removed from cart", {
        duration: 2000,
      });
    },

    onError: (error) => {
      toast.error("Couldn't remove item", {
        description: error.message || "Something went wrong",
        duration: 3000,
      });
    },
  });

  // ============================================
  // LOADING
  // ============================================

  if (isLoading) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white transition-colors dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 animate-bounce rounded-full bg-green-500 [animation-delay:-0.3s]" />
        <span className="h-3 w-3 animate-bounce rounded-full bg-green-500 [animation-delay:-0.15s]" />
        <span className="h-3 w-3 animate-bounce rounded-full bg-green-500" />
      </div>
    </div>
  );
    
  }

  // ============================================
  // ERROR
  // ============================================

  if (isError) {
    return (
      <main className="min-h-screen bg-white px-4 py-12 dark:bg-zinc-950">
        <div className="mx-auto max-w-3xl text-center">
          <ShoppingCart size={48} className="mx-auto mb-4 text-zinc-400" />

          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Unable to load cart
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {error?.message || "Something went wrong."}
          </p>

          <button
            type="button"
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["cart"],
              })
            }
            className="mt-6 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const items = cart?.data || [];
  const subtotal = Number(cart?.subtotal || 0);
  const totalItems = Number(cart?.totalItems || 0);

  // ============================================
  // EMPTY CART
  // ============================================

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-950">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
            <ShoppingCart
              size={36}
              className="text-zinc-500 dark:text-zinc-400"
            />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-zinc-900 dark:text-white">
            Your cart is empty
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Looks like you haven't added anything to your cart yet.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <ArrowLeft size={17} />
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  // ============================================
  // CART
  // ============================================

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>

          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Shopping Cart
              </h1>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
              </p>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item) => {
              const variant = item.product_variants;
              const product = variant?.products;

              const images = variant?.variant_images || [];

              const sortedImages = [...images].sort(
                (a, b) =>
                  Number(a.display_order || 0) - Number(b.display_order || 0),
              );

              const image = sortedImages[0]?.image_url || FALLBACK_IMAGE;

              const price = Number(variant?.price || 0);

              const quantity = Number(item.quantity || 1);

              const stock = Number(variant?.stock || 0);

              const itemTotal = price * quantity;

              const isUpdating =
                updateQuantityMutation.isPending &&
                updateQuantityMutation.variables?.itemId === item.id;

              const isRemoving =
                removeItemMutation.isPending &&
                removeItemMutation.variables === item.id;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border border-zinc-200 bg-white p-4 transition dark:border-zinc-800 dark:bg-zinc-900 ${
                    isRemoving ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <Link
                      href={`/products/${product?.id}`}
                      className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 sm:h-36 sm:w-36"
                    >
                      <Image
                        src={image}
                        alt={product?.name || "Product"}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="144px"
                      />
                    </Link>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-4">
                        <div className="min-w-0">
                          <Link
                            href={`/products/${product?.id}`}
                            className="line-clamp-2 text-base font-semibold text-zinc-900 hover:underline dark:text-white"
                          >
                            {product?.name || "Product"}
                          </Link>

                          {product?.brand && (
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                              {product.brand}
                            </p>
                          )}
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeItemMutation.mutate(item.id)}
                          disabled={removeItemMutation.isPending}
                          className="shrink-0 rounded-lg p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                          aria-label="Remove item"
                        >
                          {isRemoving ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>

                      {/* Variant */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {variant?.color && (
                          <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            Color: {variant.color}
                          </span>
                        )}

                        {variant?.size && (
                          <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            Size: {variant.size}
                          </span>
                        )}

                        {variant?.sku && (
                          <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            SKU: {variant.sku}
                          </span>
                        )}
                      </div>

                      {/* Bottom */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        {/* Quantity */}
                        <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700">
                          {/* Minus */}
                          <button
                            type="button"
                            disabled={quantity <= 1 || isUpdating || isRemoving}
                            onClick={() =>
                              updateQuantityMutation.mutate({
                                itemId: item.id,
                                quantity: quantity - 1,
                              })
                            }
                            className="flex h-9 w-9 items-center justify-center text-zinc-600 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={15} />
                          </button>

                          {/* Quantity / Spinner */}
                          <span className="flex h-9 min-w-10 items-center justify-center border-x border-zinc-200 px-3 text-sm font-semibold text-zinc-900 dark:border-zinc-700 dark:text-white">
                            {isUpdating ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                                aria-label="Updating quantity"
                              />
                            ) : (
                              quantity
                            )}
                          </span>

                          {/* Plus */}
                          <button
                            type="button"
                            disabled={
                              quantity >= stock || isUpdating || isRemoving
                            }
                            onClick={() =>
                              updateQuantityMutation.mutate({
                                itemId: item.id,
                                quantity: quantity + 1,
                              })
                            }
                            className="flex h-9 w-9 items-center justify-center text-zinc-600 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            aria-label="Increase quantity"
                          >
                            <Plus size={15} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            ₹{price.toLocaleString("en-IN")} × {quantity}
                          </p>

                          <p className="mt-0.5 text-lg font-bold text-zinc-900 dark:text-white">
                            ₹{itemTotal.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      {/* Stock warning */}
                      {stock > 0 && quantity >= stock && (
                        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                          Maximum available quantity reached.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Order Summary
              </h2>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Items
                  </span>

                  <span className="font-medium text-zinc-900 dark:text-white">
                    {totalItems}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Subtotal
                  </span>

                  <span className="font-medium text-zinc-900 dark:text-white">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Shipping
                  </span>

                  <span className="font-medium text-green-600 dark:text-green-400">
                    FREE
                  </span>
                </div>
              </div>

              <div className="my-6 border-t border-zinc-200 dark:border-zinc-800" />

              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-zinc-900 dark:text-white">
                  Total
                </span>

                <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <button
                type="button"
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                <CreditCard size={18} />
                Proceed to Checkout
              </button>

              <Link
                href="/"
                className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Continue Shopping
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
