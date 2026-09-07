"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ShoppingCart, Zap, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {useQueryClient} from "@tanstack/react-query";


const FALLBACK_IMAGE = "/no-image.jpg";

export default function ProductDetails({ product }) {
  const queryClient = useQueryClient();
  const variants = product?.product_variants || [];

  /*
   * ---------------------------------------------------------
   * AVAILABLE COLORS / SIZES
   * ---------------------------------------------------------
   */

  const colors = useMemo(() => {
    return [
      ...new Set(variants.map((variant) => variant?.color).filter(Boolean)),
    ];
  }, [variants]);

  const sizes = useMemo(() => {
    return [
      ...new Set(variants.map((variant) => variant?.size).filter(Boolean)),
    ];
  }, [variants]);

  /*
   * ---------------------------------------------------------
   * DEFAULT SELECTION
   * ---------------------------------------------------------
   *
   * Prefer the first variant that has stock.
   * Otherwise use the first variant.
   */

  const defaultVariant = useMemo(() => {
    return (
      variants.find((variant) => Number(variant?.stock || 0) > 0) ||
      variants[0] ||
      null
    );
  }, [variants]);

  const [selectedColor, setSelectedColor] = useState(
    defaultVariant?.color || "",
  );

  const [selectedSize, setSelectedSize] = useState(defaultVariant?.size || "");

  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  /*
   * ---------------------------------------------------------
   * CURRENT VARIANT
   * ---------------------------------------------------------
   *
   * Find the exact combination of:
   *
   * Color + Size
   *
   * For example:
   * Black + 9
   */

  const currentVariant = useMemo(() => {
    if (!variants.length) return null;

    // Products with both color and size
    if (selectedColor && selectedSize) {
      return (
        variants.find(
          (variant) =>
            String(variant?.color || "") === String(selectedColor) &&
            String(variant?.size || "") === String(selectedSize),
        ) || null
      );
    }

    // Color-only product
    if (selectedColor) {
      return (
        variants.find(
          (variant) => String(variant?.color || "") === String(selectedColor),
        ) || null
      );
    }

    // Size-only product
    if (selectedSize) {
      return (
        variants.find(
          (variant) => String(variant?.size || "") === String(selectedSize),
        ) || null
      );
    }

    return defaultVariant;
  }, [variants, selectedColor, selectedSize, defaultVariant]);

  /*
   * ---------------------------------------------------------
   * VARIANT IMAGES
   * ---------------------------------------------------------
   *
   * Only show images belonging to the selected variant.
   */

  const variantImages = useMemo(() => {
    return [...(currentVariant?.variant_images || [])]
      .filter((image) => image?.image_url)
      .sort(
        (a, b) => Number(a.display_order || 0) - Number(b.display_order || 0),
      );
  }, [currentVariant]);

  /*
   * ---------------------------------------------------------
   * FALLBACK IMAGE
   * ---------------------------------------------------------
   */

  const fallbackVariantImage = useMemo(() => {
    for (const variant of variants) {
      const images = [...(variant?.variant_images || [])]
        .filter((image) => image?.image_url)
        .sort(
          (a, b) => Number(a.display_order || 0) - Number(b.display_order || 0),
        );

      if (images.length > 0) {
        return images[0].image_url;
      }
    }

    return null;
  }, [variants]);

  const images = variantImages;

  const mainImage =
    images[selectedImage]?.image_url ||
    images[0]?.image_url ||
    fallbackVariantImage ||
    FALLBACK_IMAGE;

  /*
   * ---------------------------------------------------------
   * PRICE / STOCK
   * ---------------------------------------------------------
   */

  const price = Number(currentVariant?.price || 0);
  const stock = Number(currentVariant?.stock || 0);

  /*
   * ---------------------------------------------------------
   * CHECK SIZE AVAILABILITY FOR SELECTED COLOR
   * ---------------------------------------------------------
   *
   * Example:
   *
   * Black:
   * 7 = available
   * 8 = available
   * 9 = out of stock
   *
   * Then Size 9 becomes disabled when Black is selected.
   */

  const isSizeAvailable = (size) => {
    if (!selectedColor) {
      return variants.some(
        (variant) =>
          String(variant?.size || "") === String(size) &&
          Number(variant?.stock || 0) > 0,
      );
    }

    return variants.some(
      (variant) =>
        String(variant?.color || "") === String(selectedColor) &&
        String(variant?.size || "") === String(size) &&
        Number(variant?.stock || 0) > 0,
    );
  };

  /*
   * ---------------------------------------------------------
   * CHECK COLOR AVAILABILITY FOR SELECTED SIZE
   * ---------------------------------------------------------
   */

  const isColorAvailable = (color) => {
    if (!selectedSize) {
      return variants.some(
        (variant) =>
          String(variant?.color || "") === String(color) &&
          Number(variant?.stock || 0) > 0,
      );
    }

    return variants.some(
      (variant) =>
        String(variant?.color || "") === String(color) &&
        String(variant?.size || "") === String(selectedSize) &&
        Number(variant?.stock || 0) > 0,
    );
  };

  /*
   * ---------------------------------------------------------
   * SELECT COLOR
   * ---------------------------------------------------------
   */

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setSelectedImage(0);

    /*
     * If current size doesn't exist for the new color,
     * automatically select the first available size.
     */

    const matchingVariant = variants.find(
      (variant) =>
        String(variant?.color || "") === String(color) &&
        String(variant?.size || "") === String(selectedSize) &&
        Number(variant?.stock || 0) > 0,
    );

    if (!matchingVariant && selectedSize) {
      const firstAvailableSize = sizes.find((size) =>
        variants.some(
          (variant) =>
            String(variant?.color || "") === String(color) &&
            String(variant?.size || "") === String(size) &&
            Number(variant?.stock || 0) > 0,
        ),
      );

      setSelectedSize(firstAvailableSize || "");
    }
  };

  /*
   * ---------------------------------------------------------
   * SELECT SIZE
   * ---------------------------------------------------------
   */

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setSelectedImage(0);
  };

  /*
   * ---------------------------------------------------------
   * ADD TO CART
   * ---------------------------------------------------------
   */

  const handleAddToCart = async () => {
    if (!currentVariant) {
      toast.error("Please select a valid variant");
      return;
    }

    if (stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    try {
      setAddingToCart(true);

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variantId: currentVariant.id,
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
      setAddingToCart(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * RETURN
   * ---------------------------------------------------------
   */

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* ================= BREADCRUMB ================= */}

      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex items-center gap-2 text-sm"
      >
        <Link
          href="/"
          className="text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          Home
        </Link>

        <span className="text-zinc-400">/</span>

        <Link
          href="/"
          className="text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          Products
        </Link>

        <span className="text-zinc-400">/</span>

        <span className="truncate font-medium text-zinc-900 dark:text-white">
          {product.name}
        </span>
      </nav>

      {/* ================= MAIN GRID ================= */}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        {/* ================= IMAGE ================= */}

        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-900">
            <Image
              src={mainImage}
              alt={product.name || "Product image"}
              fill
              priority
              unoptimized
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* THUMBNAILS */}

          {variantImages.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {variantImages.map((image, index) => (
                <button
                  type="button"
                  key={image.id || `${image.image_url}-${index}`}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square overflow-hidden rounded-xl border-2 transition ${
                    selectedImage === index
                      ? "border-zinc-900 dark:border-white"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <Image
                    src={image.image_url}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    unoptimized
                    sizes="100px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* NO IMAGE */}

          {variantImages.length === 0 && (
            <p className="mt-3 text-center text-xs text-zinc-500">
              No image available for this variant
            </p>
          )}
        </div>

        {/* ================= DETAILS ================= */}

        <div className="flex flex-col">
          {/* BRAND */}
          {product.brand && (
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              {product.brand}
            </p>
          )}

          {/* NAME */}
          <h1 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
            {product.name}
          </h1>

          {/* PRICE */}
          <div className="mt-5 flex items-center gap-3">
            <span className="text-3xl font-bold text-zinc-950 dark:text-white">
              ₹{price.toFixed(2)}
            </span>

            <span
              className={
                stock > 0
                  ? "text-sm font-medium text-green-600 dark:text-green-400"
                  : "text-sm font-medium text-red-500"
              }
            >
              {stock > 0 ? `${stock} in stock` : "Out of stock"}
            </span>
          </div>

          {/* ================= COLOR ================= */}

          {colors.length > 0 && (
            <div className="mt-8 border-t border-zinc-200 pt-7 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Colour
                </h2>

                {selectedColor && (
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {selectedColor}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {colors.map((color) => {
                  const selected = String(selectedColor) === String(color);

                  const available = isColorAvailable(color);

                  return (
                    <button
                      key={color}
                      type="button"
                      disabled={!available}
                      onClick={() => handleColorChange(color)}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        selected
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                          : available
                            ? "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-white"
                            : "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 line-through opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600"
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= SIZE ================= */}

          {sizes.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Size
                </h2>

                {selectedSize && (
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    Selected: {selectedSize}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const selected = String(selectedSize) === String(size);

                  const available = isSizeAvailable(size);

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={!available}
                      onClick={() => handleSizeChange(size)}
                      className={`min-w-14 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        selected
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                          : available
                            ? "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-white"
                            : "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 line-through opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= SELECTED VARIANT ================= */}

          {currentVariant && (
            <div className="mt-6 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                {currentVariant.color && (
                  <span>
                    Colour:{" "}
                    <strong className="text-zinc-900 dark:text-white">
                      {currentVariant.color}
                    </strong>
                  </span>
                )}

                {currentVariant.size && (
                  <span>
                    Size:{" "}
                    <strong className="text-zinc-900 dark:text-white">
                      {currentVariant.size}
                    </strong>
                  </span>
                )}

                {currentVariant.sku && (
                  <span>
                    SKU:{" "}
                    <strong className="text-zinc-900 dark:text-white">
                      {currentVariant.sku}
                    </strong>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ================= ACTIONS ================= */}

          <div className="mt-8 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!currentVariant || stock <= 0 || addingToCart}
              onClick={handleAddToCart}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-900 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-900"
            >
              {addingToCart ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ShoppingCart size={18} />
              )}

              {addingToCart ? "Adding..." : "Add to Cart"}
            </button>

            <button
              type="button"
              disabled={!currentVariant || stock <= 0}
              onClick={() => {
                if (!currentVariant || stock <= 0) return;

                console.log("Buy now:", {
                  productId: product.id,
                  variantId: currentVariant.id,
                  quantity: 1,
                });
              }}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              <Zap size={18} />
              Buy Now
            </button>
          </div>

          {/* ================= DESCRIPTION — BOTTOM ================= */}

          {product.description && (
            <div className="mt-10 border-t border-zinc-200 pt-8 dark:border-zinc-800">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                Description
              </h2>

              <p className="mt-4 leading-7 text-zinc-600 dark:text-zinc-400">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
