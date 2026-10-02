import { useState, useEffect } from "react";
import { getUsers } from "../../api/userApi";
import { disableUser, enableUser, updateUserRole } from "../../api/adminApi";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import useFeedback from "../../hooks/useFeedback";
import { formatPrice } from "../../utils/formatters";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const { notify, confirm } = useFeedback();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    const action = user.isActive ? "disable" : "enable";
    const accepted = await confirm({
      title: `${action[0].toUpperCase()}${action.slice(1)} this user?`,
      message: `This will ${action} the account for ${user.email}.`,
      confirmLabel: action === "disable" ? "Disable user" : "Enable user",
    });
    if (!accepted) return;

    try {
      user.isActive ? await disableUser(user._id) : await enableUser(user._id);
      fetchUsers();
      notify(`User ${action}d`);
    } catch (err) {
      notify(
        err.response?.data?.message || `Failed to ${action} user.`,
        "error",
      );
    }
  };

  const handleRoleChange = async (user, newRole) => {
    const roleName = newRole === 1 ? "Admin" : "User";
    const accepted = await confirm({
      title: `Change role to ${roleName}?`,
      message: `This will grant ${roleName} permissions to ${user.email}.`,
      confirmLabel: "Change Role",
    });
    if (!accepted) return;

    try {
      await updateUserRole(user._id, newRole);
      fetchUsers();
      notify(`User role updated to ${roleName}`);
    } catch (err) {
      notify(err.response?.data?.message || "Failed to update user role", "error");
    }
  };

  const filteredUsers = users.filter((u) =>
    (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200">User Moderation</span>
          <h1 className="text-3xl font-black mt-1">User & Role Management</h1>
          <p className="text-blue-100 text-sm mt-1">Manage user roles, monitor purchasing history, and ban or restore user access</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center">
          <span className="block text-3xl font-black">{users.length}</span>
          <span className="text-xs text-blue-100 uppercase tracking-wider font-semibold">Total Accounts</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          Showing {filteredUsers.length} user records
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-3xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-6 py-4 text-left">User Profile</th>
              <th className="px-6 py-4 text-left">Orders & Spend</th>
              <th className="px-6 py-4 text-left">Role</th>
              <th className="px-6 py-4 text-left">Account Status</th>
              <th className="px-6 py-4 text-right">Moderation Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-500">
                  No users found matching your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isAdmin = u.role === 1 || u.role === "admin";
                return (
                  <tr
                    key={u._id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white ${isAdmin ? "bg-gradient-to-br from-purple-600 to-indigo-600 shadow-md" : "bg-gradient-to-br from-blue-500 to-cyan-500"}`}>
                          {(u.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white block">{u.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white block">
                          {formatPrice(u.totalSpent || 0)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {u.totalOrders || 0} completed order(s)
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={isAdmin ? 1 : 0}
                        onChange={(e) => handleRoleChange(u, Number(e.target.value))}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold outline-none cursor-pointer transition ${
                          isAdmin
                            ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                            : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <option value={0}>User (Customer)</option>
                        <option value={1}>Admin (Manager)</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          u.isActive
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${u.isActive ? "bg-emerald-500" : "bg-red-500"}`}></span>
                        {u.isActive ? "Active" : "Disabled / Banned"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition border ${
                          u.isActive
                            ? "border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                            : "border-emerald-200 dark:border-emerald-900 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                        }`}
                      >
                        {u.isActive ? "Ban Account" : "Unban Account"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
