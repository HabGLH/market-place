import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { addToCart } from "../../api/cartApi";
import { getProducts } from "../../api/productApi";
import ErrorMessage from "../../components/ErrorMessage";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";
import useAuth from "../../auth/useAuth";
import useFeedback from "../../hooks/useFeedback";
import { formatPrice } from "../../utils/formatters";

const ProductsPage = () => {
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { notify } = useFeedback();

  const productsQuery = useQuery({
    queryKey: ["products", { page, limit: 12, q: query, category, sort }],
    queryFn: () => getProducts({ page, limit: 12, q: query, category, sort }),
  });

  const addMutation = useMutation({
    mutationFn: (productId) => addToCart(productId, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      notify("Added to cart");
    },
    onError: (error) =>
      notify(
        error.response?.data?.message || "Could not add this item",
        "error",
      ),
  });

  const submitFilters = (event) => {
    event.preventDefault();
    setPage(1);
    setQuery(searchInput.trim());
    setCategory(categoryInput.trim());
  };

  if (productsQuery.isPending) return <Loader />;
  if (productsQuery.isError) {
    return <ErrorMessage message="Products could not be loaded." />;
  }

  const { items, pages, total } = productsQuery.data;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 pb-5 dark:border-gray-700">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-700 dark:text-emerald-400">
            Shop
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-950 dark:text-white">
            Products
          </h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {total} products
        </p>
      </header>

      <form
        onSubmit={submitFilters}
        className="my-6 grid gap-3 border-b border-gray-200 pb-6 dark:border-gray-700 md:grid-cols-[minmax(14rem,1fr)_minmax(10rem,0.6fr)_12rem_auto]"
      >
        <label className="grid gap-1 text-sm font-medium text-gray-700 dark:text-gray-200">
          Search
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Name or description"
            className="min-h-11 rounded border border-gray-300 bg-white px-3 text-gray-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-gray-700 dark:text-gray-200">
          Category
          <input
            value={categoryInput}
            onChange={(event) => setCategoryInput(event.target.value)}
            placeholder="All categories"
            className="min-h-11 rounded border border-gray-300 bg-white px-3 text-gray-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-gray-700 dark:text-gray-200">
          Sort by
          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
            className="min-h-11 rounded border border-gray-300 bg-white px-3 text-gray-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="name_asc">Name</option>
          </select>
        </label>
        <button className="min-h-11 self-end rounded bg-emerald-800 px-5 font-semibold text-white hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
          Apply
        </button>
      </form>

      {items.length === 0 ? (
        <p className="py-16 text-center text-gray-600 dark:text-gray-300">
          No products match these filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((product) => (
            <article
              key={product._id}
              className="flex min-w-0 flex-col border-b border-gray-200 pb-5 dark:border-gray-700"
            >
              <Link to={`/products/${product._id}`} className="group">
                <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      width="640"
                      height="480"
                      className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-sm text-gray-500">
                      No image
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-gray-950 group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-400">
                      {product.name}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {product.category}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums text-gray-950 dark:text-white">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </Link>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {product.stock > 0
                    ? `${product.stock} available`
                    : "Out of stock"}
                </span>
                <button
                  type="button"
                  disabled={product.stock < 1 || addMutation.isPending}
                  onClick={() => {
                    if (!user) return navigate("/login");
                    addMutation.mutate(product._id);
                  }}
                  aria-label={`Add ${product.name} to cart`}
                  className="rounded border border-emerald-800 px-3 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-400 dark:text-emerald-300 dark:hover:bg-gray-800"
                >
                  Add to cart
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={pages}
        onPageChange={setPage}
      />
    </main>
  );
};

export default ProductsPage;
