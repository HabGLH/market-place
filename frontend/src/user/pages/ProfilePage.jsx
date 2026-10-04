import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfile, updateProfile } from "../../api/userApi";
import Loader from "../../components/Loader";

const getInitials = (name) =>
  name
    ?.trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          currentPassword: "",
        });
      } catch {
        setError("We couldn’t load your profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setUpdating(true);
    setError("");

    try {
      const updated = await updateProfile({
        name: formData.name,
        email: formData.email,
        ...(formData.email !== profile.email
          ? { currentPassword: formData.currentPassword }
          : {}),
      });
      setProfile((current) => ({ ...current, ...updated }));
      setFormData((current) => ({ ...current, currentPassword: "" }));
      setIsEditing(false);
    } catch (updateError) {
      setError(
        updateError.response?.data?.message ||
          "We couldn’t save your profile changes. Please try again.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || "",
      email: profile?.email || "",
      currentPassword: "",
    });
    setIsEditing(false);
    setError("");
  };

  if (loading) return <Loader />;

  const role =
    profile?.role === "admin" || profile?.role === 1
      ? "Administrator"
      : "Customer";
  const accountStatus =
    profile?.status ||
    (profile?.isActive === false ? "inactive" : profile?.isActive ? "active" : "");
  const statusLabel = accountStatus
    ? accountStatus.charAt(0).toUpperCase() + accountStatus.slice(1)
    : "";

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
            Account
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            My profile
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 sm:text-base">
            Manage your personal information and account links.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </div>
        )}

        {!profile ? (
          <section className="soft-card p-6 text-center sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Profile unavailable
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Your account information could not be displayed.
            </p>
          </section>
        ) : (
          <div className="space-y-5">
            <section className="soft-card overflow-hidden">
              <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-50/80 to-violet-50/80 p-5 dark:border-slate-800 dark:from-indigo-950/30 dark:to-violet-950/20 sm:p-7">
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-xl font-bold text-white shadow-md shadow-indigo-600/20 sm:h-20 sm:w-20 sm:text-2xl"
                    aria-hidden="true"
                  >
                    {getInitials(profile.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="break-words text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                      {profile.name || "Account"}
                    </h2>
                    <p className="mt-1 break-all text-sm text-slate-600 dark:text-slate-300">
                      {profile.email}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300">
                        {role}
                      </span>
                      {statusLabel && (
                        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {statusLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="btn-primary w-full py-2.5 sm:w-auto"
                    >
                      Edit profile
                    </button>
                  )}
                </div>
              </div>

              <div className="p-5 sm:p-7">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label
                        htmlFor="profile-name"
                        className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        Name
                      </label>
                      <input
                        id="profile-name"
                        type="text"
                        name="name"
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input px-3 py-2.5"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="profile-email"
                        className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        Email
                      </label>
                      <input
                        id="profile-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input px-3 py-2.5"
                        required
                      />
                    </div>
                    {formData.email !== profile.email && (
                      <div>
                        <label
                          htmlFor="profile-current-password"
                          className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                          Current password <span className="text-red-600">*</span>
                        </label>
                        <input
                          id="profile-current-password"
                          type="password"
                          name="currentPassword"
                          autoComplete="current-password"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          className="input px-3 py-2.5"
                          required
                        />
                        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                          Required to confirm an email address change.
                        </p>
                      </div>
                    )}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="btn-secondary w-full py-2.5 sm:w-auto"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updating}
                        className="btn-primary w-full py-2.5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        {updating ? "Saving…" : "Save changes"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div className="min-w-0 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Full name
                      </dt>
                      <dd className="mt-1 break-words text-sm font-semibold text-slate-900 dark:text-white">
                        {profile.name || "Not provided"}
                      </dd>
                    </div>
                    <div className="min-w-0 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Email address
                      </dt>
                      <dd className="mt-1 break-all text-sm font-semibold text-slate-900 dark:text-white">
                        {profile.email || "Not provided"}
                      </dd>
                    </div>
                    {profile.phone && (
                      <div className="min-w-0 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Phone
                        </dt>
                        <dd className="mt-1 break-words text-sm font-semibold text-slate-900 dark:text-white">
                          {profile.phone}
                        </dd>
                      </div>
                    )}
                    <div className="min-w-0 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Account type
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                        {role}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>
            </section>

            <section className="soft-card p-5 sm:p-7">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Your marketplace
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Quickly return to your orders or shopping cart.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/orders"
                  className="flex min-h-12 items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                >
                  View order history <span aria-hidden="true">→</span>
                </Link>
                <Link
                  to="/cart"
                  className="flex min-h-12 items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                >
                  View cart <span aria-hidden="true">→</span>
                </Link>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default ProfilePage;
