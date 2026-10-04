import { useState, useEffect, useCallback } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../api/productApi";
import { bulkImportProducts, uploadFile } from "../../api/adminApi";
import Pagination from "../../components/Pagination";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import useFeedback from "../../hooks/useFeedback";
import { formatPrice } from "../../utils/formatters";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const { notify, confirm } = useFeedback();

  // Import Modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [importing, setImporting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: 0,
    image: "",
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts({ page: currentPage, limit });
      setProducts(data.items);
      setTotalPages(data.pages);
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingImage(true);
      try {
        const res = await uploadFile(file);
        // The backend returns the URL of the uploaded image. We might need to prepend the backend base URL or assume the backend URL is prepended.
        // Assuming res.image is "/uploads/file.png"
        const imageUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${res.image}` : `http://localhost:5000${res.image}`;
        setNewProduct((prev) => ({ ...prev, image: imageUrl }));
        notify("Image uploaded successfully");
      } catch (err) {
        notify(err?.response?.data?.message || "Failed to upload image", "error");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name || "",
      price: product.price || "",
      description: product.description || "",
      category: product.category || "",
      stock: product.stock || 0,
      image: product.images?.[0] || product.image || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setNewProduct({
      name: "",
      price: "",
      description: "",
      category: "",
      stock: 0,
      image: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, newProduct);
        notify("Product updated");
      } else {
        await createProduct(newProduct);
        notify("Product created");
      }
      handleCancelEdit();
      fetchProducts();
    } catch (err) {
      notify(err.response?.data?.message || "Operation failed", "error");
    }
  };

  const handleDelete = async (id) => {
    const accepted = await confirm({
      title: "Delete this product?",
      message: "This action cannot be undone.",
      confirmLabel: "Delete product",
    });
    if (!accepted) return;

    try {
      await deleteProduct(id);
      fetchProducts();
      notify("Product deleted");
    } catch (err) {
      notify(
        err.response?.data?.message || "Failed to delete product",
        "error",
      );
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!products.length) return;
    const headers = ["ID", "Name", "Category", "Price", "Stock", "Description"];
    const rows = products.map((p) => [
      `"${p._id}"`,
      `"${(p.name || "").replace(/"/g, '""')}"`,
      `"${(p.category || "").replace(/"/g, '""')}"`,
      p.price,
      p.stock,
      `"${(p.description || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `products_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify("Exported products to CSV");
  };

  // Handle Bulk Import
  const handleBulkImport = async () => {
    try {
      const parsed = JSON.parse(importJsonText);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      if (!items.length) {
        notify("No products found in JSON", "error");
        return;
      }
      setImporting(true);
      const res = await bulkImportProducts(items);
      notify(res.message || "Products imported successfully");
      setIsImportModalOpen(false);
      setImportJsonText("");
      fetchProducts();
    } catch (err) {
      notify(err.message || "Invalid JSON syntax. Please enter a valid JSON array of products.", "error");
    } finally {
      setImporting(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">
            Product Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage catalog, add listings, or perform batch import/export</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-xs shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md hover:bg-indigo-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Bulk Import JSON
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">
          {editingProduct ? "Edit Product" : "Add New Product"}
        </h3>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            name="name"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={handleChange}
            required
            className="input"
          />

          <input
            name="price"
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={handleChange}
            required
            className="input"
          />

          <input
            name="category"
            placeholder="Category"
            value={newProduct.category}
            onChange={handleChange}
            required
            className="input"
          />

          <input
            name="stock"
            type="number"
            placeholder="Stock Quantity"
            value={newProduct.stock}
            onChange={handleChange}
            required
            className="input"
          />

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Product Image
            </label>
            <input
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploadingImage}
              className="w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-xl file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400
                focus:outline-none"
            />
            {uploadingImage && <p className="text-xs text-indigo-500">Uploading...</p>}
            {newProduct.image && !uploadingImage && (
              <p className="text-xs text-green-500">Image uploaded and ready.</p>
            )}
          </div>

          <textarea
            name="description"
            placeholder="Product Description"
            value={newProduct.description}
            onChange={handleChange}
            className="input md:col-span-2 h-28 resize-none"
          />

          <div className="flex gap-3 md:col-span-2">
            <button className="btn-primary">
              {editingProduct ? "Update Product" : "Create Product"}
            </button>
            {editingProduct && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p._id}
                className="border-t border-gray-200 dark:border-gray-800 hover:bg-indigo-50/50 dark:hover:bg-gray-800/60 transition"
              >
                <td className="px-6 py-4 font-medium">{p.name}</td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg">
                    {p.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-center font-bold">
                  {formatPrice(p.price)}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.stock === 0 ? "bg-red-100 text-red-700" : p.stock <= 5 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleEdit(p)} className="btn-outline">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        hasPrevPage={currentPage > 1}
        hasNextPage={currentPage < totalPages}
      />

      {/* Bulk Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Bulk Import Products (JSON)
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Paste a JSON array of product objects with fields: name, price, category, stock, description.
            </p>

            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='[{"name": "Wireless Mouse", "price": 25, "category": "Electronics", "stock": 50}]'
              className="w-full p-4 font-mono text-xs rounded-2xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={importing || !importJsonText.trim()}
                onClick={handleBulkImport}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {importing ? "Importing..." : "Start Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
