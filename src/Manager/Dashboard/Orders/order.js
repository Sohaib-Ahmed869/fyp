import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import ApexCharts from "apexcharts";
import { BiDownload } from "react-icons/bi";
import managerService from "../../../Services/managerService.js";
import commonService from "../../../Services/common.js";

const Order = () => {
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState([]);
  const [numberOfOrders, setNumberOfOrders] = useState(0);
  const [ordersInLast7Days, setOrdersInLast7Days] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [salesToday, setSalesToday] = useState(0);
  const [averageOrder, setAverageOrder] = useState(0);
  const [highestOrder, setHighestOrder] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [completedOrdersToday, setCompletedOrdersToday] = useState(0);
  const [top3Products, setTop3Products] = useState([]);

  useEffect(() => {
    managerService.getBranchOrders().then((response) => {
      if (response == "error") {
        console.log("error");
      } else {
        setOrders(response.data.orders);
        console.log(response.data);
      }
    });
  }, []);

  useEffect(() => {
    if (orders.length === 0) return;
    const last7Days = orders.filter((order) => {
      return (
        new Date(order.time) > new Date(new Date() - 7 * 24 * 60 * 60 * 1000) &&
        new Date(order.time) < new Date()
      );
    });
    setOrdersInLast7Days(last7Days.length);
    setNumberOfOrders(orders.length);
    // setTotalSales(
    //   orders.reduce((acc, order) => {
    //     return acc + order.grand_total;
    //   }, 0)
    // );
    setSalesToday(
      orders
        .filter((order) => {
          return (
            order.time.split("T")[0] === new Date().toISOString().split("T")[0]
          );
        })
        .reduce((acc, order) => {
          return acc + order.grand_total;
        }, 0)
    );
    setAverageOrder(
      orders.reduce((acc, order) => {
        return acc + order.grand_total;
      }, 0) / orders.length
    );
    setHighestOrder(
      Math.max(
        ...orders.map((order) => {
          return order.grand_total;
        })
      )
    );
    setActiveOrders(
      orders.filter((order) => {
        return order.status === "pending" || order.status === "ready";
      }).length
    );

    setCompletedOrdersToday(
      orders.filter((order) => {
        return (
          order.time.split("T")[0] === new Date().toISOString().split("T")[0] &&
          order.status === "completed"
        );
      }).length
    );
    setLoading(false);
  }, [orders]);

  const [ordersInLast7Days2, setOrdersInLast7Days2] = useState([]);
  const [last7Dates, setLast7Dates] = useState([]);

  useEffect(() => {
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(new Date() - i * 24 * 60 * 60 * 1000);
      return `${date.getFullYear()}-${
        date.getMonth() + 1 < 10
          ? `0${date.getMonth() + 1}`
          : date.getMonth() + 1
      }-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`;
    });
    setLast7Dates(dates.reverse());

    console.log(last7Dates);
  }, []);

  useEffect(() => {
    if (orders.length === 0) return;
    const last7Days = orders.filter((order) => {
      return (
        new Date(order.time) > new Date(new Date() - 7 * 24 * 60 * 60 * 1000) &&
        new Date(order.time) < new Date()
      );
    });
    //group by date
    const groupedOrders = last7Days.reduce((acc, order) => {
      const date = order.time.split("T")[0];
      acc[date] = acc[date] ? acc[date] + order.grand_total : order.grand_total;

      return acc;
    }, {});

    const ordersInLast7Days = last7Dates.map((date) => {
      console.log("date", date);
      return {
        date: date,
        total: groupedOrders[date] ? groupedOrders[date] : 0,
      };
    });

    console.log("order", ordersInLast7Days);

    setOrdersInLast7Days2(ordersInLast7Days);
  }, [orders]);

  const [ordersByType, setOrdersByType] = useState([
    { type: "", total: 0 },
    { type: "", total: 0 },
    { type: "", total: 0 },
  ]);

  useEffect(() => {
    if (orders.length === 0) return;
    const deliveryOrders = orders.filter((order) => {
      return order.order_type === "delivery";
    });

    const takeoutOrders = orders.filter((order) => {
      return order.order_type === "takeaway";
    });
    const dineInOrders = orders.filter((order) => {
      return order.order_type === "dine-in";
    });
    const ordersByType = [
      {
        type: "delivery",
        total: deliveryOrders.reduce((acc, order) => {
          return acc + order.grand_total;
        }, 0),
      },
      {
        type: "takeway",
        total: takeoutOrders.reduce((acc, order) => {
          return acc + order.grand_total;
        }, 0),
      },
      {
        type: "dine-in",
        total: dineInOrders.reduce((acc, order) => {
          return acc + order.grand_total;
        }, 0),
      },
    ];

    setOrdersByType(ordersByType);
  }, [orders]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  //chart data for order trends
  useEffect(() => {
    const options = {
      chart: {
        height: "100%",
        type: "area",
        fontFamily: "Inter, sans-serif",
        dropShadow: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      tooltip: {
        enabled: true,
        x: {
          show: false,
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          opacityFrom: 0.55,
          opacityTo: 0,
          shade: "#1C64F2",
          gradientToColors: ["#1C64F2"],
        },
      },
      dataLabels: {
        enabled: false,
      },

      grid: {
        show: false,
        strokeDashArray: 4,
        padding: {
          left: 2,
          right: 2,
          top: 0,
          bottom: 2,
        },
      },
      series: [
        {
          name: "Sales",
          data: ordersInLast7Days2.map((order) => order.total),

          color: "#1A56DB",
        },
      ],
      xaxis: {
        categories: last7Dates.map((date) =>
          date.split("-").slice(1).join("-")
        ),
        labels: {
          style: {
            colors: "#828D99",
            fontSize: "14px",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#828D99",
            fontSize: "14px",
          },
        },
      },
    };

    const chart = new ApexCharts(
      document.getElementById("area-chart"),
      options
    );

    chart.render();

    // Clean up the chart instance on component unmount
    return () => {
      chart.destroy();
    };
  }, [ordersInLast7Days2, last7Dates]);

  //now create a pie chart for delivery vs pickup
  useEffect(() => {
    const options = {
      chart: {
        height: "100%",
        type: "donut",
        fontFamily: "Inter, sans-serif",
        toolbar: {
          show: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      series: [
        ordersByType[0].total,
        ordersByType[1].total,
        ordersByType[2].total,
      ],
      labels: ["delivery", "takeaway", "dine-in"],
      colors: ["#1A56DB", "#F87171", "#34D399"],
      //change label colors

      legend: {
        show: true,
        //change legend colors
        labels: {
          colors: "#000000",
        },
        //change where the legend is placed to bottom
        position: "bottom",
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              name: {
                show: true,
                color: "#000000", // Change this to your desired color
              },
              value: {
                show: true,
                color: "#000000", // Change this to your desired color
              },
              total: {
                show: true,
                color: "#000000", // Change this to your desired color
              },
            },
          },
        },
      },
    };

    const chart = new ApexCharts(
      document.getElementById("donut-chart"),
      options
    );

    chart.render();

    // Clean up the chart instance on component unmount
    return () => {
      chart.destroy();
    };
  }, [ordersByType]);

  const [productQuantities, setProductQuantities] = useState([]);

  //get top 3 products
  useEffect(() => {
    const products = orders.reduce((acc, order) => {
      order.cart.forEach((item) => {
        acc[item.product_name] = acc[item.product_name]
          ? acc[item.product_name] + item.quantity
          : item.quantity;
      });
      return acc;
    }, {});

    const sortedProducts = Object.keys(products).sort(
      (a, b) => products[b] - products[a]
    );

    const top3 = sortedProducts.slice(0, 3);
    setTop3Products(top3);
    setProductQuantities(top3.map((product) => products[product]));
  }, [orders]);

  //show with a pie chart
  useEffect(() => {
    if (top3Products.length === 0 || productQuantities.length === 0) {
      return;
    }
    const options = {
      chart: {
        type: "pie",
        fontFamily: "Inter, sans-serif",
        toolbar: {
          show: true,
        },
      },
      colors: ["#1A56DB", "#F87171", "#34D399", "#FBBF24", "#818CF8"],
      labels: top3Products,
      legend: {
        show: true,
        position: "bottom",
        labels: {
          colors: "#000000",
        },
      },
      series: productQuantities,
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    };
    const chart = new ApexCharts(document.getElementById("pie-chart"), options);
    chart.render();

    return () => {
      chart.destroy();
    };
  }, [orders, top3Products, productQuantities]);

  // Pagination calculations
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = orders.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const onClickDownloadOrdersData = () => {
    const headers =
      "Order ID,Customer Name,Address,Total,Grand Total,Status,Payment Method,Order Type";
    const csv = orders.map((order) => {
      return `${commonService.handleCode(order._id)},${order.customer_name},${
        order.address
      },${order.total},${order.grand_total},${order.status},${
        order.payment_method
      },${order.order_type}`;
    });

    const csvData = [headers, ...csv].join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen">
    
      <div className="flex items-center justify-between p-5 gap-5">
        <div
          className="relative flex w-1/4 p-5 rounded-lg shadow-md gap-5 h-24 justify-between card"
          style={{
            background: "#ffffff",
          }}
        >
          <div>
            <p className="text-black text-md mb-0">Total Orders</p>
            <p className="text-3xl text-black font-semibold">
              {numberOfOrders}
            </p>
          </div>
        </div>
        <div
          className="relative flex w-1/4 p-5 rounded-lg shadow-md gap-5 h-24 justify-between card"
          style={{
            background: "#ffffff",
          }}
        >
          <div>
            <p className="text-black text-md mb-0">Orders in Last 7 Days</p>
            <p className="text-3xl text-black font-semibold">
              {ordersInLast7Days}
            </p>
          </div>
        </div>
        <div
          className="relative flex w-1/4 p-5 rounded-lg shadow-md gap-5 h-24 justify-between card"
          style={{
            background: "#ffffff",
          }}
        >
          <div>
            <p className="text-black text-md mb-0">Total Sales</p>
            <p className="text-3xl text-black font-semibold">
              {totalSales.toFixed(2)}
            </p>
          </div>
        </div>
        <div
          className="relative flex w-1/4 p-5 rounded-lg shadow-md gap-5 h-24 justify-between card"
          style={{
            background: "#ffffff",
          }}
        >
          <div>
            <p className="text-black text-md mb-0">Sales Today</p>
            <p className="text-3xl text-black font-semibold">
              {salesToday.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-between p-5 gap-5">
        <div
          className="relative flex w-1/4 p-5 rounded-lg shadow-md gap-5 h-24 justify-between card"
          style={{
            background: "#ffffff",
          }}
        >
          <div>
            <p className="text-black text-md mb-0">Average Order</p>
            <p className="text-3xl text-black font-semibold">
              {averageOrder.toFixed(2)}
            </p>
          </div>
        </div>
        <div
          className="relative flex w-1/4 p-5 rounded-lg shadow-md gap-5 h-24 justify-between card"
          style={{
            background: "#ffffff",
          }}
        >
          <div>
            <p className="text-black text-md mb-0">Highest Order</p>
            <p className="text-3xl text-black font-semibold">
              {highestOrder.toFixed(2)}
            </p>
          </div>
        </div>
        <div
          className="relative flex w-1/4 p-5 rounded-lg shadow-md gap-5 h-24 justify-between card"
          style={{
            background: "#ffffff",
          }}
        >
          <div>
            <p className="text-black text-md mb-0">Active Orders</p>
            <p className="text-3xl text-black font-semibold">{activeOrders}</p>
          </div>
        </div>
        <div
          className="relative flex w-1/4 p-5 rounded-lg shadow-md gap-5 h-24 justify-between card"
          style={{
            background: "#ffffff",
          }}
        >
          <div>
            <p className="text-black text-md mb-0">Completed Orders Today</p>
            <p className="text-3xl text-black font-semibold">
              {completedOrdersToday}
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-between p-5 gap-5 h-96">
        <div id="donut-chart" className="w-1/4"></div>

        <div id="pie-chart" className="w-1/4"></div>
        <div id="area-chart" className="w-1/2"></div>
      </div>
      <div class="relative overflow-x-auto shadow-md rounded-lg p-5">
        <div className="w-full justify-end flex">
          <button
            onClick={onClickDownloadOrdersData}
            className=" text-black flex items-center focus:outline-none mb-2 mr-2"
          >
            <BiDownload className="mr-2" /> Download CSV
          </button>
        </div>
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" class="px-6 py-3">
                Order ID
              </th>
              <th scope="col" class="px-6 py-3">
                Customer Name
              </th>
              <th scope="col" class="px-6 py-3">
                Address
              </th>
              <th scope="col" class="px-6 py-3">
                Total
              </th>
              <th scope="col" class="px-6 py-3">
                Grand Total
              </th>
              <th scope="col" class="px-6 py-3">
                Order Status
              </th>
              <th scope="col" class="px-6 py-3">
                Payment Method
              </th>
              <th scope="col" class="px-6 py-3">
                Order Type
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
            {paginatedOrders.map((order) => (
              <tr
                class="text-gray-700 dark:text-gray-400 cursor-pointer"
                key={order._id}
                onClick={() => {
                  setSelectedOrder(order);
                  setShowModal(true);
                }}
              >
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-3">
                    <p>{commonService.handleCode(order._id)}</p>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <p>{order.customer_name}</p>
                </td>
                <td class="px-6 py-4">
                  <p>{order.address}</p>
                </td>
                <td class="px-6 py-4">
                  <p>{order.total}</p>
                </td>
                <td class="px-6 py-4">
                  <p>{order.grand_total}</p>
                </td>
                <td class="px-6 py-4">
                  <p>{order.status}</p>
                </td>
                <td class="px-6 py-4">
                  <p>{order.payment_method}</p>
                </td>
                <td class="px-6 py-4">
                  <p>{order.order_type}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between mt-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            Previous
          </button>
          <div>
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            Next
          </button>
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="modal-header border-b-2 flex justify-between items-center">
              <h3 className="font-bold text-lg">Order Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-sm btn-circle btn-outline"
              >
                ✕
              </button>
            </div>
            <div className="modal-body p-2">
              <div className="flex items-center justify-between mb-2">
                <p>
                  <strong>Order ID:</strong>{" "}
                  {selectedOrder
                    ? commonService.handleCode(selectedOrder._id)
                    : ""}
                </p>
                <p>
                  <strong>Customer Name:</strong> {selectedOrder?.customer_name}
                </p>
              </div>
              <div className="flex items-center justify-between mb-2">
                <p>
                  <strong>Order Type:</strong> {selectedOrder?.order_type}
                </p>
                <p>
                  <strong>Order Status:</strong> {selectedOrder?.status}
                </p>
              </div>
              <div className="flex items-center justify-between mb-2">
                <p>
                  <strong>Payment Method:</strong>{" "}
                  {selectedOrder?.payment_method}
                </p>
                <p>
                  <strong>Address:</strong> {selectedOrder?.address}
                </p>
              </div>
              <div className="flex items-center justify-between mb-2">
                <p>
                  <strong>Time:</strong> {selectedOrder?.time}
                </p>
                <p>
                  <strong>Discount:</strong> {selectedOrder?.discount}%
                </p>
              </div>
              <div className="flex items-center justify-between mb-2">
                <p>
                  <strong>Total:</strong> PKR {selectedOrder?.total} /-
                </p>
                <p>
                  <strong>Tax:</strong> {selectedOrder?.tax}%
                </p>
              </div>
              <p className="mt-2">
                <strong>Grand Total:</strong> PKR {selectedOrder?.grand_total}{" "}
                /-
              </p>
              <p className="mt-2">
                <strong>Cart:</strong>
              </p>
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3">Product Name</th>
                    <th className="px-6 py-3">Quantity</th>
                    <th className="px-6 py-3">Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                  {selectedOrder?.cart.map((item) => (
                    <tr
                      key={item.product_name}
                      className="text-gray-700 dark:text-gray-400"
                    >
                      <td className="px-6 py-4">{item.product_name}</td>
                      <td className="px-6 py-4">{item.quantity}</td>
                      <td className="px-6 py-4">PKR {item.price} /-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer border-t-2 p-2">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-error w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
