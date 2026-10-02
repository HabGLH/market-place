import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProducts } from "../../api/productApi";
import { addToCart } from "../../api/cartApi";
import useAuth from "../../auth/useAuth";
import Pagination from "../../components/Pagination";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import { formatPrice } from "../../utils/formatters";
import { useNavigate } from "react-router-dom";
import useFeedback from "../../hooks/useFeedback";

// Format currency helper

const HomePage = () => {
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 8; // Limit products per page to save memory

  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useFeedback();
  const categories = [
    {
      name: "Smart Devices",
      icon: "📱",
      accent: "from-indigo-500 to-cyan-500",
    },
    { name: "Audio", icon: "🎧", accent: "from-violet-500 to-pink-500" },
    { name: "Accessories", icon: "⌚", accent: "from-amber-500 to-orange-500" },
    { name: "Office", icon: "💻", accent: "from-emerald-500 to-teal-500" },
  ];

  const trustPoints = [
    "Fast nationwide delivery",
    "Secure checkout",
    "Quality guaranteed",
    "Easy returns",
  ];

  const productsQuery = useQuery({
    queryKey: ["products", { page: currentPage, limit }],
    queryFn: () => getProducts({ page: currentPage, limit }),
  });
  const products = productsQuery.data?.items ?? [];
  const totalPages = productsQuery.data?.pages ?? 1;
  const addMutation = useMutation({
    mutationFn: (productId) => addToCart(productId, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      notify("Added to cart");
    },
    onError: (err) =>
      notify(
        `Failed to add to cart: ${err.response?.data?.message || err.message}`,
        "error",
      ),
  });

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = (product) => {
    if (!user) {
      navigate("/login");
      return;
    }

    addMutation.mutate(product._id);
  };

  const filteredProducts = products;

  if (productsQuery.isPending) return <Loader />;
  if (productsQuery.isError)
    return <ErrorMessage message="Failed to load products." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.28),_transparent_25%),linear-gradient(135deg,#0f172a_0%,#1e1b4b_38%,#4f46e5_100%)]">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-10 top-20 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute right-10 top-10 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 h-52 w-52 rounded-full bg-indigo-400/20 blur-3xl" />
        </div>

        <div className="section-shell relative py-20 sm:py-28 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="text-left">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-indigo-100 backdrop-blur">
                Trusted tech shopping for everyday life
              </span>
              <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Upgrade your life with{" "}
                <span className="text-indigo-200">smarter tech</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-indigo-100/90">
                Discover premium gadgets, productivity essentials, and lifestyle
                upgrades designed to make work, play, and everyday routines
                smoother.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#products"
                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-base font-semibold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
                >
                  Shop now
                </a>
                {!user && (
                  <button
                    onClick={() => navigate("/register")}
                    className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/5 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
                  >
                    Create account
                  </button>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-indigo-100/80">
                {trustPoints.map((point) => (
                  <span
                    key={point}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5"
                  >
                    {point}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-cyan-400/20 via-indigo-400/30 to-fuchsia-500/20 blur-2xl" />
              <div className="soft-card relative overflow-hidden border-white/10 bg-white/8 p-5 shadow-2xl">
                <div className="rounded-[2rem] bg-slate-950 p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-300">Best seller</p>
                      <h3 className="mt-1 text-2xl font-bold">
                        Nova Pro Laptop
                      </h3>
                    </div>
                    <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-300">
                      4.9/5
                    </div>
                  </div>

                  <div className="mt-6 rounded-[1.5rem] bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 p-6">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm text-indigo-100">From</p>
                        <p className="mt-1 text-3xl font-black">ETB 18,500</p>
                      </div>
                      <div className="rounded-2xl bg-white/15 px-3 py-2 text-sm font-semibold text-white backdrop-blur">
                        Free shipping
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
                    <div className="rounded-2xl bg-slate-800 p-3">
                      <div className="text-xl font-bold text-white">12h</div>
                      <div className="mt-1 text-slate-400">Battery</div>
                    </div>
                    <div className="rounded-2xl bg-slate-800 p-3">
                      <div className="text-xl font-bold text-white">16GB</div>
                      <div className="mt-1 text-slate-400">RAM</div>
                    </div>
                    <div className="rounded-2xl bg-slate-800 p-3">
                      <div className="text-xl font-bold text-white">1TB</div>
                      <div className="mt-1 text-slate-400">SSD</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-16">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            Shop by category
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Curated for every need
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <div
              key={category.name}
              className="soft-card group overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${category.accent} text-2xl shadow-lg`}
              >
                {category.icon}
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                {category.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Handpicked essentials for a cleaner, smarter lifestyle.
              </p>
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="mt-5 inline-flex items-center text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400"
              >
                Explore collection →
              </button>
            </div>
          ))}
        </div>
      </section>

      <section id="products" className="section-shell py-16 sm:py-20">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            Featured collection
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Premium picks for everyday living
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-300 sm:text-lg">
            Discover quality tech essentials chosen to elevate the way you work,
            connect, and unwind.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {["all", "featured", "new", "sale"].map((category) => (
            <button
              key={category}
              onClick={() => {
                setFilter(category);
                setCurrentPage(1);
              }}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold capitalize transition-all sm:text-base ${
                filter === category
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mb-4 text-6xl">🛍️</div>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              No products available yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/80 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(79,70,229,0.14)] dark:border-slate-700 dark:bg-slate-900/80"
              >
                <div className="relative h-60 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
                  {Array.isArray(product.images) &&
                  product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg
                        className="h-20 w-20 text-slate-400 dark:text-slate-500"
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
                    </div>
                  )}

                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute right-3 top-3 rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                      Low stock
                    </div>
                  )}

                  {product.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70">
                      <span className="text-lg font-bold text-white">
                        Out of stock
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {product.category || "Featured"}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      4.8 ★
                    </span>
                  </div>

                  <h3 className="mb-2 line-clamp-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                    {product.name}
                  </h3>

                  <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {product.description || "Premium quality product"}
                  </p>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {formatPrice(product.price)}
                    </span>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addMutation.isPending || product.stock <= 0}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                        product.stock > 0
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700"
                          : "cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                      }`}
                    >
                      {addMutation.isPending ? (
                        <>
                          <svg
                            className="h-4 w-4 animate-spin"
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
                          Adding...
                        </>
                      ) : product.stock > 0 ? (
                        <>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          Add
                        </>
                      ) : (
                        "Sold out"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            hasPrevPage={currentPage > 1}
            hasNextPage={currentPage < totalPages}
          />
        </div>
      </section>

      {!user && (
        <section className="bg-gradient-to-r from-indigo-600 to-violet-600 py-16 dark:from-indigo-900 dark:to-violet-900">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">
              Ready to start shopping?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-indigo-100">
              Join thousands of customers enjoying secure delivery, trusted
              quality, and premium support.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="rounded-full bg-white px-8 py-4 text-lg font-bold text-indigo-700 shadow-xl transition hover:-translate-y-0.5 hover:bg-indigo-50"
            >
              Create free account
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
