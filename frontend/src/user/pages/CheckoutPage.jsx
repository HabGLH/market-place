import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { getCart } from "../../api/cartApi";
import { createOrder } from "../../api/orderApi";
import { createChapaCheckout } from "../../api/paymentApi";
import ErrorMessage from "../../components/ErrorMessage";
import Loader from "../../components/Loader";
import useFeedback from "../../hooks/useFeedback";
import { formatPrice } from "../../utils/formatters";

const initialAddress = {
  fullName: "",
  phone: "",
  city: "Addis Ababa",
  subCity: "",
  addressLine: "",
  landmark: "",
};

const normalizePhone = (phone) => {
  const value = phone.replace(/[\s()-]/g, "");
  if (/^0[79]\d{8}$/.test(value)) return `+251${value.slice(1)}`;
  return value;
};

const CheckoutPage = () => {
  const [address, setAddress] = useState(initialAddress);
  const [paymentMethod, setPaymentMethod] = useState("chapa");
  const [phoneError, setPhoneError] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { notify } = useFeedback();
  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });

  const checkoutMutation = useMutation({
    mutationFn: async (payload) => {
      if (paymentMethod === "chapa") {
        return createChapaCheckout(payload.shippingAddress);
      }
      return createOrder({ paymentMethod: "cod", ...payload });
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      if (paymentMethod === "chapa") {
        window.location.assign(result.checkoutUrl);
        return;
      }
      notify("Cash-on-delivery order placed");
      navigate(`/orders/${result._id}`);
    },
    onError: (error) =>
      notify(
        error.response?.data?.message || "Checkout could not be started",
        "error",
      ),
  });

  if (cartQuery.isPending) return <Loader />;
  if (cartQuery.isError)
    return <ErrorMessage message="Your cart could not be loaded." />;

  const cart = cartQuery.data;
  const items = cart.items || [];
  const shippingAddress = { ...address, phone: normalizePhone(address.phone) };
  const validPhone = /^\+251[79]\d{8}$/.test(shippingAddress.phone);

  const submit = (event) => {
    event.preventDefault();
    if (!validPhone) {
      setPhoneError(
        "Enter an Ethiopian mobile number, such as 0912345678 or +251912345678.",
      );
      return;
    }
    setPhoneError("");
    checkoutMutation.mutate({ shippingAddress });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 pb-16 pt-24 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              <span aria-hidden="true">←</span>
              Back to cart
            </Link>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Checkout
            </h1>
          </div>
          <div className="hidden rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200 sm:block">
            Secure payment
          </div>
        </div>

        {items.length === 0 ? (
          <div className="soft-card mx-auto max-w-xl p-10 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-3xl dark:bg-indigo-900/30">
              🛍️
            </div>
            <p className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              Your cart is empty.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <form
              onSubmit={submit}
              className="soft-card space-y-8 p-5 sm:p-6 lg:p-8"
            >
              <fieldset className="grid gap-4 sm:grid-cols-2">
                <legend className="mb-2 text-xl font-bold text-slate-900 dark:text-white sm:col-span-2">
                  Shipping address
                </legend>
                {[
                  ["fullName", "Full name", "text"],
                  ["phone", "Phone number", "tel"],
                  ["city", "City", "text"],
                  ["subCity", "Sub-city", "text"],
                  ["addressLine", "Address", "text"],
                  ["landmark", "Landmark (optional)", "text"],
                ].map(([name, label, type]) => (
                  <label
                    key={name}
                    className={`grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200 ${name === "addressLine" ? "sm:col-span-2" : ""}`}
                  >
                    {label}
                    <input
                      type={type}
                      autoComplete={
                        name === "fullName"
                          ? "name"
                          : name === "phone"
                            ? "tel"
                            : "street-address"
                      }
                      required={!name.includes("landmark")}
                      value={address[name]}
                      onChange={(event) =>
                        setAddress((current) => ({
                          ...current,
                          [name]: event.target.value,
                        }))
                      }
                      aria-invalid={name === "phone" && Boolean(phoneError)}
                      aria-describedby={
                        name === "phone" && phoneError
                          ? "checkout-phone-error"
                          : undefined
                      }
                      className="min-h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-indigo-900/60"
                    />
                    {name === "phone" && phoneError && (
                      <span
                        id="checkout-phone-error"
                        role="alert"
                        className="text-sm text-red-700 dark:text-red-300"
                      >
                        {phoneError}
                      </span>
                    )}
                  </label>
                ))}
              </fieldset>

              <fieldset>
                <legend className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                  Payment method
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["chapa", "Chapa", "Pay securely with Chapa"],
                    ["cod", "Cash on delivery", "Pay when your order arrives"],
                  ].map(([value, title, description]) => (
                    <label
                      key={value}
                      className={`flex cursor-pointer gap-3 rounded-[1.4rem] border p-4 transition ${paymentMethod === value ? "border-indigo-400 bg-indigo-50 shadow-sm dark:border-indigo-500 dark:bg-indigo-950/30" : "border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-900/40"}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={value}
                        checked={paymentMethod === value}
                        onChange={() => setPaymentMethod(value)}
                        className="mt-1 accent-indigo-600"
                      />
                      <span>
                        <span className="block font-bold text-slate-900 dark:text-white">
                          {title}
                        </span>
                        <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">
                          {description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={checkoutMutation.isPending}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkoutMutation.isPending
                  ? "Processing…"
                  : paymentMethod === "chapa"
                    ? "Continue to Chapa"
                    : "Place COD order"}
              </button>
            </form>

            <aside className="soft-card h-fit p-5 sm:p-6 lg:sticky lg:top-24">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Order summary
              </h2>

              <ul className="mt-5 space-y-3">
                {items.map((item) => (
                  <li
                    key={item.product?._id || item._id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-3 text-sm dark:bg-slate-900/60"
                  >
                    <span className="text-slate-700 dark:text-slate-200">
                      {item.product?.name || "Product"} × {item.quantity}
                    </span>
                    <span className="shrink-0 font-bold tabular-nums text-slate-900 dark:text-white">
                      {formatPrice((item.product?.price || 0) * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums font-semibold text-slate-900 dark:text-white">
                    {formatPrice(cart.subtotal ?? cart.totalPrice ?? 0)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Shipping</dt>
                  <dd className="tabular-nums font-semibold text-slate-900 dark:text-white">
                    {formatPrice(cart.shippingFee ?? 0)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>VAT</dt>
                  <dd className="tabular-nums font-semibold text-slate-900 dark:text-white">
                    {formatPrice(cart.vat ?? 0)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-black dark:border-slate-700">
                  <dt>Total</dt>
                  <dd className="tabular-nums text-indigo-600 dark:text-indigo-400">
                    {formatPrice(cart.totalAmount ?? 0)}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default CheckoutPage;
