import { useState, useEffect } from "react";
import { getMyOrders, cancelOrder } from "../../api/orderApi";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import { useNavigate } from "react-router-dom";

// Format currency helper
const formatPrice = (price) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

// Format date helper
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Status badge component
const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Paid":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default: // Pending
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyles()}`}
    >
      {status}
    </span>
  );
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const data = await getMyOrders();
      // Sort by newest first
      const sortedOrders = Array.isArray(data)
        ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      setOrders(sortedOrders);
    } catch (err) {
      setError(err.message || "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setCancellingId(orderId);
    try {
      await cancelOrder(orderId);
      await fetchOrders();
      alert("Order cancelled successfully!");
    } catch (err) {
      alert(
        "Failed to cancel order: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          {/* Empty Orders Icon */}
          <div className="mb-8">
            <svg
              className="w-32 h-32 mx-auto text-gray-300 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          {/* Message */}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            No Orders Yet
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            You haven't placed any orders yet. Start shopping to see your orders
            here!
          </p>

          {/* CTA Button */}
          <button
            onClick={() => navigate("/")}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all hover:scale-105 shadow-lg"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            My Orders
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Track and manage your orders
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order._id;
            const isCancelling = cancellingId === order._id;

            return (
              <div
                key={order._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl"
              >
                {/* Order Header */}
                <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Order #{order._id?.substring(0, 12) || "..."}
                        </h3>
                        <StatusBadge status={order.orderStatus} />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Placed on{" "}
                        {order.createdAt
                          ? formatDate(order.createdAt)
                          : "Unknown Date"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Total Amount
                      </p>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {formatPrice(order.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-6">
                  {/* Order Items Summary */}
                  <div className="mb-4">
                    <button
                      onClick={() =>
                        setExpandedOrder(isExpanded ? null : order._id)
                      }
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                        Order Items ({order.items?.length || 0})
                      </h4>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Expanded Items List */}
                    {isExpanded && (
                      <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                          >
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg flex items-center justify-center">
                              {Array.isArray(item.product?.images) &&
                              item.product.images.length > 0 ? (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <svg
                                  className="w-8 h-8 text-gray-400"
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
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {item.product?.name || "Product"}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Order Actions */}
                  <div className="flex flex-wrap gap-3 mt-6">
                    {order.orderStatus === "Pending" && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={isCancelling}
                        className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isCancelling ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4"
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
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            Cancel Order
                          </>
                        )}
                      </button>
                    )}

                    {(order.orderStatus === "Delivered" ||
                      order.orderStatus === "Cancelled") && (
                      <button
                        onClick={() => navigate("/")}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                        Shop Again
                      </button>
                    )}

                    {order.orderStatus === "Shipped" && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="font-medium">
                          Your order is on the way!
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Shopping Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/")}
            className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
