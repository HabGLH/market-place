import { useState, useEffect } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../api/productApi";
import Pagination from "../../components/Pagination";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import { formatPrice } from "../../utils/formatters";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts({ page: currentPage, limit });

      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
        setTotalPages(
          data.totalPages ||
            Math.ceil((data.totalCount || data.count) / limit) ||
            1
        );
      } else if (Array.isArray(data)) {
        // Fallback if API returns just array
        // Client side pagination fallback could go here if needed
        setProducts(data);
        setTotalPages(1);
      } else {
        setProducts([]);
        setTotalPages(1);
      }
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({ ...product });
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
      } else {
        await createProduct(newProduct);
      }
      handleCancelEdit();
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await deleteProduct(id);
    fetchProducts();
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Page Title */}
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
        Product Management
      </h2>

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

          <input
            name="image"
            placeholder="Image URL"
            value={newProduct.image}
            onChange={handleChange}
            className="input md:col-span-2"
          />

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
                  {formatPrice(p.price)}
                </td>
                <td className="px-6 py-4 text-center">{p.stock}</td>
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
    </div>
  );
};

export default Products;
