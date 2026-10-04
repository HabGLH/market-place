import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addToCart } from "../../api/cartApi";
import { getProductById, getProducts } from "../../api/productApi";
import ErrorMessage from "../../components/ErrorMessage";
import Loader from "../../components/Loader";
import useAuth from "../../auth/useAuth";
import useFeedback from "../../hooks/useFeedback";
import { formatPrice } from "../../utils/formatters";

const StarRating = ({ rating = 0 }) => (
  <div className="flex items-center gap-1">
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
    {rating > 0 && (
      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
        {rating.toFixed(1)}
      </span>
    )}
  </div>
);

const ProductDetailPage = () => {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useFeedback();

  const productQuery = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  });

  const product = productQuery.data;

  useEffect(() => {
    if (product?.name) {
      document.title = `TechBrand | ${product.name}`;
    }
  }, [product?.name]);

  // Fetch related products in the same category
  const relatedQuery = useQuery({
    queryKey: ["related-products", product?.category],
    queryFn: () => getProducts({ category: product.category, limit: 5 }),
    enabled: Boolean(product?.category),
  });

  const addMutation = useMutation({
    mutationFn: () => addToCart(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      notify(`Added ${quantity} item(s) to cart ✓`);
    },
    onError: (error) =>
      notify(
        error.response?.data?.message || "Could not add item to cart",
        "error"
      ),
  });

  if (productQuery.isPending) return <Loader />;
  if (productQuery.isError || !product) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-16 px-4">
        <ErrorMessage message="This product could not be loaded." />
        <div className="mt-6 text-center">
          <Link
            to="/products"
            className="inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700"
          >
            ← Return to Products
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [];
  const currentImage = images[activeImage] || null;

  const relatedProducts = (relatedQuery.data?.items ?? []).filter(
    (p) => p._id !== product._id
  );

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-6 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <Link to="/" className="hover:underline">
            Home
          </Link>{" "}
          /{" "}
          <Link to="/products" className="hover:underline">
            Products
          </Link>{" "}
          /{" "}
          {product.category && (
            <>
              <Link
                to={`/categories/${encodeURIComponent(
                  product.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                )}`}
                className="hover:underline"
              >
                {product.category}
              </Link>{" "}
              /{" "}
            </>
          )}
          <span className="text-slate-500 dark:text-slate-400 line-clamp-1 inline-block max-w-[200px] align-bottom">
            {product.name}
          </span>
        </nav>

        {/* Top Product Details */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
          {/* Gallery Section */}
          <section aria-label="Product Gallery" className="space-y-4">
            <div className="soft-card overflow-hidden p-4 bg-white dark:bg-slate-900">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={`${product.name} - View ${activeImage + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-slate-400 text-sm">No product image</div>
                )}
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="absolute top-4 left-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow uppercase tracking-wider">
                    Low Stock ({product.stock} left)
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((src, index) => (
                  <button
                    type="button"
                    key={src + index}
                    onClick={() => setActiveImage(index)}
                    className={`h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      activeImage === index
                        ? "border-indigo-600 shadow"
                        : "border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                    }`}
                  >
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Product Purchasing Box */}
          <section className="soft-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-indigo-50 dark:bg-indigo-900/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                {product.category || "General"}
              </span>
              {product.stock > 0 ? (
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  In Stock
                </span>
              ) : (
                <span className="rounded-full bg-red-50 dark:bg-red-950/40 px-3 py-1 text-xs font-bold text-red-700 dark:text-red-400">
                  Out of Stock
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {product.name}
              </h1>
              {product.rating > 0 && (
                <div className="mt-2">
                  <StarRating rating={product.rating} />
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Inclusive of all taxes
              </span>
            </div>

            {/* Quantity Selector & Add to Cart */}
            {product.stock > 0 && (
              <div className="space-y-4 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 rounded-l-xl disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="px-4 text-sm font-bold text-slate-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= product.stock}
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stock, q + 1))
                      }
                      className="px-3 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 rounded-r-xl disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-500">
                    Max: {product.stock}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={addMutation.isPending}
                  onClick={() => {
                    if (!user) return navigate("/login");
                    addMutation.mutate();
                  }}
                  className="w-full rounded-2xl bg-indigo-600 py-3.5 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition disabled:opacity-60"
                >
                  {addMutation.isPending ? "Adding to Cart..." : "Add to Cart"}
                </button>
              </div>
            )}

            {/* Value Guarantees */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div className="text-lg mb-1">🚚</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">Express Delivery</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div className="text-lg mb-1">🔒</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">Secure Payment</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div className="text-lg mb-1">🛡️</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">Official Warranty</div>
              </div>
            </div>
          </section>
        </div>

        {/* Detailed Description */}
        <section className="soft-card mt-10 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Product Description
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {product.description || "No detailed description available for this item."}
          </p>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.slice(0, 4).map((rel) => (
                <div
                  key={rel._id}
                  className="group soft-card overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between"
                >
                  <Link to={`/products/${rel._id}`} className="block">
                    <div className="h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      {rel.images?.[0] ? (
                        <img
                          src={rel.images[0]}
                          alt={rel.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-slate-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {rel.name}
                      </h3>
                      <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">
                        {formatPrice(rel.price)}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ProductDetailPage;
