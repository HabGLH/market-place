import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getMyOrders, cancelOrder } from "../../api/orderApi";
import useFeedback from "../../hooks/useFeedback";
import { formatDate, formatPrice } from "../../utils/formatters";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
  processing: "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-300 dark:ring-indigo-400/20",
  shipped: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/20",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  cancelled: "bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-500/30",
  failed: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/20",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
      statusStyles[status?.toLowerCase()] ||
      "bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-500/30"
    }`}
  >
    {status}
  </span>
);

const ProductImage = ({ product }) => {
  const imageUrl = Array.isArray(product.images)
    ? product.images.find((image) => typeof image === "string" && image.trim())
    : typeof product.image === "string"
      ? product.image
      : "";
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 sm:h-20 sm:w-20">
      {imageUrl && !imageFailed ? (
        <img
          src={imageUrl}
          alt={product.name || "Product"}
          onError={() => setImageFailed(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-500"
          aria-label="Product image unavailable"
        >
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 16.5v-9zM8 10h.01M3.5 16l5-5 3 3 2-2 7 7"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

const OrdersPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { notify, confirm } = useFeedback();
  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: () => getMyOrders(),
  });

  const orders = Array.isArray(ordersQuery.data)
    ? [...ordersQuery.data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      )
    : [];

  const cancelMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      notify("Order cancelled");
    },
    onError: (error) =>
      notify(
        error.response?.data?.message || "Failed to cancel order",
        "error",
      ),
  });

  const handleCancelOrder = async (orderId) => {
    const accepted = await confirm({
      title: "Cancel this order?",
      message: "The order will be cancelled and its reserved stock returned.",
      confirmLabel: "Cancel order",
    });
    if (accepted) cancelMutation.mutate(orderId);
  };

  if (ordersQuery.isPending) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 dark:bg-slate-950 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 animate-pulse">
            <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-3 h-4 w-64 max-w-full rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="space-y-5">
            {[0, 1, 2].map((key) => (
              <div
                key={key}
                className="h-48 animate-pulse rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (ordersQuery.isError) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 dark:bg-slate-950 sm:px-6">
        <div className="soft-card mx-auto max-w-xl p-8 text-center sm:p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-300">
            !
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            We couldn&apos;t load your orders
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Please check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => ordersQuery.refetch()}
            className="btn-primary mt-6 w-full sm:w-auto"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 dark:bg-slate-950 sm:px-6">
        <div className="soft-card mx-auto max-w-xl p-8 text-center sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
            <svg
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.7}
                d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
              />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
            No orders yet
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">
            Your order history will appear here after you place an order.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="btn-primary mt-6 w-full sm:w-auto"
          >
            Start shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
            Account
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            My orders
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 sm:text-base">
            Review items, totals, and the latest status for your orders.
          </p>
        </header>

        <div className="space-y-5">
          {orders.map((order) => {
            const orderStatus = order.orderStatus || "Pending";
            const isCancelling =
              cancelMutation.isPending &&
              cancelMutation.variables === order._id;
            const productItems = Array.isArray(order.products)
              ? order.products
              : Array.isArray(order.items)
                ? order.items
                : [];
            const totalAmount = order.totalAmount ?? order.totalPrice ?? 0;
            const canCancel =
              order.paymentMethod === "cod" &&
              order.paymentStatus === "Pending" &&
              orderStatus === "Processing";

            return (
              <article
                key={order._id}
                className="soft-card overflow-hidden"
              >
                <header className="border-b border-slate-200 bg-slate-50/70 px-4 py-5 dark:border-slate-800 dark:bg-slate-900/60 sm:px-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="break-all font-mono text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                          Order #{order._id || "—"}
                        </h2>
                        <StatusBadge status={orderStatus} />
                      </div>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Placed{" "}
                        {order.createdAt
                          ? formatDate(order.createdAt)
                          : "date unavailable"}
                      </p>
                    </div>
                    <div className="shrink-0 sm:text-right">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Order total
                      </p>
                      <p className="mt-1 text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        {formatPrice(totalAmount)}
                      </p>
                    </div>
                  </div>
                </header>

                <div className="p-4 sm:p-6">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Items <span className="text-slate-500">({productItems.length})</span>
                  </h3>

                  {productItems.length > 0 ? (
                    <ul className="mt-3 divide-y divide-slate-200 rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                      {productItems.map((item, index) => {
                        const productRef = item.product || item.productId || {};
                        const product =
                          typeof productRef === "object" ? productRef : {};
                        const unitPrice = item.price ?? item.unitPrice ?? 0;
                        const itemQuantity = item.quantity ?? 1;
                        const lineTotal =
                          item.totalPrice ?? unitPrice * itemQuantity;

                        return (
                          <li
                            key={product._id || item._id || index}
                            className="flex min-w-0 items-center gap-3 p-3 sm:gap-4 sm:p-4"
                          >
                            <ProductImage product={product} />
                            <div className="min-w-0 flex-1">
                              <p className="break-words text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
                                {product.name || "Product details unavailable"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                                Quantity: {itemQuantity}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
                                {formatPrice(lineTotal)}
                              </p>
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {formatPrice(unitPrice)} each
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                      No item details are available for this order.
                    </p>
                  )}

                  <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row sm:flex-wrap sm:items-center">
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={isCancelling}
                        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40 sm:w-auto"
                      >
                        {isCancelling ? "Cancelling…" : "Cancel order"}
                      </button>
                    )}

                    {(orderStatus === "Delivered" ||
                      orderStatus === "Cancelled") && (
                      <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="btn-primary w-full py-2.5 sm:w-auto"
                      >
                        Shop again
                      </button>
                    )}

                    {orderStatus === "Shipped" && (
                      <p className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">
                        Your order is on the way.
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="btn-secondary w-full py-3 sm:w-auto"
          >
            Continue shopping
          </button>
        </div>
      </div>
    </main>
  );
};

export default OrdersPage;
