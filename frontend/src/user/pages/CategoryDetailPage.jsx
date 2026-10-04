import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts } from "../../api/productApi";
import { getCategories } from "../../api/adminApi";
import { addToCart } from "../../api/cartApi";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import Pagination from "../../components/Pagination";
import useAuth from "../../auth/useAuth";
import useFeedback from "../../hooks/useFeedback";
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

const CategoryDetailPage = () => {
  const { slug } = useParams();
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { notify } = useFeedback();

  // Fetch all categories to match slug to actual category name
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const categories = Array.isArray(categoriesQuery.data)
    ? categoriesQuery.data
    : [];

  const matchedCategory = categories.find(
    (c) =>
      c.slug === slug ||
      c.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug?.toLowerCase() ||
      c.name?.toLowerCase() === slug?.toLowerCase()
  );

  // If matched, use category name, otherwise convert slug to readable string (e.g. smart-devices -> smart devices)
  const categoryName = matchedCategory
    ? matchedCategory.name
    : slug
    ? decodeURIComponent(slug).replace(/-/g, " ")
    : "";

  useEffect(() => {
    document.title = categoryName
      ? `TechBrand | ${categoryName}`
      : "TechBrand | Category";
  }, [categoryName]);

  // Fetch products filtered by category
  const productsQuery = useQuery({
    queryKey: ["products-category", { category: categoryName, page, limit: 12, q: query, sort }],
    queryFn: () =>
      getProducts({
        category: categoryName,
        page,
        limit: 12,
        q: query || undefined,
        sort,
      }),
    enabled: Boolean(categoryName),
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

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQuery(searchInput.trim());
  };

  if (productsQuery.isPending && !productsQuery.data) {
    return <Loader />;
  }

  if (productsQuery.isError) {
    return <ErrorMessage message="Could not load products for this category." />;
  }

  const items = productsQuery.data?.items ?? [];
  const pages = productsQuery.data?.pages ?? 1;
  const total = productsQuery.data?.total ?? 0;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header & Breadcrumbs */}
        <div className="mb-8">
          <nav className="mb-3 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Link to="/" className="hover:underline">
              Home
            </Link>{" "}
            /{" "}
            <Link to="/categories" className="hover:underline">
              Categories
            </Link>{" "}
            / <span className="text-slate-500 dark:text-slate-400 capitalize">{categoryName}</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white capitalize tracking-tight">
                {categoryName}
              </h1>
              {matchedCategory?.description && (
                <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-2xl text-sm leading-relaxed">
                  {matchedCategory.description}
                </p>
              )}
            </div>
            <span className="rounded-full bg-indigo-50 dark:bg-indigo-900/40 px-4 py-1.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300 w-fit">
              {total} {total === 1 ? "Product" : "Products"}
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <form
          onSubmit={handleSearch}
          className="soft-card mb-8 p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="relative flex-1 w-full">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={`Search in ${categoryName}...`}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-semibold uppercase text-slate-500 shrink-0">
              Sort:
            </label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </form>

        {/* Product Grid */}
        {items.length === 0 ? (
          <div className="soft-card p-12 text-center my-8">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              No products found in {categoryName}
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {query ? `No items matched "${query}".` : "Check back later for new inventory."}
            </p>
            {query && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setQuery("");
                  setPage(1);
                }}
                className="mt-6 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
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
                        No Image
                      </div>
                    )}
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                        Low Stock
                      </span>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
                        <span className="font-bold text-white text-sm">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {product.category}
                      </span>
                      {product.rating > 0 && <StarRating rating={product.rating} />}
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {product.name}
                    </h3>
                  </div>
                </Link>

                <div className="p-5 pt-0 mt-auto">
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {formatPrice(product.price)}
                    </span>
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

        <Pagination currentPage={page} totalPages={pages} onPageChange={setPage} />
      </div>
    </main>
  );
};

export default CategoryDetailPage;
