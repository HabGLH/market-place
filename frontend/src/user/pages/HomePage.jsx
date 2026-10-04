import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProducts } from "../../api/productApi";
import { getCategories } from "../../api/adminApi";
import { addToCart } from "../../api/cartApi";
import useAuth from "../../auth/useAuth";
import Pagination from "../../components/Pagination";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import { formatPrice } from "../../utils/formatters";
import { useNavigate, Link } from "react-router-dom";
import useFeedback from "../../hooks/useFeedback";

/* ─── Animated counter hook ─── */
const useCounter = (end, duration = 2000, startOnView = true) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView) {
      setCount(end);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = end / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, startOnView]);

  return { count, ref };
};

/* ─── Fade-in on scroll hook ─── */
const useFadeIn = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
};

/* ─── Category icon mapping ─── */
const categoryIcons = {
  "smart devices": "📱",
  electronics: "🖥️",
  audio: "🎧",
  accessories: "⌚",
  office: "💻",
  gaming: "🎮",
  wearables: "⌚",
  cameras: "📷",
  tablets: "📱",
  laptops: "💻",
  phones: "📱",
  headphones: "🎧",
  speakers: "🔊",
  storage: "💾",
  networking: "🌐",
  software: "📀",
};

const categoryGradients = [
  "from-indigo-500 to-cyan-500",
  "from-violet-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-red-500",
  "from-sky-500 to-blue-500",
  "from-fuchsia-500 to-purple-500",
  "from-lime-500 to-green-500",
];

