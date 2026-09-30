import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAdminStats } from "../../api/adminApi";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import { formatPrice } from "../../utils/formatters";

// Stat Card Component
const StatCard = ({ title, value, icon, color, subtitle }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
        {title}
      </h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data || {});
    } catch (err) {
      setError(
        "Failed to load dashboard stats. Please check your connection and login status."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  const statsCards = [
    {
      title: "Total Revenue",
      value: formatPrice(
        stats?.revenue || stats?.totalRevenue || stats?.total_revenue || 0
      ),
      subtitle: "All time earnings",
      color: "from-green-500 to-emerald-600",
      icon: (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "Total Users",
      value: stats?.userCount || stats?.totalUsers || stats?.users || 0,
      subtitle: "Registered accounts",
      color: "from-blue-500 to-cyan-600",
      icon: (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      title: "Total Orders",
      value: stats?.orderCount || stats?.totalOrders || stats?.orders || 0,
      subtitle: "Completed & pending",
      color: "from-purple-500 to-pink-600",
      icon: (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      title: "Total Products",
      value:
        stats?.productCount || stats?.totalProducts || stats?.products || 0,
      subtitle: "In inventory",
      color: "from-orange-500 to-red-600",
      icon: (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Overview of your store's performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      {/* Low Stock Alert */}
      {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Low Stock Alert
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {stats?.lowStockProducts?.length || 0} product(s) need
                restocking
              </p>
            </div>
          </div>

          {/* Low Stock Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                    Product
                  </th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                    Current Stock
                  </th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                    Price
                  </th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats?.lowStockProducts &&
                  Array.isArray(stats.lowStockProducts) &&
                  stats.lowStockProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                            {Array.isArray(product.images) &&
                            product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <svg
                                className="w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                            product.stock === 0
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              : product.stock <= 5
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          {product.stock} units
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">
                        {formatPrice(product.price)}
                      </td>
                      <td className="py-4 px-4">
                        {product.stock === 0 ? (
                          <span className="text-red-600 dark:text-red-400 font-semibold">
                            Out of Stock
                          </span>
                        ) : (
                          <span className="text-orange-600 dark:text-orange-400 font-semibold">
                            Low Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/products"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <svg
            className="w-10 h-10 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <h3 className="text-xl font-bold mb-2">Add Product</h3>
          <p className="text-white/80">Create a new product listing</p>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <svg
            className="w-10 h-10 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-xl font-bold mb-2">Manage Orders</h3>
          <p className="text-white/80">View and process orders</p>
        </Link>

        <Link
          to="/admin/users"
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <svg
            className="w-10 h-10 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="text-xl font-bold mb-2">Manage Users</h3>
          <p className="text-white/80">View and moderate users</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
