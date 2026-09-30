import { useState, useEffect } from "react";
import { getUsers, disableUser, enableUser } from "../../api/userApi";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
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
    if (!window.confirm(`Are you sure you want to ${action} this user?`))
      return;

    try {
      user.isActive ? await disableUser(user._id) : await enableUser(user._id);

      fetchUsers();
    } catch (err) {
      alert(`Failed to ${action} user.`);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Manage Users
      </h2>

      {/* Table Wrapper */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {/* Head */}
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Role
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.map((u) => (
              <tr
                key={u._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                  {u.name}
                </td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                  {u.email}
                </td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-300 capitalize">
                  {u.role}
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      u.isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {u.isActive ? "Active" : "Disabled"}
                  </span>
                </td>

                {/* Action */}
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleStatus(u)}
                    className={`font-medium transition ${
                      u.isActive
                        ? "text-red-600 hover:text-red-700 dark:text-red-400"
                        : "text-green-600 hover:text-green-700 dark:text-green-400"
                    }`}
                  >
                    {u.isActive ? "Block" : "Unblock"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