/* ─── Star rating component ─── */
const StarRating = ({ rating = 0, size = "sm" }) => {
  const sizeClasses = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClasses} ${star <= Math.round(rating) ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [heroProductIndex, setHeroProductIndex] = useState(0);
  const limit = 8;

  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useFeedback();

  // ─── Dynamic data fetching ───
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });

  const productsQuery = useQuery({
    queryKey: [
      "products",
      { page: currentPage, limit, category: selectedCategory, q: searchQuery },
    ],
    queryFn: () =>
      getProducts({
        page: currentPage,
        limit,
        category: selectedCategory || undefined,
        q: searchQuery || undefined,
      }),
  });

  // Featured products for hero (top-rated / newest)
  const featuredQuery = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => getProducts({ page: 1, limit: 5, sort: "newest" }),
    staleTime: 5 * 60 * 1000,
  });

  const categories = Array.isArray(categoriesQuery.data)
    ? categoriesQuery.data.filter((c) => c.isActive !== false)
    : Array.isArray(categoriesQuery.data?.categories)
      ? categoriesQuery.data.categories.filter((c) => c.isActive !== false)
      : [];

  const products = productsQuery.data?.items ?? [];
  const totalPages = productsQuery.data?.pages ?? 1;
  const totalProducts = productsQuery.data?.total ?? 0;
  const featuredProducts = featuredQuery.data?.items ?? [];
  const heroProduct = featuredProducts[heroProductIndex] ?? null;

  // Auto-rotate hero product
  useEffect(() => {
    if (featuredProducts.length <= 1) return;
    const timer = setInterval(() => {
      setHeroProductIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  // ─── Mutations ───
  const addMutation = useMutation({
    mutationFn: (productId) => addToCart(productId, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      notify("Added to cart ✓");
    },
    onError: (err) =>
      notify(
        `Failed to add to cart: ${err.response?.data?.message || err.message}`,
        "error",
      ),
  });

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAddToCart = useCallback(
    (product) => {
      if (!user) {
        navigate("/login");
        return;
      }
      addMutation.mutate(product._id);
    },
    [user, navigate, addMutation],
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(
      selectedCategory === categoryName ? "" : categoryName,
    );
    setCurrentPage(1);
  };

  // ─── Animated stats ───
  const stat1 = useCounter(totalProducts || 120, 1800);
  const stat2 = useCounter(2500, 2000);
  const stat3 = useCounter(99, 1500);

  // ─── Fade-in refs ───
  const categoriesFade = useFadeIn();
  const productsFade = useFadeIn();
  const statsFade = useFadeIn();
  const ctaFade = useFadeIn();

  if (productsQuery.isPending && !productsQuery.data) return <Loader />;
  if (productsQuery.isError)
    return <ErrorMessage message="Failed to load products." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* ═══════════════════════════════════════════
          HERO SECTION — Dynamic featured product
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.28),_transparent_25%),linear-gradient(135deg,#0f172a_0%,#1e1b4b_38%,#4f46e5_100%)]">
        {/* Animated background blobs */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-10 top-20 h-40 w-40 animate-pulse rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute right-10 top-10 h-48 w-48 animate-pulse rounded-full bg-fuchsia-500/20 blur-3xl [animation-delay:1s]" />
          <div className="absolute bottom-10 left-1/3 h-52 w-52 animate-pulse rounded-full bg-indigo-400/20 blur-3xl [animation-delay:2s]" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/30 animate-bounce"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${2 + i * 0.5}s`,
              }}
            />
          ))}
        </div>

        <div className="section-shell relative py-20 sm:py-28 lg:py-36">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Left — Text Content */}
            <div className="text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-indigo-100 backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                {totalProducts > 0
                  ? `${totalProducts}+ products available now`
                  : "Trusted tech shopping for everyday life"}
              </span>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Upgrade your life with{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-indigo-200 to-fuchsia-300 bg-clip-text text-transparent">
                  smarter tech
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-indigo-100/90">
                Discover premium gadgets, productivity essentials, and lifestyle
                upgrades designed to make work, play, and everyday routines
                smoother.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="mt-8 flex max-w-lg gap-3">
                <div className="relative flex-1">
                  <svg
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full rounded-2xl border border-white/20 bg-white/10 py-3.5 pl-12 pr-4 text-white placeholder-indigo-200/60 backdrop-blur-lg transition focus:border-white/40 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-base font-semibold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50 hover:shadow-xl active:translate-y-0"
                >
                  Search
                </button>
              </form>

              {/* CTA Buttons */}
              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#products"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Shop now
                </a>
                {!user && (
                  <button
                    onClick={() => navigate("/register")}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Create free account
                  </button>
                )}
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-indigo-100/80">
                {[
                  { icon: "🚚", text: "Fast delivery" },
                  { icon: "🔒", text: "Secure checkout" },
                  { icon: "✅", text: "Quality guaranteed" },
                  { icon: "↩️", text: "Easy returns" },
                ].map((badge) => (
                  <span
                    key={badge.text}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur"
                  >
                    <span>{badge.icon}</span>
                    {badge.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — Dynamic Featured Product Card */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-cyan-400/20 via-indigo-400/30 to-fuchsia-500/20 blur-2xl" />
              <div className="soft-card relative overflow-hidden border-white/10 bg-white/8 p-5 shadow-2xl">
                {heroProduct ? (
                  <div className="rounded-[2rem] bg-slate-950 p-5 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-300">
                          {featuredProducts.length > 1 ? "✨ Featured" : "🔥 Best seller"}
                        </p>
                        <h3 className="mt-1 line-clamp-1 text-2xl font-bold">
                          {heroProduct.name}
                        </h3>
                      </div>
                      <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-300">
                        {heroProduct.rating > 0
                          ? `${heroProduct.rating}/5`
                          : "New"}
                      </div>
                    </div>

                    {/* Product Image or Gradient */}
                    <div className="mt-5 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500">
                      {heroProduct.images?.length > 0 ? (
                        <img
                          src={heroProduct.images[0]}
                          alt={heroProduct.name}
                          className="h-48 w-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-48 items-center justify-center p-6">
                          <div className="text-center">
                            <p className="text-sm text-indigo-100">From</p>
                            <p className="mt-1 text-4xl font-black">
                              {formatPrice(heroProduct.price)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Price</p>
                        <p className="text-2xl font-black text-indigo-400">
                          {formatPrice(heroProduct.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/products/${heroProduct._id}`)}
                        className="rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                      >
                        View details →
                      </button>
                    </div>

                    {/* Hero product pagination dots */}
                    {featuredProducts.length > 1 && (
                      <div className="mt-4 flex justify-center gap-2">
                        {featuredProducts.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setHeroProductIndex(i)}
                            className={`h-2 rounded-full transition-all ${
                              i === heroProductIndex
                                ? "w-6 bg-indigo-400"
                                : "w-2 bg-slate-600 hover:bg-slate-500"
                            }`}
                            aria-label={`Show product ${i + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-[2rem] bg-slate-950 p-8 text-center text-white">
                    <div className="mx-auto h-48 w-48 animate-pulse rounded-2xl bg-slate-800" />
                    <div className="mt-4 h-6 w-3/4 mx-auto animate-pulse rounded bg-slate-800" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          STATS SECTION — Animated counters
      ═══════════════════════════════════════════ */}
      <section
        ref={statsFade.ref}
        className={`border-b border-slate-200 bg-white/50 py-12 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50 transition-all duration-700 ${
          statsFade.visible
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
        }`}
      >
        <div className="section-shell">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              {
                value: stat1.count,
                ref: stat1.ref,
                suffix: "+",
                label: "Products",
                icon: "📦",
              },
              {
                value: stat2.count,
                ref: stat2.ref,
                suffix: "+",
                label: "Happy customers",
                icon: "😊",
              },
              {
                value: stat3.count,
                ref: stat3.ref,
                suffix: "%",
                label: "Satisfaction rate",
                icon: "⭐",
              },
              {
                value: categories.length || 4,
                label: "Categories",
                icon: "🏷️",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                ref={stat.ref}
                className="text-center"
              >
                <div className="text-3xl">{stat.icon}</div>
                <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">
                  {stat.value}
                  {stat.suffix || ""}
                </div>
                <div className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CATEGORIES — Dynamic from API
      ═══════════════════════════════════════════ */}
      <section
        ref={categoriesFade.ref}
        className={`section-shell py-16 transition-all duration-700 ${
          categoriesFade.visible
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
        }`}
      >
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            Shop by category
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Curated for every need
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 dark:text-slate-300">
            Browse our collections organized by category — find exactly what
            you&apos;re looking for.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {(categories.length > 0
            ? categories.slice(0, 8)
            : [
                { name: "Smart Devices", _id: "1" },
                { name: "Audio", _id: "2" },
                { name: "Accessories", _id: "3" },
                { name: "Office", _id: "4" },
              ]
          ).map((category, index) => {
            const catName =
              typeof category === "string" ? category : category.name;
            const isSelected = selectedCategory === catName;
            const icon =
              category.icon ||
              categoryIcons[catName.toLowerCase()] ||
              "🏷️";
            const gradient =
              categoryGradients[index % categoryGradients.length];

            return (
              <button
                key={category._id || catName}
                onClick={() => handleCategoryClick(catName)}
                className={`soft-card group overflow-hidden p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isSelected
                    ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900"
                    : ""
                }`}
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl shadow-lg transition-transform duration-300 group-hover:scale-110`}
                >
                  {icon}
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                  {catName}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {category.description ||
                    "Handpicked essentials for a smarter lifestyle."}
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400">
                  {isSelected ? "✓ Selected" : "Explore collection →"}
                </span>
              </button>
            );
          })}
        </div>

        {selectedCategory && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setSelectedCategory("");
                setCurrentPage(1);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear filter: {selectedCategory}
            </button>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════
          PRODUCTS GRID — Dynamic with live filtering
      ═══════════════════════════════════════════ */}
      <section
        id="products"
        ref={productsFade.ref}
        className={`section-shell py-16 sm:py-20 transition-all duration-700 ${
          productsFade.visible
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
        }`}
      >
        <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              {selectedCategory ? selectedCategory : "Featured collection"}
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : selectedCategory
                  ? `${selectedCategory} Products`
                  : "Premium picks for everyday living"}
            </h2>
            {totalProducts > 0 && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Showing {products.length} of {totalProducts} products
              </p>
            )}
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-5 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
          >
            View all products
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {productsQuery.isFetching && products.length > 0 && (
          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
            <svg
              className="h-4 w-4 animate-spin"
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Updating results...
          </div>
        )}

        {products.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mb-4 text-6xl">🔍</div>
            <p className="text-xl font-semibold text-slate-700 dark:text-slate-200">
              No products found
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search term.`
                : "Check back later for new additions."}
            </p>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setCurrentPage(1);
                }}
                className="mt-6 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product, index) => (
              <div
                key={product._id}
                className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/80 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(79,70,229,0.14)] dark:border-slate-700 dark:bg-slate-900/80"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Product Image */}
                <Link
                  to={`/products/${product._id}`}
                  className="relative block h-60 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800"
                >
                  {Array.isArray(product.images) &&
                  product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      loading="lazy"
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

                  {/* Badges */}
                  <div className="absolute left-3 top-3 flex flex-col gap-2">
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow">
                        Low stock
                      </span>
                    )}
                    {product.createdAt &&
                      new Date(product.createdAt) >
                        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                        <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow">
                          New
                        </span>
                      )}
                  </div>

                  {product.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
                      <span className="text-lg font-bold text-white">
                        Out of stock
                      </span>
                    </div>
                  )}
                </Link>

                {/* Product Info */}
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {product.category || "Featured"}
                    </span>
                    <div className="flex items-center gap-1">
                      <StarRating rating={product.rating || 0} />
                      {product.rating > 0 && (
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {product.rating}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link to={`/products/${product._id}`}>
                    <h3 className="mb-2 line-clamp-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                      {product.name}
                    </h3>
                  </Link>

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
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95"
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
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
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

        {/* Pagination */}
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

      {/* ═══════════════════════════════════════════
          WHY CHOOSE US — Features section
      ═══════════════════════════════════════════ */}
      <section className="border-y border-slate-200 bg-white/50 py-16 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50">
        <div className="section-shell">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              Why choose us
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Shopping made simple
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: (
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                ),
                title: "Fast Delivery",
                description:
                  "Get your orders delivered quickly with our reliable logistics partners across the country.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: (
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Secure Payments",
                description:
                  "Your transactions are protected with industry-standard encryption and secure payment gateways.",
                color: "from-emerald-500 to-teal-500",
              },
              {
                icon: (
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
                title: "Quality Guarantee",
                description:
                  "Every product is verified for quality. Not satisfied? We offer hassle-free returns and refunds.",
                color: "from-rose-500 to-pink-500",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="soft-card group p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                >
                  {feature.icon}
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA — Create Account / Start Shopping
      ═══════════════════════════════════════════ */}
      {!user && (
        <section
          ref={ctaFade.ref}
          className={`relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 py-20 dark:from-indigo-900 dark:to-violet-900 transition-all duration-700 ${
            ctaFade.visible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/20 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
              <span className="text-lg">🎉</span>
              Join thousands of happy customers
            </div>
            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
              Ready to start shopping?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-indigo-100">
              Create your free account today and unlock exclusive deals, fast
              checkout, and personalized recommendations.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => navigate("/register")}
                className="rounded-full bg-white px-8 py-4 text-lg font-bold text-indigo-700 shadow-xl transition hover:-translate-y-0.5 hover:bg-indigo-50 hover:shadow-2xl active:translate-y-0"
              >
                Create free account →
              </button>
              <button
                onClick={() => navigate("/login")}
                className="rounded-full border border-white/40 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                Sign in
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
