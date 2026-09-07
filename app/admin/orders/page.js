
"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

const STATUS_STYLES = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  confirmed:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  processing:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  shipped:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  delivered:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  cancelled:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatStatus(status) {
  if (!status) return "Unknown";

  return status.charAt(0).toUpperCase() + status.slice(1);
}

async function fetchOrders({
  page,
  limit,
  status,
  paymentStatus,
  search,
}) {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("limit", limit);

  if (status) {
    params.set("status", status);
  }

  if (paymentStatus) {
    params.set("paymentStatus", paymentStatus);
  }

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const response = await fetch(
    `/api/admin/orders?${params.toString()}`,
    {
      credentials: "include",
      cache: "no-store",
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error ||
        "Failed to load admin orders",
    );
  }

  return result;
}

function StatusBadge({ status }) {
  const normalized = String(
    status || "",
  ).toLowerCase();

  const style =
    STATUS_STYLES[normalized] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {formatStatus(normalized)}
    </span>
  );
}

function LoadingRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((item) => (
        <tr
          key={item}
          className="animate-pulse border-b border-gray-100 dark:border-gray-800"
        >
          <td className="px-5 py-5">
            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" />
          </td>

          <td className="px-5 py-5">
            <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-800" />
          </td>

          <td className="px-5 py-5">
            <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-800" />
          </td>

          <td className="px-5 py-5">
            <div className="h-4 w-10 rounded bg-gray-200 dark:bg-gray-800" />
          </td>

          <td className="px-5 py-5">
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-800" />
          </td>

          <td className="px-5 py-5">
            <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-800" />
          </td>

          <td className="px-5 py-5">
            <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-800" />
          </td>

          <td className="px-5 py-5">
            <div className="ml-auto h-8 w-16 rounded bg-gray-200 dark:bg-gray-800" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [paymentStatus, setPaymentStatus] =
    useState("");

  const limit = 20;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "admin-orders",
      page,
      status,
      paymentStatus,
      search,
    ],
    queryFn: () =>
      fetchOrders({
        page,
        limit,
        status,
        paymentStatus,
        search,
      }),
    placeholderData: (previousData) =>
      previousData,
  });

  const orders = data?.data || [];

  const total =
    data?.total ??
    data?.count ??
    data?.pagination?.total ??
    0;

  const totalPages =
    data?.totalPages ??
    data?.pagination?.totalPages ??
    Math.max(Math.ceil(total / limit), 1);

  function handleSearch(event) {
    event.preventDefault();

    setPage(1);
    setSearch(searchInput);
  }

  function handleStatusChange(value) {
    setPage(1);
    setStatus(value);
  }

  function handlePaymentStatusChange(value) {
    setPage(1);
    setPaymentStatus(value);
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPaymentStatus("");
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Admin
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Orders
            </h1>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Manage customer orders, payments and delivery.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total Orders
            </p>

            <p className="mt-1 text-xl font-bold">
              {total}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 lg:flex-row">
            <form
              onSubmit={handleSearch}
              className="flex min-w-0 flex-1 gap-2"
            >
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path
                    strokeLinecap="round"
                    d="m20 20-4-4"
                  />
                </svg>

                <input
                  value={searchInput}
                  onChange={(e) =>
                    setSearchInput(e.target.value)
                  }
                  placeholder="Search order number..."
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-black dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:border-white"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-black"
              >
                Search
              </button>
            </form>

            <select
              value={status}
              onChange={(e) =>
                handleStatusChange(e.target.value)
              }
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            >
              <option value="">All Status</option>

              {ORDER_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {formatStatus(item)}
                </option>
              ))}
            </select>

            <select
              value={paymentStatus}
              onChange={(e) =>
                handlePaymentStatusChange(
                  e.target.value,
                )
              }
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            >
              <option value="">
                All Payments
              </option>

              {PAYMENT_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {formatStatus(item)}
                </option>
              ))}
            </select>

            {(search ||
              status ||
              paymentStatus) && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {isError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
            <p className="font-semibold text-red-700 dark:text-red-400">
              Failed to load orders
            </p>

            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {error?.message}
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Orders table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left dark:border-gray-800 dark:bg-gray-950/60">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Order
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Date
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Items
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Total
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Payment
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <LoadingRows />
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="px-6 py-16 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                          <svg
                            className="h-8 w-8 text-gray-400"
                            viewBox="0 0 24 24"
                            fill="none"
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

                        <h3 className="text-lg font-semibold">
                          No orders found
                        </h3>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Try changing your filters or search.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const items =
                      order.order_items || [];

                    const customer =
                      order.users ||
                      order.user ||
                      {};

                    const customerName =
                      customer.username ||
                      customer.name ||
                      customer.email ||
                      "Customer";

                    const itemCount =
                      items.reduce(
                        (sum, item) =>
                          sum +
                          Number(
                            item.quantity || 0,
                          ),
                        0,
                      );

                    return (
                      <tr
                        key={order.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/40"
                      >
                        {/* Order */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <p className="text-sm font-semibold">
                            {order.order_number ||
                              `#${order.id}`}
                          </p>

                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            ID: {order.id}
                          </p>
                        </td>

                        {/* Customer */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium">
                            {customerName}
                          </p>

                          {customer.email && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {customer.email}
                            </p>
                          )}
                        </td>

                        {/* Date */}
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(
                            order.created_at,
                          )}
                        </td>

                        {/* Items */}
                        <td className="whitespace-nowrap px-5 py-4 text-sm">
                          {itemCount}
                        </td>

                        {/* Total */}
                        <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold">
                          {formatPrice(order.total)}
                        </td>

                        {/* Payment */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <p className="text-sm font-medium">
                            {formatStatus(
                              order.payment_status,
                            )}
                          </p>

                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {order.payment_method ||
                              "—"}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <StatusBadge
                            status={order.status}
                          />
                        </td>

                        {/* Action */}
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading &&
            orders.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Page{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {page}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {totalPages}
                  </span>
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(current - 1, 1),
                      )
                    }
                    className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((current) =>
                        Math.min(
                          current + 1,
                          totalPages,
                        ),
                      )
                    }
                    className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    </main>
  );
}

