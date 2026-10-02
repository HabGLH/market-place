import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../api/cartApi";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../utils/formatters";
import useFeedback from "../../hooks/useFeedback";

const CartPage = () => {
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify, confirm } = useFeedback();
  const cartQuery = useQuery({ queryKey: ["cart"], queryFn: getCart });
  const cart = cartQuery.data ?? { items: [], totalPrice: 0 };
  const refreshCart = () =>
    queryClient.invalidateQueries({ queryKey: ["cart"] });

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingItems((prev) => new Set(prev).add(productId));
    try {
      await updateCartItem(productId, newQuantity);
      await refreshCart();
    } catch {
      notify("Failed to update quantity", "error");
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (productId) => {
    setUpdatingItems((prev) => new Set(prev).add(productId));
    try {
      await removeCartItem(productId);
      await refreshCart();
    } catch {
      notify("Failed to remove item", "error");
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleClearCart = async () => {
    const accepted = await confirm({
      title: "Empty your cart?",
      message: "All items will be removed from your cart.",
      confirmLabel: "Empty cart",
    });
    if (!accepted) return;

    try {
      await clearCart();
      queryClient.setQueryData(["cart"], { items: [], totalPrice: 0 });
    } catch {
      notify("Failed to clear cart", "error");
    }
  };

  const handleCheckout = () => navigate("/checkout");

  if (cartQuery.isPending) return <Loader />;
  if (cartQuery.isError) return <ErrorMessage message="Failed to load cart." />;

  const items = cart?.items || [];
  const subtotal = cart?.subtotal ?? cart?.totalPrice ?? 0;
  const shipping = cart?.shippingFee ?? 0;
  const vat = cart?.vat ?? 0;
  const total = cart?.totalAmount ?? subtotal + shipping + vat;

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-16 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="soft-card max-w-md p-10 text-center">
          <div className="mb-8 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <svg
                className="h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>

          <h2 className="mb-4 text-3xl font-black text-slate-900 dark:text-white">
            Your cart is empty
          </h2>
          <p className="mb-8 text-lg text-slate-600 dark:text-slate-300">
            Looks like you have not added anything yet.
          </p>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5"
          >
            Start shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
            Shopping cart
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Your selected items
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">
            {items.length} {items.length === 1 ? "item" : "items"} ready for
            checkout
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {items.map((item) => {
              const isUpdating = updatingItems.has(item._id);

              return (
                <div
                  key={item._id}
                  className={`soft-card overflow-hidden transition ${isUpdating ? "opacity-60" : "opacity-100"}`}
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-6 sm:flex-row">
                      <div className="flex-shrink-0">
                        <div className="h-32 w-32 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
                          {Array.isArray(item.product?.images) &&
                          item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <svg
                                className="h-12 w-12 text-slate-400 dark:text-slate-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                              {item.product?.name || "Product"}
                            </h3>
                            <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                              {item.product?.description || ""}
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {formatPrice(item.product?.price || 0)} each
                            </p>
                            <p className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
                              {formatPrice(
                                (item.product?.price || 0) * item.quantity,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                              Quantity
                            </span>
                            <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                              <button
                                type="button"
                                aria-label={`Decrease quantity of ${item.product?.name || "product"}`}
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.product._id,
                                    item.quantity - 1,
                                  )
                                }
                                disabled={item.quantity <= 1 || isUpdating}
                                className="h-11 w-11 text-lg font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-700"
                              >
                                −
                              </button>
                              <span className="min-w-12 px-3 py-2 text-center font-bold tabular-nums text-slate-900 dark:text-white">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                aria-label={`Increase quantity of ${item.product?.name || "product"}`}
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.product._id,
                                    item.quantity + 1,
                                  )
                                }
                                disabled={isUpdating}
                                className="h-11 w-11 text-lg font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-700"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.product._id)}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-2 self-start text-sm font-semibold text-red-600 transition hover:text-red-500 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              onClick={handleClearCart}
              disabled={cartQuery.isFetching}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear cart
            </button>
          </div>

          <div className="lg:col-span-1">
            <div className="soft-card sticky top-24 p-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Order summary
              </h2>

              <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {shipping === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        FREE
                      </span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>VAT</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatPrice(vat)}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
                  <div className="flex items-center justify-between text-lg font-black text-slate-900 dark:text-white">
                    <span>Total</span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cartQuery.isFetching || items.length === 0}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cartQuery.isFetching ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Proceed to checkout
                  </>
                )}
              </button>

              <button
                onClick={() => navigate("/")}
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Continue shopping
              </button>

              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-800/80 dark:bg-emerald-900/20 dark:text-emerald-300">
                <div className="flex items-center gap-2 font-semibold">
                  <span>✓</span>
                  Secure checkout
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
