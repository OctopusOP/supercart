
import Link from "next/link";

import OrderItem from "./OrderItem";
import OrderStatus from "./OrderStatus";

const CANCELLABLE_STATUSES = [
  "pending",
  "confirmed",
];

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
}

function formatPaymentStatus(status) {
  if (!status) return "Unknown";

  return (
    String(status).charAt(0).toUpperCase() +
    String(status).slice(1)
  );
}

export default function OrderCard({
  order,
  onCancel,
  cancellingId,
}) {
  const orderId = order?.id;

  const items = Array.isArray(order?.order_items)
    ? order.order_items
    : [];

  const status = String(
    order?.status || ""
  ).toLowerCase();

  const canCancel =
    CANCELLABLE_STATUSES.includes(status);

  const isCancelling =
    cancellingId === orderId;

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">

      {/* Header */}
      <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">

              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Order{" "}
                {order?.order_number ||
                  `#${orderId}`}
              </h2>

              <OrderStatus status={status} />
            </div>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Placed on{" "}
              {formatDate(
                order?.created_at
              )}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total
            </p>

            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(order?.total)}
            </p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="px-5 py-5 sm:px-6">
        <div className="space-y-4">
          {items
            .slice(0, 3)
            .map((item) => (
              <OrderItem
                key={item.id}
                item={item}
              />
            ))}
        </div>

        {items.length > 3 && (
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            + {items.length - 3} more items
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-950/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">

        {/* Payment */}
        <div className="text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Payment:{" "}
          </span>

          <span className="font-semibold text-gray-900 dark:text-white">
            {formatPaymentStatus(
              order?.payment_status
            )}
          </span>

          {order?.payment_method && (
            <span className="ml-2 text-gray-500 dark:text-gray-400">
              ({order.payment_method})
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row">

          {canCancel && (
            <button
              type="button"
              disabled={isCancelling}
              onClick={() => onCancel(order)}
              className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              {isCancelling
                ? "Cancelling..."
                : "Cancel Order"}
            </button>
          )}

          <Link
            href={`/orders/${orderId}`}
            className="rounded-xl bg-black px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            View Order
          </Link>
        </div>
      </div>
    </article>
  );
}

