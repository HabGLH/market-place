import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { getPaymentStatus } from "../../api/paymentApi";
import Loader from "../../components/Loader";

const PaymentReturnPage = () => {
  const [searchParams] = useSearchParams();
  const txRef = searchParams.get("txRef");
  const statusQuery = useQuery({
    queryKey: ["payment-status", txRef],
    queryFn: () => getPaymentStatus(txRef),
    enabled: Boolean(txRef),
    refetchInterval: (query) =>
      ["Paid", "Failed", "Refunded"].includes(query.state.data?.paymentStatus)
        ? false
        : 3000,
  });

  if (!txRef) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-4 pb-16 pt-28">
        <h1 className="text-2xl font-bold text-gray-950 dark:text-white">
          Payment reference missing
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          Return to your cart and start checkout again.
        </p>
        <Link
          to="/cart"
          className="mt-5 inline-flex rounded bg-emerald-800 px-4 py-2 font-semibold text-white"
        >
          Go to cart
        </Link>
      </main>
    );
  }

  if (statusQuery.isPending || statusQuery.data?.paymentStatus === "Pending") {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-4 pb-16 pt-28">
        <div className="border-l-4 border-amber-500 bg-amber-50 p-6 dark:bg-amber-950/30">
          <h1 className="text-2xl font-bold text-gray-950 dark:text-white">
            Confirming your payment
          </h1>
          <p className="mt-2 text-gray-700 dark:text-gray-200">
            We’re waiting for Chapa to confirm the transaction. This page will
            update automatically.
          </p>
        </div>
        <div className="mt-8">
          <Loader />
        </div>
      </main>
    );
  }

  if (statusQuery.isError) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-4 pb-16 pt-28">
        <h1 className="text-2xl font-bold text-gray-950 dark:text-white">
          Payment status unavailable
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          Your payment may still be processing. Check your orders before trying
          again.
        </p>
        <Link
          to="/orders"
          className="mt-5 inline-flex rounded bg-emerald-800 px-4 py-2 font-semibold text-white"
        >
          View orders
        </Link>
      </main>
    );
  }

  const paid = statusQuery.data?.paymentStatus === "Paid";
  const failed = ["Failed", "Refunded"].includes(
    statusQuery.data?.paymentStatus,
  );

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-16 pt-28">
      <section
        className={`border-l-4 p-6 ${paid ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : failed ? "border-red-600 bg-red-50 dark:bg-red-950/30" : "border-amber-500 bg-amber-50 dark:bg-amber-950/30"}`}
      >
        <h1 className="text-2xl font-bold text-gray-950 dark:text-white">
          {paid
            ? "Payment confirmed"
            : failed
              ? "Payment not completed"
              : "Payment is still pending"}
        </h1>
        <p className="mt-2 text-gray-700 dark:text-gray-200">
          {paid
            ? "Your order is being prepared. You can view the receipt in your orders."
            : failed
              ? "No payment was recorded. Review your orders or return to checkout to try again."
              : "We have not received a final payment status yet. Please check your orders again shortly."}
        </p>
        <p className="mt-4 break-all font-mono text-xs text-gray-600 dark:text-gray-300">
          Reference: {txRef}
        </p>
      </section>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to={
            statusQuery.data?.orderId
              ? `/orders/${statusQuery.data.orderId}`
              : "/orders"
          }
          className="rounded bg-emerald-800 px-4 py-2 font-semibold text-white"
        >
          View order
        </Link>
        {!paid && (
          <Link
            to="/checkout"
            className="rounded border border-gray-400 px-4 py-2 font-semibold text-gray-800 dark:border-gray-600 dark:text-gray-100"
          >
            Return to checkout
          </Link>
        )}
        <Link
          to="/products"
          className="rounded border border-gray-400 px-4 py-2 font-semibold text-gray-800 dark:border-gray-600 dark:text-gray-100"
        >
          Continue shopping
        </Link>
      </div>
    </main>
  );
};

export default PaymentReturnPage;
