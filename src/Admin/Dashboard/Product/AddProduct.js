import React, { useEffect, useState } from "react";
import ManagerService from "../../../Services/managerService";
import AdminService from "../../../Services/adminService";

const AddProduct = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  const clearForm = () => {
    setName("");
    setImage("");
    setDescription("");
    setCategory("");
    setPrice("");
    setSelectedIngredients([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(name, image, description, category, price, selectedIngredients);

    // Check if all selected ingredients have quantities
    const hasInvalidQuantity = selectedIngredients.some(
      (item) => !item.quantity || item.quantity <= 0
    );
    if (
      !name ||
      !image ||
      !description ||
      !price ||
      selectedIngredients.length === 0 ||
      hasInvalidQuantity
    ) {
      alert(
        "Please fill all the fields, select at least one ingredient, and specify quantities"
      );
      return;
    }

    var formData = new FormData();

    formData.append("name", name);
    formData.append("image", image);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("price", price);

    // Format ingredients data as expected by the schema
    const ingredientsData = selectedIngredients.map((item) => ({
      ingredient: item.ingredient,
      quantity: item.quantity,
    }));

    formData.append("ingredients", JSON.stringify(ingredientsData));

    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    await ManagerService.addProduct(formData).then((data) => {
      if (data.error) {
        console.log(data.error);
        alert(data.error.message);
        return;
      } else {
        alert("Product added successfully");
        console.log(data.data);
      }

      clearForm();
    });
  };

  const handleIngredientToggle = (ingredient) => {
    setSelectedIngredients((prev) => {
      const exists = prev.find((item) => item.ingredient === ingredient._id);
      if (exists) {
        return prev.filter((item) => item.ingredient !== ingredient._id);
      } else {
        return [
          ...prev,
          {
            ingredient: ingredient._id,
            quantity: 1,
            name: ingredient.ingredient_name, // for display purposes
          },
        ];
      }
    });
  };

  const handleQuantityChange = (ingredientId, quantity) => {
    setSelectedIngredients((prev) =>
      prev.map((item) =>
        item.ingredient === ingredientId
          ? { ...item, quantity: Number(quantity) }
          : item
      )
    );
  };

  const getIngredients = async () => {
    await ManagerService.getIngredients().then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        setIngredients(data.data.ingredients);
      }
    });
  };

  useEffect(() => {
    getIngredients();
  }, []);

  return (
    <form className="p-20 min-h-screen">
      <h1 className="text-2xl text-blue-500 mb-2">Add Product</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        Fill in the details to add a new product
      </p>
      <div className="relative z-0 w-full mb-5 group">
        <input
          type="name"
          name="floating_name"
          id="floating_name"
          className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          placeholder=" "
          required
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <label
          htmlFor="floating_name"
          className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
        >
          Product Name
        </label>
      </div>
      <div className="relative z-0 w-full mb-5 group">
        <input
          type="file"
          name="floating_image"
          id="floating_image"
          className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          placeholder=" "
          required
          onChange={(e) => setImage(e.target.files[0])}
        />
        <label
          htmlFor="floating_image"
          className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
        >
          Product Image
        </label>
      </div>
      <div className="relative z-0 w-full mb-5 group">
        <input
          type="text"
          name="floating_description"
          id="floating_description"
          className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          placeholder=" "
          required
          onChange={(e) => setDescription(e.target.value)}
          value={description}
        />
        <label
          htmlFor="floating_description"
          className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
        >
          Product Description
        </label>
      </div>
      <div className="relative z-0 w-full mb-5 group">
        <select
          name="floating_category"
          id="floating_category"
          className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          required
          onChange={(e) => setCategory(e.target.value)}
          value={category}
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category._id} value={category.category_name}>
              {category.category_name}
            </option>
          ))}
        </select>
        <label
          htmlFor="floating_category"
          className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
        >
          Category
        </label>
      </div>
      <div className="relative z-0 w-full mb-5 group">
        <input
          type="number"
          name="floating_price"
          id="floating_price"
          className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          placeholder=" "
          required
          onChange={(e) => setPrice(e.target.value)}
          value={price}
        />
        <label
          htmlFor="floating_price"
          className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
        >
          Price
        </label>
      </div>

      {/* Updated Ingredients Selection with Quantities */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Ingredients and Quantities
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ingredients &&
            ingredients.map((ingredient) => (
              <div
                key={ingredient._id}
                className="flex flex-col space-y-2 p-4 border rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={ingredient._id}
                      checked={selectedIngredients.some(
                        (item) => item.ingredient === ingredient._id
                      )}
                      onChange={() => handleIngredientToggle(ingredient)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor={ingredient._id}
                      className="ml-2 block text-sm text-gray-900"
                    >
                      {ingredient.ingredient_name}
                    </label>
                  </div>
                </div>
                {selectedIngredients.some(
                  (item) => item.ingredient === ingredient._id
                ) && (
                  <div className="flex items-center space-x-2 ml-6">
                    <input
                      type="number"
                      min="1"
                      value={
                        selectedIngredients.find(
                          (item) => item.ingredient === ingredient._id
                        )?.quantity || 1
                      }
                      onChange={(e) =>
                        handleQuantityChange(ingredient._id, e.target.value)
                      }
                      className="block w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Qty"
                    />
                    <span className="text-sm text-gray-500">units</span>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 mt-10 bg-blue-500 rounded-md text-white text-sm hover:bg-blue-600"
        onClick={handleSubmit}
      >
        Add Product
      </button>
    </form>
  );
};

export default AddProduct;
