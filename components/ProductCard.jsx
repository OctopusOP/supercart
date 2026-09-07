
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export const ProductCard = ({ product }) => {
  const variants = product?.product_variants || [];

  const [selectedVariant, setSelectedVariant] = useState(
    variants[0] || null
  );

  const currentVariant = selectedVariant || variants[0];
  const images = currentVariant?.variant_images || [];
  const mainImage = images[0]?.image_url;

  return (
    <div className="group rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <Link href={`/products/${product.id}`} className="block">
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product?.name || "Product image"}
                fill
                unoptimized
                className="object-cover object-center group-hover:scale-105 transition duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            ) : (
              <div className="text-zinc-400 dark:text-zinc-500 text-sm">
                No Image Available
              </div>
            )}
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base line-clamp-1">
              {product?.name || "Product"}
            </h3>

            {currentVariant?.price != null && (
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base shrink-0">
                ₹{Number(currentVariant.price).toFixed(2)}
              </span>
            )}
          </div>

          {product?.brand && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {product.brand}
            </p>
          )}

          {product?.description && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-2">
              {product.description}
            </p>
          )}
        </div>
      </Link>

      {variants.length > 0 && (
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 font-medium">
            Variants
          </p>

          <div className="flex flex-wrap gap-1.5">
            {variants.map((variant) => {
              const isSelected = currentVariant?.id === variant.id;

              return (
                <button
                  type="button"
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-2.5 py-1 text-xs rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white font-medium"
                      : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  {variant.color ||
                    variant.size ||
                    `Option #${variant.id}`}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;

