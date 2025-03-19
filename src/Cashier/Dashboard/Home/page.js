import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../Redux/Actions";
import { BiPlus } from "react-icons/bi";
import { BiMinus } from "react-icons/bi";
import { BsCart } from "react-icons/bs";
import { HiBadgeCheck } from "react-icons/hi";
import { Modal } from "react-bootstrap";

import CashierService from "../../../Services/cashierService";

const Home = () => {
  const [branchStatus, setBranchStatus] = useState(true);
  const [activeOrders, setActiveOrders] = useState([]);
  const [details, setDetails] = useState({
    customerName: "",
    discount: 0,
    address: "In Branch",
    order_type: "",
    tax: 0,
    payment_method: "",
  });

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [markedCompleted, setMarkedCompleted] = useState(false);
  const [markedDone, setMarkedDone] = useState(false);
  const [filter, setFilter] = useState("");
  const [inBranch, setInBranch] = useState(true);
  const [orderToComplete, setOrderToComplete] = useState("");
  const [cardTax, setCardTax] = useState(0);
  const [cashTax, setCashTax] = useState(0);
  const [feedback, setFeedback] = useState("");

  const [showBranchIsClosed, setShowBranchIsClosed] = useState(false);
  const dispatch = useDispatch();

  const getTax = async () => {
    const response = await CashierService.getTaxes();
    if (response.error) {
      console.log(response.error);
    } else {
      console.log(response.data);

      setCashTax(response.data.cash_tax);
      setCardTax(response.data.card_tax);
    }
  };

  const getProducts = async () => {
    const response = await CashierService.getProducts();
    if (response.error) {
      console.log(response.error);
    } else {
      console.log(response.data);
      setProducts(response.data.filter((product) => product.status === true));
      //filter products where status is active

      setFilteredProducts(
        response.data.filter((product) => product.status === true)
      );
    }
  };

  const sortActiveOrders = (orders) => {
    // sort based on ready first and then earliest within
    orders.sort((a, b) => {
      if (a.status === "pending" && b.status === "ready") {
        return -1;
      } else if (a.status === "ready" && b.status === "pending") {
        return 1;
      } else {
        return a.time - b.time;
      }
    });

    setActiveOrders(orders);
  };

  const getActiveOrders = async () => {
    const response = await CashierService.getActiveOrders();
    if (response.error) {
      console.log(response.error);
    } else {
      console.log(response.data);
      sortActiveOrders(response.data);
    }
  };

  const getBranchStatus = async () => {
    const response = await CashierService.getBranchStatus();
    if (response.error) {
      console.log(response.error);
    } else {
      console.log(response.data);
      if (!response.data.status) {
        setShowBranchIsClosed(true);
      } else {
        setShowBranchIsClosed(false);
      }
    }
  };

  //get branch status every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      getBranchStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  //get active orders every 5 seconds

  useEffect(() => {
    const interval = setInterval(() => {
      getActiveOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (inBranch) {
      setDetails({ ...details, address: "In Branch" });
    } else {
      setDetails({ ...details, address: "" });
    }
  }, [inBranch]);

  useEffect(() => {
    getProducts();
    getActiveOrders();
    getTax();
    setFilter("");
  }, []);

  useEffect(() => {
    setFilteredProducts(
      products.filter((product) =>
        product.name.toLowerCase().includes(filter.toLowerCase())
      )
    );
  }, [filter]);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    console.log("Product added to cart", product);
  };

  const handleRemoveFromCart = (product) => {
    dispatch(removeFromCart(product));
    console.log("Product removed from cart", product);
  };

  const handleUpdateQuantity = (product, quantity) => {
    dispatch(updateQuantity(product._id, quantity));
    console.log("Product quantity updated", product, quantity);
  };

  const handleCheckout = async () => {
    const order = {
      products: cart.items,
      total: cart.total,
      grand_total: await grandTotal(cart.total, details.discount, details.tax),
      customer_name: details.customerName,
      payment_method: details.payment_method,
      order_type: details.order_type,
      tax: details.tax,
      discount: details.discount,
      address: details.address,
    };
    const response = await CashierService.addOrder(order);
    if (response.error) {
      console.log(response.error);
    } else {
      console.log(response.data);
      setShowDetailsForm(false);
      console.log(response.data);
      setActiveOrders([...activeOrders, response.data.order]);
      dispatch(clearCart());
      //clear details
      setDetails({
        customerName: "",
        discount: 0,
        address: "",
        order_type: "",
        tax: 0,
        payment_method: "",
      });

      setInBranch(true);
    }
  };

  useEffect(() => {
    console.log(filteredProducts);
  }, [filteredProducts]);

  useEffect(() => {
    console.log(products);
  }, [products]);

  const cart = useSelector((state) => state.cart);

  const [order_types, setOrderTypes] = useState([
    "delivery",
    "takeaway",
    "dine-in",
  ]);

  const [payment_methods, setPaymentMethods] = useState(["cash", "card"]);

  //console log the cart

  useEffect(() => {
    console.log(cart);
  }, [cart]);

  const handleCompleteOrder = async () => {
    try {
      console.log(orderToComplete);
      const res = await CashierService.markOrderCompleted(
        orderToComplete,
        feedback
      );
      if (res.error) {
        console.log(res.error);
        return;
      } else {
        console.log(res.data);
      }
      setActiveOrders(
        activeOrders.filter((order) => order._id !== orderToComplete)
      );
      setMarkedCompleted(false);
      setMarkedDone(true);
      setOrderToComplete("");
    } catch (error) {
      console.log(error);
    }
  };

  const [card_tax, setCard_tax] = useState(0);
  const [cash_tax, setCash_tax] = useState(0);

  useEffect(() => {
    try {
      //get taxes for card and cash from backend
      CashierService.getTaxes().then((response) => {
        if (response.data) {
          setCard_tax(response.data.card_tax);
          setCash_tax(response.data.cash_tax);
        }
      });
    } catch (e) {
      console.log(e);
    }
  }, []);

  const grandTotal = async (total, discount, tax) => {
    let grandTotal = total;

    if (discount > 0) {
      grandTotal -= (grandTotal * discount) / 100;
    }

    if (tax > 0) {
      grandTotal += (grandTotal * tax) / 100;
    }

    return grandTotal.toFixed(2);
  };

  const onClickCheckout = async () => {
    if (cart.items.length === 0) {
      alert("Cart is empty");
      return;
    }

    if (branchStatus) {
      setShowDetailsForm(true);
    } else {
      setShowBranchIsClosed(true);
    }
  };

  useEffect(() => {
    console.log(showDetailsForm);
  }, [showDetailsForm]);
  return (
    <div className="home flex">
      <div className="p-10 w-2/3 bg-[#EFF3F4] min-h-screen">
        <h1 className="text-3xl text-primary font-bold">Order Placement</h1>
        <input
          type="text"
          placeholder="Search for products..."
          className="border p-4 rounded-3xl w-full mt-3 mb-6"
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="grid grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="border p-6 flex flex-col text-center rounded-2xl items-center bg-white"
            >
              <img
                src={product.image}
                alt="product"
                className="h-24 rounded-full mb-3 w-1/4 object-cover"
              />
              <h3 className="text-primary text-xl font-bold w-full border-b-2 ">
                {product.name}
              </h3>
              <p className="mt-2">PKR {product.price}/-</p>
              <button
                className="btn bg-primary text-white p-2 rounded hover:bg-secondary w-full mt-2"
                onClick={() => handleAddToCart(product)}
              >
                Add to cart
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="p-10 bg-white w-1/3 cart fixed right-0 top-0 h-screen border-l overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl text-primary font-bold mb-3">Cart</h1>
          <button
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
            onClick={() => dispatch(clearCart())}
          >
            Clear Cart
          </button>
        </div>
        <div className="overflow-y-auto h-72">
          {cart.items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full">
              <BsCart className="text-6xl text-gray-300" />
              <h3 className="text-center">Cart is empty</h3>
            </div>
          )}

          {cart.items.map((item) => (
            <div
              key={item._id}
              className="border p-4 flex items-center justify-between text-center rounded-lg h-20 animate-fade"
            >
              <h3 className="text-gray-700">{item.name}</h3>
              <p>PKR {item.price}/-</p>
              <p className="flex items-center justify-center">
                <BiMinus
                  className="cursor-pointer mr-2 border-2 rounded-full"
                  onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                />
                {item.quantity}
                <BiPlus
                  className="cursor-pointer ml-2 border-2 rounded-full"
                  onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                />
              </p>
            </div>
          ))}
        </div>
        <div className="border-t p-4 flex justify-between items-center">
          <p className="text-gray-700">
            PKR <span className="font-bold text-primary">{cart.total}/- </span>
          </p>
          <button
            className="bg-primary text-white p-2 rounded hover:bg-secondary btn"
            onClick={onClickCheckout}
          >
            Checkout
          </button>
        </div>
        <div className="border-t p-4">
          <div className="flex justify-between">
            <h3 className="text-xl text-primary font-bold">Active Orders</h3>
            <h3 className="">
              {activeOrders ? activeOrders.length : 0}{" "}
              <span className="text-primary font-bold">Order(s)</span>
            </h3>
          </div>
          <div className="overflow-y-auto h-72 no-scrollbar flex flex-col justify-between">
            {activeOrders &&
              activeOrders.map((order) => (
                <div
                  key={order._id}
                  className="relative border-2 border-dashed p-4 flex flex-col text-center rounded-lg mt-10 me-4"
                >
                  <div
                    className={`absolute top-2 right-2 w-4 h-4 rounded-full ${
                      order.status === "pending"
                        ? "bg-yellow-300"
                        : "bg-green-500"
                    }`}
                  ></div>
                  <p className=" flex flex-row text-gray-700 justify-left gap-1">
                    <p>Customer name:</p>
                    <span className="text-blue-600">{order.customer_name}</span>
                  </p>
                  <p className="text-gray-700 text-left text-sm mt-2 mb-2">
                    Time: {new Date(order.time).toLocaleString()}
                  </p>
                  <div className="flex flex-col">
                    {order.cart.map((orderItem) => (
                      <div key={orderItem._id} className="flex justify-between">
                        <p>{orderItem.product_name}</p>
                        <p>{orderItem.quantity}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <p>Total: PKR {order.grand_total}</p>
                    <button
                      className="bg-primary text-white p-2 rounded hover:bg-secondary text-sm"
                      onClick={() => {
                        setOrderToComplete(order._id);
                        setMarkedCompleted(true);
                      }}
                    >
                      Mark Completed
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      {showDetailsForm && (
        //overlay
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10"
          onClick={() => setShowDetailsForm(false)}
        ></div>
      )}
      {markedCompleted && (
        //overlay
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40"
          onClick={() => setMarkedCompleted(false)}
        ></div>
      )}
      {markedDone && (
        //overlay
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40"
          onClick={() => setMarkedDone(false)}
        ></div>
      )}

      {showBranchIsClosed && (
        //overlay
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40"></div>
      )}

      {showDetailsForm && (
        <div className="modal modal-open">
          <div className="modal-box w-1/2 max-w-5xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl text-blue-500">Order Details</h2>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  onChange={(e) => setInBranch(e.target.checked)}
                  className="checkbox"
                  id="inBranch"
                  checked={inBranch}
                />
                <label htmlFor="inBranch" className="ml-2">
                  In Branch
                </label>
              </div>
            </div>
            <form>
              {/* Customer Name and Address */}
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="label" htmlFor="customerName">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    className="input input-bordered w-full"
                    value={details.customerName}
                    onChange={(e) =>
                      setDetails({ ...details, customerName: e.target.value })
                    }
                  />
                </div>
                <div className="w-1/2">
                  <label className="label" htmlFor="address">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    className="input input-bordered w-full"
                    disabled={inBranch}
                    value={inBranch ? "In Branch" : details.address}
                    onChange={(e) =>
                      setDetails({ ...details, address: e.target.value })
                    }
                  />
                </div>
              </div>
              {/* Discount */}
              <div className="w-1/2 my-3">
                <label className="label" htmlFor="discount">
                  Discount
                </label>
                <input
                  type="number"
                  id="discount"
                  className="input input-bordered w-full"
                  value={details.discount}
                  onChange={(e) =>
                    setDetails({ ...details, discount: e.target.value })
                  }
                />
              </div>
              {/* Order Type and Payment Method */}
              <div className="my-3">
                <label className="label">Select Order Type</label>
                <div className="flex gap-2">
                  {order_types.map((order_type) => (
                    <button
                      key={order_type}
                      className={`btn ${
                        details.order_type === order_type
                          ? "btn-primary"
                          : "btn-outline"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        setDetails({ ...details, order_type });
                      }}
                    >
                      {order_type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="my-3">
                <label className="label">Payment Method</label>
                <div className="flex gap-2">
                  {payment_methods.map((payment_method) => (
                    <button
                      key={payment_method}
                      className={`btn ${
                        details.payment_method === payment_method
                          ? "btn-primary"
                          : "btn-outline"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        setDetails({
                          ...details,
                          payment_method,
                          tax: payment_method === "card" ? cardTax : cashTax,
                        });
                      }}
                    >
                      {payment_method}
                    </button>
                  ))}
                </div>
              </div>
            </form>
            <div className="modal-action">
              <button
                className="btn btn-error w-1/2"
                onClick={() => setShowDetailsForm(false)}
              >
                Close
              </button>
              <button
                className="btn btn-success w-1/2"
                onClick={handleCheckout}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
      {markedCompleted && (
        <div className="modal modal-open">
          <div className="modal-box w-1/3 max-w-md">
            <h2 className="text-xl text-blue-500">Mark Order Completed</h2>
            <p className="my-4">
              Are you sure you want to mark this order as completed?
            </p>

            <p className="text-gray-500 text-sm">
              Enter client feedback below (optional)
            </p>
            <textarea
              className="input input-bordered w-full"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>
            <div className="modal-action">
              <button
                className="btn btn-success w-1/2"
                onClick={handleCompleteOrder}
              >
                Yes
              </button>
              <button
                className="btn btn-error w-1/2"
                onClick={() => setMarkedCompleted(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {markedDone && (
        <div className="modal modal-open">
          <div className="modal-box w-1/3 max-w-md text-center">
            <h2 className="text-xl text-blue-500">Order Completed</h2>
            <div className="my-5 flex justify-center">
              <HiBadgeCheck className="text-8xl text-blue-500" />
            </div>
            <p>Order has been marked as completed</p>
            <div className="modal-action">
              <button
                className="btn btn-error w-full"
                onClick={() => setMarkedDone(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showBranchIsClosed && (
        <div className="modal modal-open">
          <div className="modal-box w-1/3 max-w-md text-center">
            <h2 className="text-xl text-blue-500">Branch Closed</h2>
            <div className="my-5 flex justify-center">
              <HiBadgeCheck className="text-8xl text-blue-500" />
            </div>
            <p>Branch is currently closed</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
