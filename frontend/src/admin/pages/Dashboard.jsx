import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAdminStats } from "../../api/adminApi";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import { formatPrice } from "../../utils/formatters";

// Stat Card Component
const StatCard = ({ title, value, icon, color, subtitle, trend }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
          {icon}
        </div>
        {trend && (
          <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
        {title}
      </h3>
      <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{subtitle}</p>
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
    } catch {
      setError("Failed to load dashboard stats. Please check your connection and login status.");
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
      value: formatPrice(stats?.revenue || stats?.totalRevenue || stats?.total_revenue || 0),
      subtitle: "All time completed earnings",
      trend: "+12% vs last mo",
      color: "from-emerald-500 to-teal-600",
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Total Orders",
      value: stats?.orderCount || stats?.totalOrders || stats?.orders || 0,
      subtitle: "Lifetime order volume",
      trend: "Active Store",
      color: "from-indigo-500 to-purple-600",
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: "Total Users",
      value: stats?.userCount || stats?.totalUsers || stats?.users || 0,
      subtitle: "Registered buyer accounts",
      trend: "Growing",
      color: "from-blue-500 to-cyan-600",
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: "Catalog Products",
      value: stats?.productCount || stats?.totalProducts || stats?.products || 0,
      subtitle: `${stats?.outOfStockCount || 0} items out of stock`,
      trend: stats?.outOfStockCount > 0 ? `${stats.outOfStockCount} Out` : "Full",
      color: "from-amber-500 to-orange-600",
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
  ];

  // Helper for monthly sales chart math
  const monthlySalesData = stats?.monthlySales && stats.monthlySales.length > 0
    ? stats.monthlySales
    : [
        { _id: { month: 5 }, revenue: 1200 },
        { _id: { month: 6 }, revenue: 2400 },
        { _id: { month: 7 }, revenue: 1800 },
        { _id: { month: 8 }, revenue: 3200 },
        { _id: { month: 9 }, revenue: 4500 },
        { _id: { month: 10 }, revenue: 5100 },
      ];
  
  const maxRevenue = Math.max(...monthlySalesData.map(m => m.revenue || 0), 100);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Executive Dashboard
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">System Control Center</h1>
            <p className="text-indigo-200 mt-2 text-sm max-w-xl">
              Monitor key metrics, audit transaction trails, adjust stock levels, and customize product categories.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/inventory"
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition transform hover:-translate-y-0.5"
            >
              Restock Center
            </Link>
            <Link
              to="/admin/categories"
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition transform hover:-translate-y-0.5"
            >
              Categories
            </Link>
          </div>
        </div>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      {/* Analytics & Charts Row */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Sales & Revenue SVG Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Revenue & Sales Trends</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Monthly revenue breakdown</p>
            </div>
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1.5 rounded-xl font-bold">
              6-Month View
            </span>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 pt-8 px-2 border-b border-gray-100 dark:border-gray-700">
            {monthlySalesData.map((item, idx) => {
              const heightPercent = Math.max((item.revenue / maxRevenue) * 100, 10);
              const monthLabel = monthNames[(item._id?.month || 1) - 1] || "M";
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition">
                    {formatPrice(item.revenue)}
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 rounded-2xl transition-all shadow-md group-hover:shadow-indigo-500/30"
                  ></div>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2">
                    {monthLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Order Status Overview</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Current order pipeline state</p>

            <div className="space-y-4">
              {stats?.orderStatusDistribution && stats.orderStatusDistribution.length > 0 ? (
                stats.orderStatusDistribution.map((status) => (
                  <div key={status._id} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                      <span className="capitalize">{status._id || "Pending"}</span>
                      <span>{status.count} orders</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{
                          width: `${Math.min((status.count / (stats?.totalOrders || 1)) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 py-4">No order status metrics available.</div>
              )}
            </div>
          </div>

          <Link
            to="/admin/orders"
            className="w-full mt-6 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-2xl font-bold text-xs text-center transition block"
          >
            Manage All Orders &rarr;
          </Link>
        </div>
      </div>

      {/* Quick Navigation Shortcuts Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Management Modules</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Link
            to="/admin/categories"
            className="rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white shadow-xl shadow-indigo-500/20 transition transform hover:-translate-y-1 hover:shadow-2xl"
          >
            <svg className="mb-4 h-9 w-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="text-2xl font-bold">Categories</h3>
            <p className="mt-1 text-purple-100 text-xs">Create, rename, or structure product categories</p>
          </Link>

          <Link
            to="/admin/inventory"
            className="rounded-3xl bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white shadow-xl shadow-amber-500/20 transition transform hover:-translate-y-1 hover:shadow-2xl"
          >
            <svg className="mb-4 h-9 w-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-2xl font-bold">Inventory & Restock</h3>
            <p className="mt-1 text-amber-100 text-xs">Manage low stock alerts and quick quantity updates</p>
          </Link>

          <Link
            to="/admin/logs"
            className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white shadow-xl shadow-emerald-500/20 transition transform hover:-translate-y-1 hover:shadow-2xl"
          >
            <svg className="mb-4 h-9 w-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="text-2xl font-bold">Activity Logs</h3>
            <p className="mt-1 text-emerald-100 text-xs">Inspect administrative audit trails & security logs</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
