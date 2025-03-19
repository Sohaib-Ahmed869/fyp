import React, { useState, useEffect } from "react";
import AdminService from "../../../Services/adminService";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load all categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await AdminService.getCategories();
      if (response.error) {
        console.error("Error loading categories:", response.error);
        setError("Failed to load categories");
      } else {
        setCategories(response.data.categories || []);
      }
    } catch (err) {
      console.error("Exception while loading categories:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Reset messages
    setError("");
    setSuccess("");

    // Validate inputs
    if (!categoryName.trim()) {
      setError("Category name is required");
      return;
    }

    setLoading(true);
    try {
      const categoryData = {
        category_name: categoryName,
        description: categoryDescription,
      };

      const response = await AdminService.addCategory(categoryData);

      if (response === "error" || response?.error) {
        setError("Failed to add category. Please try again.");
      } else {
        setSuccess("Category added successfully!");
        // Clear form
        setCategoryName("");
        setCategoryDescription("");
        // Refresh categories list
        loadCategories();
      }
    } catch (err) {
      console.error("Exception while adding category:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">
        Categories Management
      </h1>

      {/* Add Category Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Category</h2>

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4"
            role="alert"
          >
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="categoryName"
            >
              Category Name *
            </label>
            <input
              type="text"
              id="categoryName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="categoryDescription"
            >
              Category Description
            </label>
            <textarea
              id="categoryDescription"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              placeholder="Enter category description"
              rows="3"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Category"}
          </button>
        </form>
      </div>

      {/* View Categories */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All Categories</h2>
          <button
            onClick={loadCategories}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 inline mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <p>Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded">
            <p className="text-gray-500">No categories found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">
                      {category.category_name}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {category.description || "—"}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {category.createdAt
                        ? new Date(category.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
