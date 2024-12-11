import React, { useEffect, useState } from "react";
import ManagerService from "../../../Services/managerService";

const ViewProducts = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadProducts = async () => {
    await ManagerService.getProducts().then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        console.log(data.data.products);
        setProducts(data.data.products);
      }
    });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleInactivate = async (productId) => {
    try {
      const response = await ManagerService.inactivateProduct(productId);
      if (response.error) {
        console.error("Error inactivating product:", response.error);
        alert("Failed to inactivate product");
        return;
      }
      alert("Product status updated successfully");
      loadProducts(); // Reload products to update the list
    } catch (error) {
      console.error("Error inactivating product:", error);
      alert("Failed to inactivate product");
    }
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5">
        {products.map((product, index) => (
          <div
            key={index}
            className="relative w-full p-5 rounded-lg shadow-md gap-5 justify-between card border-dashed border-2 border-gray-300 cursor-pointer hover:border-blue-500 transition-all"
          >
            <div className="flex items-center justify-between p-5 pb-2">
              <div className="flex items-center w-1/2 justify-start">
                <img
                  src={product.image}
                  alt="product"
                  className="h-36 object-cover rounded-full mb-3 w-2/3"
                />
              </div>
              <div className="w-1/2">
                <p className="text-primary font-bold text-3xl mb-2">
                  {product.name}
                </p>
                <p className="text-md mb-3">{product.description}</p>
                <p className="text-2xl mb-3">PKR{product.price}/-</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(product)}
                    className="btn btn-primary bg-primary hover:bg-green-900"
                  >
                    View Details
                  </button>
                  {
                    <button
                      onClick={() => handleInactivate(product._id)}
                      className={`btn btn-primary bg-primary hover:bg-green-900 ${
                        product.status ? "bg-red-500" : "bg-green-500"
                      }`}
                    >
                      {product.status ? "Inactivate" : "Activate"}
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Details Modal */}
      <dialog
        id="product_modal"
        className={`modal ${modalOpen ? "modal-open" : ""}`}
      >
        <div className="modal-box w-11/12 max-w-3xl">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setModalOpen(false)}
            >
              ✕
            </button>
          </form>
          {selectedProduct && (
            <div className="p-4">
              <div className="flex gap-6">
                <div className="w-1/3">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div className="w-2/3">
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {selectedProduct.description}
                  </p>
                  <p className="text-xl font-semibold mb-4">
                    PKR {selectedProduct.price}/-
                  </p>
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold mb-2">Status</h4>
                    <p>{selectedProduct.status ? "Active" : "Inactive"}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Ingredients</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedProduct.ingredients.map((ing, index) => (
                        <div
                          key={index}
                          className="bg-gray-100 p-3 rounded-lg flex justify-between items-center"
                        >
                          <span className="font-medium">
                            {ing.ingredient.ingredient_name || "N/A"}
                          </span>
                          <span className="text-gray-600">
                            {ing.quantity || 0} units
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-action">
                <button
                  className="btn btn-primary bg-primary hover:bg-green-900"
                  onClick={() => setModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
};

export default ViewProducts;
