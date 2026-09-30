import { useState, useEffect } from "react";
import { getProducts } from "../../api/productApi";
import { addToCart } from "../../api/cartApi";
import useAuth from "../../auth/useAuth";
import Pagination from "../../components/Pagination";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import { formatPrice } from "../../utils/formatters";
import { useNavigate } from "react-router-dom";

// Format currency helper

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8; // Limit products per page to save memory

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = {
          page: currentPage,
          limit: limit,
          category: filter !== "all" ? filter : undefined,
        };
        const data = await getProducts(queryParams);

        // Handle different possible response structures
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
          setTotalPages(
            data.totalPages ||
              Math.ceil((data.totalCount || data.count) / limit) ||
              1
          );
        } else if (Array.isArray(data)) {
          // Fallback if API returns just array (handle client-side pagination if needed, but safer to assume slice)
          setProducts(data);
          setTotalPages(1);
        } else if (data.data && Array.isArray(data.data)) {
          setProducts(data.data);
          setTotalPages(data.last_page || 1);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, filter]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setAddingId(product._id);
    try {
      await addToCart(product._id, 1);
      // TODO: Replace with toast notification
      alert("Added to cart!");
    } catch (err) {
      alert(
        "Failed to add to cart: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setAddingId(null);
    }
  };

  // Filter products (placeholder for real categories)
  const filteredProducts = products.filter((product) => {
    if (filter === "all") return true;
    // Add real category filtering when backend supports it
    return true;
  });

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Welcome to <span className="text-yellow-300">TechBrand</span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Discover amazing products at unbeatable prices. Your journey to
              perfect shopping starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="#products"
                className="px-8 py-4 bg-white text-indigo-600 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
              >
                Shop Now
              </a>
              {!user && (
                <button
                  onClick={() => navigate("/register")}
                  className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-all hover:scale-105"
                >
                  Join Free
                </button>
              )}
            </div>
          </div>

          {/* Stats/Features */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: "🚚",
                title: "Free Shipping",
                desc: "On orders over $50",
              },
              { icon: "🔒", title: "Secure Payment", desc: "100% protected" },
              { icon: "⚡", title: "Fast Delivery", desc: "2-3 business days" },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/80">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-12 sm:h-20"
          >
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              className="fill-gray-50 dark:fill-gray-900"
            />
          </svg>
        </div>
      </section>

      {/* Products Section */}
      <section
        id="products"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore our curated collection of premium products
          </p>
        </div>

        {/* Filter Tabs (placeholder) */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {["all", "featured", "new", "sale"].map((category) => (
            <button
              key={category}
              onClick={() => {
                setFilter(category);
                setCurrentPage(1); // Reset to first page on filter change
              }}
              className={`px-6 py-2.5 rounded-full font-medium transition-all capitalize ${
                filter === category
                  ? "bg-indigo-600 text-white shadow-lg scale-105"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛍️</div>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No products available yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
              >
                {/* Product Image */}
                <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
                  {Array.isArray(product.images) &&
                  product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-20 h-20 text-gray-400 dark:text-gray-500"
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

                  {/* Stock Badge */}
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Only {product.stock} left
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-lg font-bold">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {product.name}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {product.description || "Premium quality product"}
                  </p>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingId === product._id || product.stock <= 0}
                      className={`px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                        product.stock > 0
                          ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-md hover:shadow-lg"
                          : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {addingId === product._id ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
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
                            className="w-5 h-5"
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
                        "Sold Out"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          hasPrevPage={currentPage > 1}
          hasNextPage={currentPage < totalPages}
        />
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Start Shopping?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of happy customers today
            </p>
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 bg-white text-indigo-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
            >
              Create Free Account
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
