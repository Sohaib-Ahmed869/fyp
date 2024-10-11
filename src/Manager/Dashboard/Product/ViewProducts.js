import React, { useState, useEffect } from "react";
import product from "../../../Assets/product.jpg";
import ManagerService from "../../../Services/managerService";

const ViewProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    ManagerService.getProducts().then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        console.log(data.data);
        setProducts(data.data.products);
      }
    });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5">
      {products.map((product, index) => (
        <div
          key={index}
          className="relative w-full p-5 rounded-lg shadow-md gap-5 justify-between card border-dashed border-2 border-gray-300 cursor-pointer"
        >
          <div className="flex items-center justify-between p-5 pb-2">
            <div className="flex items-center w-1/2 justify-start">
              <img
                src={product.image}
                alt="product"
                className=" h-36 object-cover rounded-full mb-3 w-2/3"
              />
            </div>
            <div className="w-1/2">
              <p className="text-primary font-bold text-3xl mb-2">
                {product.name}
              </p>
              <p className="text-md mb-3">{product.description}</p>
              <p className="text-2xl mb-3">PKR{product.price}/-</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViewProducts;
