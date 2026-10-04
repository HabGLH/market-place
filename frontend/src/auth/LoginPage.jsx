import { useState } from "react";
import { useNavigate, useLocation, Link, Navigate } from "react-router-dom";
import useAuth from "./useAuth";
import ErrorMessage from "../components/ErrorMessage";
import Loader from "../components/Loader";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || (user?.role === "admin" ? "/admin" : "/");

  if (loading) {
    return <Loader />;
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.35),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.28),_transparent_30%)]" />

      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm">
            <span className="text-3xl">🛒</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">
            Welcome back
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl sm:p-8">
          <h2 className="mb-2 text-center text-3xl font-black tracking-tight text-white">
            Sign in to TechBrand
          </h2>
          <p className="mb-6 text-center text-sm text-indigo-100/80">
            Continue shopping with your account
          </p>

          {error && (
            <div className="mb-4">
              <ErrorMessage message={error} />
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                className="mb-2 block text-sm font-medium text-indigo-100"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-3 text-white placeholder:text-indigo-100/50 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-400/50"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-indigo-100"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-3 text-white placeholder:text-indigo-100/50 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-400/50"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-900/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-indigo-100/80">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-white underline-offset-4 hover:underline"
            >
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
