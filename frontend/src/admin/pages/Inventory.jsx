import { useState, useEffect } from "react";
import { getProducts } from "../../api/productApi";
import { updateProductStock } from "../../api/adminApi";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import { formatPrice } from "../../utils/formatters";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // all, low, out
  const [editingId, setEditingId] = useState(null);
  const [newStock, setNewStock] = useState("");
  const [savingId, setSavingId] = useState(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data?.items || data?.products || (Array.isArray(data) ? data : []));
      setError(null);
    } catch {
      setError("Failed to load inventory details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockUpdate = async (productId) => {
    if (newStock === "" || isNaN(newStock) || Number(newStock) < 0) return;
    try {
      setSavingId(productId);
      await updateProductStock(productId, Number(newStock));
      setEditingId(null);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update stock");
    } finally {
      setSavingId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    if (stockFilter === "low") return p.stock > 0 && p.stock <= 5;
    if (stockFilter === "out") return p.stock === 0;
    return true;
  });

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const totalItemsCount = products.reduce((acc, p) => acc + (p.stock || 0), 0);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-200">Stock Control</span>
          <h1 className="text-3xl font-black mt-1">Inventory & Restock Center</h1>
          <p className="text-amber-100 text-sm mt-1">Monitor product quantities, set alerts, and instantly update stock counts</p>
        </div>
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <div className="text-center px-4">
            <span className="block text-2xl font-black">{totalItemsCount}</span>
            <span className="text-xs text-amber-200 uppercase font-semibold">Total Stock</span>
          </div>
          <div className="h-8 w-px bg-white/20"></div>
          <div className="text-center px-4">
            <span className="block text-2xl font-black text-amber-300">{lowStockCount}</span>
            <span className="text-xs text-amber-200 uppercase font-semibold">Low Alert</span>
          </div>
          <div className="h-8 w-px bg-white/20"></div>
          <div className="text-center px-4">
            <span className="block text-2xl font-black text-red-300">{outOfStockCount}</span>
            <span className="text-xs text-amber-200 uppercase font-semibold">Out of Stock</span>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search inventory by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setStockFilter("all")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              stockFilter === "all"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setStockFilter("low")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              stockFilter === "low"
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                : "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100"
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setStockFilter("out")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              stockFilter === "out"
                ? "bg-red-600 text-white shadow-md shadow-red-500/20"
                : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100"
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="p-4 pl-6">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4 pr-6 text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-gray-500 dark:text-gray-400">
                    No products matched your search or filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">
                              No Img
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white block">{product.name}</span>
                          <span className="text-xs text-gray-400">ID: {product._id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white">
                      {formatPrice(product.price)}
                    </td>
                    <td className="p-4">
                      {product.stock === 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 text-xs font-bold rounded-full">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          Out of Stock
                        </span>
                      ) : product.stock <= 5 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-xs font-bold rounded-full">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                          Low Stock ({product.stock} left)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 text-xs font-bold rounded-full">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          In Stock ({product.stock} available)
                        </span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {editingId === product._id ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            min="0"
                            value={newStock}
                            onChange={(e) => setNewStock(e.target.value)}
                            className="w-20 px-3 py-1.5 rounded-lg border border-amber-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none"
                          />
                          <button
                            onClick={() => handleStockUpdate(product._id)}
                            disabled={savingId === product._id}
                            className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-bold text-xs hover:bg-amber-700 transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(product._id);
                            setNewStock(product.stock);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-200 dark:border-gray-700 hover:border-amber-500 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-xs transition hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        >
                          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Quick Restock
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
