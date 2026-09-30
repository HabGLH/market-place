import { useState, useEffect } from "react";
import { getAllOrders, updateOrderStatus } from "../../api/orderApi";
import Pagination from "../../components/Pagination";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import { formatPrice } from "../../utils/formatters";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders({ page: currentPage, limit });

      if (data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders);
        setTotalPages(
          data.totalPages ||
            Math.ceil((data.totalCount || data.count) / limit) ||
            1
        );
      } else if (Array.isArray(data)) {
        setOrders(data);
        setTotalPages(1);
      } else {
        setOrders([]);
        setTotalPages(1);
      }
    } catch (err) {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleStatusChange = async (id, newStatus) => {
    if (!window.confirm(`Change status to ${newStatus}?`)) return;
    try {
      await updateOrderStatus(id, newStatus);
      fetchOrders();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Manage Orders
      </h2>

      {orders.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No orders found.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <strong className="text-gray-900 dark:text-gray-100">
                  Order #{order._id}
                </strong>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "Unknown Date"}
                </span>
              </div>

              {/* Details */}
              <div className="mt-3 text-gray-700 dark:text-gray-300">
                <p>
                  User:{" "}
                  <span className="font-medium">
                    {order.user?.name || "Unknown"}
                  </span>
                </p>
                <p>
                  Total:{" "}
                  <span className="font-semibold">
                    {formatPrice(order.totalPrice)}
                  </span>
                </p>
              </div>

              {/* Status & Actions */}
              <div className="mt-4 flex items-center gap-4">
                {/* Status Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    order.orderStatus === "Delivered"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : order.orderStatus === "Cancelled"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {order.orderStatus}
                </span>

                {/* Status Select */}
                <select
                  value={order.orderStatus}
                  onChange={(e) =>
                    handleStatusChange(order._id, e.target.value)
                  }
                  className="ml-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        hasPrevPage={currentPage > 1}
        hasNextPage={currentPage < totalPages}
      />
    </div>
  );
};

export default Orders;
