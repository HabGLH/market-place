import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getCategories } from "../../api/adminApi";
import { getProducts } from "../../api/productApi";
import ErrorMessage from "../../components/ErrorMessage";
import Loader from "../../components/Loader";
import { useEffect } from "react";

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

const CategoriesPage = () => {
  useEffect(() => {
    document.title = "TechBrand | Categories";
  }, []);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const productsQuery = useQuery({
    queryKey: ["products-for-categories"],
    queryFn: () => getProducts({ limit: 100 }),
  });

  if (categoriesQuery.isPending && productsQuery.isPending) {
    return <Loader />;
  }

  if (categoriesQuery.isError && productsQuery.isError) {
    return <ErrorMessage message="Failed to load marketplace categories." />;
  }

  // Extract categories from API + fall back to unique categories in products list
  const apiCategories = Array.isArray(categoriesQuery.data)
    ? categoriesQuery.data.filter((c) => c.isActive !== false)
    : [];

  const products = productsQuery.data?.items ?? [];
  const productCategoryCounts = {};
  products.forEach((p) => {
    if (p.category) {
      productCategoryCounts[p.category] =
        (productCategoryCounts[p.category] || 0) + 1;
    }
  });

  // Combine category list
  const combinedMap = new Map();

  apiCategories.forEach((cat) => {
    const key = cat.name.toLowerCase();
    combinedMap.set(key, {
      id: cat._id,
      name: cat.name,
      slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: cat.description || "Discover high-performance gadgets and gear.",
      icon: cat.icon || categoryIcons[key] || "🏷️",
      productCount: cat.productCount || productCategoryCounts[cat.name] || 0,
      image: cat.image,
    });
  });

  // Add any product categories not present in API categories table
  Object.keys(productCategoryCounts).forEach((catName) => {
    const key = catName.toLowerCase();
    if (!combinedMap.has(key)) {
      combinedMap.set(key, {
        id: key,
        name: catName,
        slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: "Explore items in this category.",
        icon: categoryIcons[key] || "📦",
        productCount: productCategoryCounts[catName],
      });
    }
  });

  const categoriesList = Array.from(combinedMap.values());

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header / Breadcrumb */}
        <div className="mb-10 text-center sm:text-left">
          <nav className="mb-3 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Link to="/" className="hover:underline">
              Home
            </Link>{" "}
            / <span className="text-slate-500 dark:text-slate-400">Categories</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Explore Product Categories
          </h1>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-300 max-w-2xl">
            Browse our full range of technology, audio, home essentials, and smart devices.
          </p>
        </div>

        {categoriesList.length === 0 ? (
          <div className="soft-card p-12 text-center">
            <div className="text-5xl mb-4">🏷️</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              No categories available yet
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Check back soon as we expand our selection.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoriesList.map((category, index) => {
              const gradient =
                categoryGradients[index % categoryGradients.length];

              return (
                <Link
                  key={category.id || category.slug}
                  to={`/categories/${encodeURIComponent(category.slug)}`}
                  className="soft-card group overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl shadow-lg transition-transform duration-300 group-hover:scale-110`}
                      >
                        {category.icon}
                      </div>
                      <span className="rounded-full bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {category.productCount}{" "}
                        {category.productCount === 1 ? "item" : "items"}
                      </span>
                    </div>

                    <h2 className="mt-6 text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {category.name}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    <span>Shop category</span>
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default CategoriesPage;
