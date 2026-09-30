import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../../api/userApi";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setFormData({ name: data.name, email: data.email });
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const updated = await updateProfile(formData);
      setProfile(updated);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError("Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: profile?.name || "", email: profile?.email || "" });
    setIsEditing(false);
    setError(null);
  };

  if (loading) return <Loader />;
  if (error && !profile) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            My Profile
          </h1>

          {error && <ErrorMessage message={error} />}

          <div className="space-y-6">
            {/* Profile Info */}
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {profile?.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {profile?.email}
                </p>
                <span className="inline-block px-3 py-1 text-sm font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full mt-1">
                  {profile?.role === "admin" ? "Administrator" : "Customer"}
                </span>
              </div>
            </div>

            {/* Edit Form */}
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Edit Profile
                </button>
              </div>
            )}

            {/* Account Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Account Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/orders")}
                  className="w-full text-left px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md"
                >
                  View Order History
                </button>
                <button
                  onClick={() => navigate("/cart")}
                  className="w-full text-left px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md"
                >
                  View Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
