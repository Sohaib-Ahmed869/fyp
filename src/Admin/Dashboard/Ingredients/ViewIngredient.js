import React, { useEffect, useState } from "react";
import ManagerService from "../../../Services/managerService";

const IngredientsManagement = () => {
  const [ingredients, setIngredients] = useState([]);
  const [ingredientName, setIngredientName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");

  const clearForm = () => {
    setIngredientName("");
    setPrice("");
    setQuantity("");
    setUnit("");
  };

  const loadIngredients = async () => {
    await ManagerService.getIngredients().then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        setIngredients(data.data.ingredients);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if ((!ingredientName || !price || !quantity, !unit)) {
      alert("Please fill all the fields");
      return;
    }

    const ingredientData = {
      ingredient_name: ingredientName,
      price: price,
      quantity: quantity,
      unit: unit,
    };

    await ManagerService.addIngredient(ingredientData).then((data) => {
      if (data.error) {
        console.log(data.error);
        alert(data.error.message);
        return;
      } else {
        alert("Ingredient added successfully");
        loadIngredients();
        clearForm();
      }
    });
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  return (
    <div className="p-20 min-h-screen">
      <div className="mb-10">
        <h1 className="text-2xl text-blue-500 mb-2">Ingredients Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Add new ingredients and view existing ones
        </p>

        {/* Add Ingredient Form */}
        <form className="mb-8">
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="text"
              name="ingredient_name"
              value={ingredientName}
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              required
              onChange={(e) => setIngredientName(e.target.value)}
            />
            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
              Ingredient Name
            </label>
          </div>

          <div className="relative z-0 w-full mb-5 group">
            <input
              type="number"
              name="price"
              value={price}
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              required
              onChange={(e) => setPrice(e.target.value)}
            />
            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
              Price
            </label>
          </div>

          <div className="relative z-0 w-full mb-5 group">
            <input
              type="number"
              name="quantity"
              value={quantity}
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              required
              onChange={(e) => setQuantity(e.target.value)}
            />
            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
              Quantity
            </label>
          </div>

          <div className="relative z-0 w-full mb-5 group">
            <input
              type="text"
              name="unit"
              value={unit}
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              required
              onChange={(e) => setUnit(e.target.value)}
            />
            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
              Unit
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-500 rounded-md text-white text-sm hover:bg-blue-600"
            onClick={handleSubmit}
          >
            Add Ingredient
          </button>
        </form>

        {/* Ingredients List */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Ingredient Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Price
                </th>
                <th scope="col" className="px-6 py-3">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient) => (
                <tr
                  key={ingredient._id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  <td className="px-6 py-4">{ingredient.ingredient_name}</td>
                  <td className="px-6 py-4">${ingredient.price}</td>
                  <td className="px-6 py-4">{ingredient.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IngredientsManagement;
