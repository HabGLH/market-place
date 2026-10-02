import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getOrderById } from "../../api/orderApi";
import ErrorMessage from "../../components/ErrorMessage";
import Loader from "../../components/Loader";
import { formatDate, formatPrice } from "../../utils/formatters";

const OrderDetailPage = () => {
  const { id } = useParams();
  const orderQuery = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id),
  });

  if (orderQuery.isPending) return <Loader />;
  if (orderQuery.isError)
    return <ErrorMessage message="The order could not be loaded." />;

  const order = orderQuery.data;

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 pb-5 dark:border-gray-700 print:border-black">
        <div>
          <Link
            to="/orders"
            className="text-sm font-semibold text-emerald-800 hover:underline dark:text-emerald-400 print:hidden"
          >
            Back to orders
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white print:text-black">
            Order receipt
          </h1>
          <p className="mt-2 break-all font-mono text-sm text-gray-600 dark:text-gray-300">
            {order.txRef}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          aria-label="Print order receipt"
          className="rounded border border-gray-400 px-4 py-2 text-sm font-semibold hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 dark:border-gray-600 dark:hover:bg-gray-800 print:hidden"
        >
          Print receipt
        </button>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <section>
          <h2 className="font-semibold text-gray-950 dark:text-white">
            Order details
          </h2>
          <dl className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex justify-between gap-3">
              <dt>Placed</dt>
              <dd>{formatDate(order.createdAt)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Order status</dt>
              <dd>{order.orderStatus}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Payment</dt>
              <dd>
                {order.paymentStatus} · {order.paymentMethod}
              </dd>
            </div>
          </dl>
        </section>
        <section>
          <h2 className="font-semibold text-gray-950 dark:text-white">
            Delivery
          </h2>
          <address className="mt-2 text-sm not-italic text-gray-700 dark:text-gray-300">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.phone}
            <br />
            {order.shippingAddress.addressLine}
            <br />
            {order.shippingAddress.subCity}, {order.shippingAddress.city}
            {order.shippingAddress.landmark && (
              <>
                <br />
                {order.shippingAddress.landmark}
              </>
            )}
          </address>
        </section>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-y border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300">
            <tr>
              <th className="py-3 pr-3">Item</th>
              <th className="px-3 py-3">Qty</th>
              <th className="px-3 py-3 text-right">Price</th>
              <th className="py-3 pl-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {order.products.map((item) => (
              <tr key={item.productId?._id || item._id}>
                <td className="py-3 pr-3 text-gray-950 dark:text-white">
                  {item.productId?.name || "Product"}
                </td>
                <td className="px-3 py-3">{item.quantity}</td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {formatPrice(item.price)}
                </td>
                <td className="py-3 pl-3 text-right tabular-nums">
                  {formatPrice(item.totalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="ml-auto mt-5 max-w-sm space-y-2 border-t border-gray-200 pt-4 text-sm dark:border-gray-700">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd className="tabular-nums">{formatPrice(order.shippingFee)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>VAT</dt>
          <dd className="tabular-nums">{formatPrice(order.vat)}</dd>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold dark:border-gray-700">
          <dt>Total ({order.currency})</dt>
          <dd className="tabular-nums">{formatPrice(order.totalAmount)}</dd>
        </div>
      </dl>
    </main>
  );
};

export default OrderDetailPage;
