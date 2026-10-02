import { useState, useEffect } from "react";
import { getActivityLogs } from "../../api/adminApi";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filterEntity, setFilterEntity] = useState("all");

  const fetchLogs = async (currentPage = 1) => {
    try {
      setLoading(true);
      const data = await getActivityLogs(currentPage, 20);
      setLogs(data?.logs || []);
      setTotalPages(data?.pages || 1);
      setTotalLogs(data?.total || 0);
      setError(null);
    } catch {
      setError("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const filteredLogs = logs.filter((log) => {
    if (filterEntity === "all") return true;
    return log.entityType?.toLowerCase() === filterEntity.toLowerCase();
  });

  const getActionBadgeColor = (action) => {
    if (action.includes("CREATE") || action.includes("ENABLE"))
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
    if (action.includes("UPDATE") || action.includes("STOCK"))
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
    if (action.includes("DELETE") || action.includes("DISABLE"))
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
  };

  if (loading && page === 1) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Security & Compliance</span>
          <h1 className="text-3xl font-black mt-1">System Audit & Activity Logs</h1>
          <p className="text-emerald-100 text-sm mt-1">Real-time log of administrative actions, user changes, and inventory updates</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center">
          <span className="block text-3xl font-black">{totalLogs}</span>
          <span className="text-xs text-emerald-100 uppercase tracking-wider font-semibold">Total Logged Events</span>
        </div>
      </div>

      {/* Entity Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 overflow-x-auto">
          {["all", "Product", "User", "Category", "Order", "System"].map((entity) => (
            <button
              key={entity}
              onClick={() => setFilterEntity(entity)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                filterEntity === entity
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              {entity === "all" ? "All Entities" : entity}
            </button>
          ))}
        </div>
        <button
          onClick={() => fetchLogs(page)}
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Feed
        </button>
      </div>

      {/* Log Feed Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="p-4 pl-6">Timestamp</th>
                <th className="p-4">Admin / User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Details</th>
                <th className="p-4 pr-6">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-gray-500 dark:text-gray-400">
                    No activity logs recorded yet.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition">
                    <td className="p-4 pl-6 font-mono text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                          {log.userId?.name ? log.userId.name.charAt(0).toUpperCase() : "A"}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white block text-xs">
                            {log.userId?.name || "System Admin"}
                          </span>
                          <span className="text-[10px] text-gray-400">{log.userId?.email || ""}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700 dark:text-gray-300 font-medium">
                      {log.details || "-"}
                    </td>
                    <td className="p-4 pr-6 font-mono text-xs text-gray-400">
                      {log.ipAddress || "Internal"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
