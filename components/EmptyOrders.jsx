
import Link from "next/link";

export default function EmptyOrders() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center dark:border-gray-800 dark:bg-gray-900">
      {/* Icon */}
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <svg
          className="h-9 w-9 text-gray-500 dark:text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 7h18M5 7l1 13h12l1-13M9 11v5M15 11v5M8 7l1-4h6l1 4"
          />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        No orders yet
      </h2>

      {/* Description */}
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
        You haven&apos;t placed any orders yet.
      </p>

      {/* Button */}
      <Link
        href="/products"
        className="mt-6 inline-flex rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
      >
        Start Shopping
      </Link>
    </div>
  );
}

