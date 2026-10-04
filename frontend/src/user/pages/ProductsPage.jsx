import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { addToCart } from "../../api/cartApi";
import { getProducts } from "../../api/productApi";
import { getCategories } from "../../api/adminApi";
import Pagination from "../../components/Pagination";
import useAuth from "../../auth/useAuth";
import useFeedback from "../../hooks/useFeedback";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { formatPrice } from "../../utils/formatters";

const StarRating = ({ rating = 0 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        className={`h-4 w-4 ${
          star <= Math.round(rating)
            ? "text-amber-400"
            : "text-slate-300 dark:text-slate-600"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const ProductSkeleton = () => (
  <div className="soft-card overflow-hidden animate-pulse">
    <div className="h-56 bg-slate-200 dark:bg-slate-800" />
    <div className="p-5 space-y-3">
      <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  </div>
);

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const selectedCategory = searchParams.get("category") || "";

  const [searchInput, setSearchInput] = useState(query);
  const debouncedSearchInput = useDebouncedValue(searchInput);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { notify } = useFeedback();

  useEffect(() => {
    document.title = "TechBrand | All Products";
  }, []);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    const trimmedQuery = debouncedSearchInput.trim();
    if (trimmedQuery === query) return undefined;

    const params = new URLSearchParams(searchParams);
    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    } else {
      params.delete("q");
    }
    setPage(1);
    setSearchParams(params, { replace: true });
  }, [debouncedSearchInput, query, searchParams, setSearchParams]);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const productsQuery = useQuery({
    queryKey: [
      "products",
      { page, limit: 12, q: query, category: selectedCategory, sort },
    ],
    queryFn: () =>
      getProducts({
        page,
        limit: 12,
        q: query || undefined,
        category: selectedCategory || undefined,
        sort,
      }),
  });

  const addMutation = useMutation({
    mutationFn: (productId) => addToCart(productId, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      notify("Added to cart ✓");
    },
    onError: (error) =>
      notify(
        error.response?.data?.message || "Could not add item to cart",
        "error"
      ),
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set("q", searchInput.trim());
    } else {
      params.delete("q");
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (catName) => {
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (catName) {
      params.set("category", catName);
    } else {
      params.delete("category");
    }
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSort("newest");
    setPage(1);
    setSearchParams({});
  };

  const categories = Array.isArray(categoriesQuery.data)
    ? categoriesQuery.data
    : [];

  const items = productsQuery.data?.items ?? [];
  const pages = productsQuery.data?.pages ?? 1;
  const total = productsQuery.data?.total ?? 0;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <nav className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Link to="/" className="hover:underline">
                Home
              </Link>{" "}
              / <span className="text-slate-500 dark:text-slate-400">Products</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Marketplace Catalog
            </h1>
            {query && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Results for <span className="font-semibold">&ldquo;{query}&rdquo;</span>
              </p>
            )}
          </div>
          <span className="rounded-full bg-indigo-50 dark:bg-indigo-900/40 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 w-fit">
            {total} {total === 1 ? "Product" : "Products"} Available
          </span>
        </div>

        {/* Filter Bar */}
        <div className="soft-card mb-8 p-4 sm:p-5">
          <form
            onSubmit={handleSearchSubmit}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end"
          >
            {/* Search Input */}
            <div className="lg:col-span-2">
              <label
                htmlFor="product-search"
                className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
              >
                Search
              </label>
              <div className="relative">
                <input
                  id="product-search"
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Product name or keywords..."
                  className="w-full rounded-xl border border-indigo-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-400"
                />
                <svg
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500 dark:text-indigo-400"
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
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      setPage(1);
                      const params = new URLSearchParams(searchParams);
                      params.delete("q");
                      setSearchParams(params);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                    aria-label="Clear search"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                Results update as you type.
              </p>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>

            {/* Submit & Clear Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition"
              >
                Search
              </button>
              {(query || selectedCategory) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Clear filters"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Loading Skeletons */}
        {productsQuery.isFetching && !productsQuery.isPending && (
          <p
            className="my-4 text-center text-sm font-medium text-indigo-600 dark:text-indigo-400"
            role="status"
            aria-live="polite"
          >
            Updating results…
          </p>
        )}

        {productsQuery.isPending && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 my-8">
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {productsQuery.isError && (
          <div className="soft-card p-12 text-center my-8 border-red-200 dark:border-red-900/30">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Unable to load products
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Please check your internet connection or try refreshing.
            </p>
            <button
              onClick={() => productsQuery.refetch()}
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!productsQuery.isPending &&
          !productsQuery.isFetching &&
          !productsQuery.isError &&
          items.length === 0 && (
          <div className="soft-card p-12 text-center my-8">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              No products found
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {query
                ? `No products matched "${query}". Try searching with another term.`
                : "No items match your active filters."}
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!productsQuery.isPending && !productsQuery.isError && items.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((product) => (
              <div
                key={product._id}
                className="group soft-card overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between"
              >
                <Link to={`/products/${product._id}`} className="block">
                  <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                        No Image Available
                      </div>
                    )}
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow">
                        Low Stock
                      </span>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
                        <span className="font-bold text-white text-sm">Sold Out</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {product.category || "General"}
                      </span>
                      {product.rating > 0 && <StarRating rating={product.rating} />}
                    </div>

                    <h2 className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {product.name}
                    </h2>
                    {product.description && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                </Link>

                <div className="p-5 pt-0 mt-auto">
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={product.stock < 1 || addMutation.isPending}
                      onClick={() => {
                        if (!user) return navigate("/login");
                        addMutation.mutate(product._id);
                      }}
                      className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addMutation.isPending ? "Adding..." : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination currentPage={page} totalPages={pages} onPageChange={setPage} />
      </div>
    </main>
  );
};

export default ProductsPage;
