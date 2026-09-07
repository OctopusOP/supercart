
"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import OrderCard from "@/components/OrderCard";
import LoadingCard from "@/components/LoadingCard";
import EmptyOrders from "@/components/EmptyOrders";
import OrderItem from "@/components/OrderItem";
import OrderStatus from "@/components/OrderStatus";

async function fetchOrders() {
  const response = await fetch("/api/orders", {
    credentials: "include",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error || "Failed to load orders"
    );
  }

  return result;
}

async function cancelOrder(orderId) {
  const numericOrderId = Number(orderId);

  if (
    !Number.isSafeInteger(numericOrderId) ||
    numericOrderId <= 0
  ) {
    throw new Error("Invalid order ID");
  }

  const response = await fetch(
    `/api/orders/${numericOrderId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        action: "cancel",
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error || "Failed to cancel order"
    );
  }

  return result;
}

export default function OrdersPage() {
  const queryClient = useQueryClient();

  const [cancellingId, setCancellingId] = useState(null);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const orders = Array.isArray(data?.data)
    ? data.data
    : [];

  async function handleCancel(order) {
    const orderId = Number(order?.id);

    if (
      !Number.isSafeInteger(orderId) ||
      orderId <= 0
    ) {
      console.error(
        "Invalid order object:",
        order
      );

      alert("Invalid order ID");
      return;
    }

    const orderName =
      order?.order_number ||
      `#${orderId}`;

    const confirmed = window.confirm(
      `Are you sure you want to cancel ${orderName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(orderId);

      await cancelOrder(orderId);

      /*
       * Refresh the order list after cancellation.
       */
      await queryClient.invalidateQueries({
        queryKey: ["orders"],
      });

      await queryClient.refetchQueries({
        queryKey: ["orders"],
      });
    } catch (error) {
      console.error(
        "Cancel order error:",
        error
      );

      alert(
        error?.message ||
          "Failed to cancel order"
      );
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Account
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              My Orders
            </h1>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Track and manage your orders.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-5">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
        )}

        {/* Error */}
        {!isLoading && isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v4m0 4h.01M10.29 3.86l-7.5 13A2 2 0 004.5 20h15a2 2 0 001.71-3.14l-7.5-13a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>

            <h2 className="mt-4 font-semibold text-red-700 dark:text-red-400">
              Failed to load orders
            </h2>

            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error?.message ||
                "Something went wrong."}
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-5 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading &&
          !isError &&
          orders.length === 0 && (
            <EmptyOrders />
          )}

        {/* Orders */}
        {!isLoading &&
          !isError &&
          orders.length > 0 && (
            <div className="space-y-5">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onCancel={handleCancel}
                  cancellingId={cancellingId}
                />
              ))}
            </div>
          )}
      </div>
    </main>
  );
}

