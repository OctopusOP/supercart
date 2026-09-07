
function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function ImagePlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg
        className="h-7 w-7 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="m3 16 4-4a2 2 0 0 1 3 0l2 2m0 0 1-1a2 2 0 0 1 3 0l5 5"
        />
      </svg>
    </div>
  );
}

export default function OrderItem({
  item,
}) {
  const price =
    Number(item?.price || 0);

  const quantity =
    Number(item?.quantity || 0);

  const total =
    price * quantity;

  return (
    <div className="flex gap-4">

      {/* Image */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
        {item?.image_url ? (
          <img
            src={item.image_url}
            alt={
              item?.product_name ||
              "Product"
            }
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">

        <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
          {item?.product_name ||
            "Product"}
        </h3>

        {item?.brand && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {item.brand}
          </p>
        )}

        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">

          {item?.color && (
            <span>
              Color: {item.color}
            </span>
          )}

          {item?.size && (
            <span>
              Size: {item.size}
            </span>
          )}

          <span>
            Qty: {quantity}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {formatPrice(total)}
        </p>
      </div>
    </div>
  );
}

