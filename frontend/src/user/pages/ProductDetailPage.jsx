import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addToCart } from "../../api/cartApi";
import { getProductById } from "../../api/productApi";
import ErrorMessage from "../../components/ErrorMessage";
import Loader from "../../components/Loader";
import useAuth from "../../auth/useAuth";
import useFeedback from "../../hooks/useFeedback";
import { formatPrice } from "../../utils/formatters";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useFeedback();
  const productQuery = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  });
  const addMutation = useMutation({
    mutationFn: () => addToCart(id, 1),
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

  if (productQuery.isPending) return <Loader />;
  if (productQuery.isError) {
    return <ErrorMessage message="This product could not be loaded." />;
  }

  const product = productQuery.data;
  const images = product.images?.length ? product.images : [];
  const image = images[activeImage];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 pb-16 pt-24 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
        >
          <span aria-hidden="true">←</span>
          Back to products
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
          <section aria-label="Product gallery" className="space-y-4">
            <div className="soft-card overflow-hidden p-4">
              <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                {image ? (
                  <img
                    src={image}
                    alt={`${product.name}, image ${activeImage + 1}`}
                    width="960"
                    height="720"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-gray-500">
                    No product image
                  </div>
                )}
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((src, index) => (
                  <button
                    type="button"
                    key={src}
                    onClick={() => setActiveImage(index)}
                    aria-label={`Show product image ${index + 1}`}
                    aria-pressed={activeImage === index}
                    className={`h-20 w-24 shrink-0 overflow-hidden rounded-2xl border-2 transition ${activeImage === index ? "border-indigo-600 shadow-md" : "border-slate-200 hover:border-indigo-300 dark:border-slate-700 dark:hover:border-indigo-400"}`}
                  >
                    <img
                      src={src}
                      alt=""
                      loading="lazy"
                      width="160"
                      height="120"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="soft-card h-fit p-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                {product.category}
              </span>
              {product.stock > 0 ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  In stock
                </span>
              ) : (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
                  Sold out
                </span>
              )}
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {product.name}
            </h1>

            <div className="mt-5 flex items-end gap-3">
              <p className="text-4xl font-black tabular-nums text-slate-900 dark:text-white">
                {formatPrice(product.price)}
              </p>
              <span className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Free delivery over ETB 5,000
              </span>
            </div>

            <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between rounded-2xl bg-slate-100 px-3 py-2 dark:bg-slate-800/80">
                <span>Availability</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {product.stock > 0
                    ? `${product.stock} available`
                    : "Out of stock"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-100 px-3 py-2 dark:bg-slate-800/80">
                <span>Warranty</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  12 months
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={product.stock < 1 || addMutation.isPending}
              onClick={() => {
                if (!user) return navigate("/login");
                addMutation.mutate();
              }}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {addMutation.isPending ? "Adding…" : "Add to cart"}
            </button>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Secure checkout", icon: "🔒" },
                { label: "Fast shipping", icon: "🚚" },
                { label: "Easy returns", icon: "↩️" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-3 text-center text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
                >
                  <div className="mb-1 text-lg">{item.icon}</div>
                  {item.label}
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-10 soft-card p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Product description
              </h2>
              <p className="mt-4 whitespace-pre-line text-base leading-7 text-slate-600 dark:text-slate-300">
                {product.description}
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-gradient-to-br from-slate-900 to-indigo-950 p-5 text-white shadow-xl">
              <p className="text-sm uppercase tracking-[0.18em] text-indigo-200">
                Why customers love it
              </p>
              <ul className="mt-5 space-y-3 text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-indigo-300">✓</span>
                  <span>Premium quality build and materials</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-indigo-300">✓</span>
                  <span>Optimized performance for everyday tasks</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-indigo-300">✓</span>
                  <span>Reliable support and local warranty coverage</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProductDetailPage;
