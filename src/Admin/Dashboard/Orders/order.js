import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";

import ApexCharts from "apexcharts";
import { BiDownload } from "react-icons/bi";
import AdminService from "../../../Services/adminService.js";
import commonService from "../../../Services/common.js";

const Order = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    AdminService.getAllOrders().then((response) => {
      if (response.error) {
        console.log(response.error);

        return;
      }
      setOrders(response.data);
    });
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const ordersToday = orders.filter((order) => {
    return order.time.split("T")[0] === new Date().toISOString().split("T")[0];
  });

  const salesToday = ordersToday.reduce((acc, order) => {
    return acc + order.grand_total;
  }, 0);

  const last30Days = orders.filter((order) => {
    return (
      new Date(order.time) > new Date(new Date() - 30 * 24 * 60 * 60 * 1000)
    );
  });

  const salesLast30Days = last30Days.reduce((acc, order) => {
    return acc + order.grand_total;
  }, 0);

  const totalOrders = orders.length;

  const totalSales = orders.reduce(
    (acc, order) => {
      return acc + order.grand_total;
    },

    0
  );

  const averageOrder = (totalSales / totalOrders).toFixed(2);

  const highestOrder = orders.reduce((acc, order) => {
    return Math.max(acc, order.grand_total);
  }, 0);

  const numberOfRefunds = orders.filter((order) => {
    return order.status === "cancelled";
  }).length;

  const totalTax = orders.reduce((acc, order) => {
    return acc + order.tax;
  }, 0);

  //calculations for order trends
  const ordersByDay = orders.reduce((acc, order) => {
    const day = new Date(order.time).getDay();
    acc[day] = acc[day] ? acc[day] + 1 : 1;
    return acc;
  }, {});

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
      stroke: {
        width: 6,
      },
      grid: {
        show: false,
        strokeDashArray: 4,
        padding: {
          left: 2,
          right: 2,
          top: 0,
        },
      },
      series: [
        {
          name: "Orders",
          data: Object.values(ordersByDay),
          color: "#1A56DB",
        },
      ],
      xaxis: {
        categories: ["Sun", "Mon", "Tue", "Wed", "Thurs", "Fri", "Sat"],
        labels: {
          style: {
            colors: "#828D99",
            fontSize: "14px",
          },
        },
      },
      yaxis: {
        min: 0,
        max: Math.max(...Object.values(ordersByDay)),
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
  }, [ordersByDay]);

  //create data for delivery vs pickup chart
  const deliveryVsPickup = orders.reduce(
    (acc, order) => {
      if (order.order_type === "delivery") {
        acc.delivery += 1;
      } else if (order.order_type === "takeaway") {
        acc.takeway += 1;
      } else if (order.order_type === "dine-in") {
        acc.dine += 1;
      }
      return acc;
    },
    { delivery: 0, takeway: 0, dine: 0 }
  );

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
        deliveryVsPickup.delivery,
        deliveryVsPickup.takeway,
        deliveryVsPickup.dine,
      ],
      labels: ["Delivery", "Takeaway", "Dine-in"],
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
  }, [deliveryVsPickup]);

  useEffect(() => {
    //get orders for last 7 days only than 2021-09-01T12:00:00Z
    const last7Days = orders.filter((order) => {
      return (
        new Date(order.time) > new Date(new Date() - 7 * 24 * 60 * 60 * 1000) &&
        new Date(order.time) < new Date()
      );
    });

    // Prepare the data
    const categories = Array.from(
      new Set(last7Days.map((order) => order.time.split("T")[0]))
    );
    const seriesData = {
      Cash: new Array(categories.length).fill(0),
      Card: new Array(categories.length).fill(0),
    };

    console.log("Categories", categories);

    last7Days.forEach((order) => {
      const date = order.time.split("T")[0];
      const index = categories.indexOf(date);

      if (order.payment_method === "cash") {
        seriesData.Cash[index] += order.grand_total;
      } else if (order.payment_method === "card") {
        seriesData.Card[index] += order.grand_total;
      }
    });

    console.log("Series Data", seriesData);

    const options = {
      chart: {
        height: "100%",
        type: "bar",
        fontFamily: "Inter, sans-serif",
        toolbar: {
          show: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          endingShape: "rounded",
        },
      },
      colors: ["#1A56DB", "#F87171", "#34D399"],
      series: [
        {
          name: "cash",
          data: seriesData.Cash,
        },
        {
          name: "card",
          data: seriesData.Card,
        },
      ],
      xaxis: {
        categories: categories,
        labels: {
          style: {
            colors: "#828D99",
            fontSize: "14px",
          },
        },
      },
      yaxis: {
        min: 0,
        labels: {
          style: {
            colors: "#828D99",
            fontSize: "14px",
          },
        },
      },
      legend: {
        show: true,
        labels: {
          colors: "#000000",
        },
      },
    };

    const chart = new ApexCharts(document.getElementById("bar-chart"), options);
    chart.render();

    return () => {
      chart.destroy();
    };
  }, [orders]);

  const [top3Products, setTop3Products] = useState([]);
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
          className="relative flex w-1/4 p-5 rounded-lg shadow-md items-center gap-5 h-24 justify-between card"
          style={{
            background: "#ffffff",
          }}
        >
          <div>
            <p className="text-black text-md mb-0">Total Orders</p>
            <p className="text-3xl text-black font-semibold">{totalOrders}</p>
          </div>
        </div>
        <div
          className="relative flex w-1/4 p-5 rounded-lg shadow-md items-center gap-5 h-24 justify-between card"
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
          className="relative flex w-1/4 p-5 rounded-lg shadow-md items-center gap-5 h-24 justify-between card"
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
        <div
          className="relative flex w-1/4 p-5 rounded-lg shadow-md items-center gap-5 h-24 justify-between card"
          style={{
            background: "#ffffff",
          }}
        >
          <div>
            <p className="text-black text-md mb-0">Sales Last 30 Days</p>
            <p className="text-3xl text-black font-semibold">
              {salesLast30Days.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between p-5 gap-5">
        <div
          className="relative flex w-1/4 p-5 rounded-lg shadow-md items-center gap-5 h-24 justify-between card"
          style={{
            background: "#ffffff",
          }}
        >
          <div>
            <p className="text-black text-md mb-0">Average Order</p>
            <p className="text-3xl text-black font-semibold">{averageOrder}</p>
          </div>
        </div>
        <div
          className="relative flex w-1/4 p-5 rounded-lg shadow-md items-center gap-5 h-24 justify-between card"
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
          className="relative flex w-1/4 p-5 rounded-lg shadow-md items-center gap-5 h-24 justify-between card"
          style={{
            background: "#ffffff",
          }}
        >
          <div>
            <p className="text-black text-md mb-0">Number of Refunds</p>
            <p className="text-3xl text-black font-semibold">
              {numberOfRefunds}
            </p>
          </div>
        </div>
        <div
          className="relative flex w-1/4 p-5 rounded-lg shadow-md items-center gap-5 h-24 justify-between card"
          style={{
            background: "#ffffff",
          }}
        >
          <div>
            <p className="text-black text-md mb-0">Total Tax Collected</p>
            <p className="text-3xl text-black font-semibold">
              {totalTax.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-between p-5 gap-5 h-96">
        <div id="area-chart" className="w-1/4"></div>
        <div id="donut-chart" className="w-1/4"></div>
        <div id="bar-chart" className="w-1/4"></div>
        <div id="pie-chart" className="w-1/4"></div>
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
                key={order.order_id}
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
                  <p>{order.grand_total.toFixed(2)}</p>
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
      {
        //overlay modal
        showModal && (
          <div
            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          ></div>
        )
      }
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 focus:outline-none rounded-2xl w-1/2 shadow-xl z-50 bg-white p-5 modal modalbody"
      >
        <Modal.Header closeButton className="border-b-2">
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-2">
          <div className="flex items-center justify-between mb-2 mt-2">
            <p>
              <strong>Order ID:</strong>{" "}
              {selectedOrder ? commonService.handleCode(selectedOrder._id) : ""}
            </p>
            <p>
              <strong>Customer Name:</strong> {selectedOrder?.customer_name}
            </p>
          </div>
          <div className="flex items-center justify-between mb-2 mt-2">
            <p>
              <strong>Order Type:</strong> {selectedOrder?.order_type}
            </p>
            <p>
              <strong>Order Status:</strong> {selectedOrder?.status}
            </p>
          </div>
          <div className="flex items-center justify-between mb-2 mt-2">
            <p>
              <strong>Payment Method:</strong> {selectedOrder?.payment_method}
            </p>
            <p>
              <strong>Address:</strong> {selectedOrder?.address}
            </p>
          </div>
          <div className="flex items-center justify-between mb-2 mt-2">
            <p>
              <strong>Time:</strong> {selectedOrder?.time}
            </p>
            <p>
              <strong>Discount:</strong> {selectedOrder?.discount}%
            </p>
          </div>
          <div className="flex items-center justify-between mb-2 mt-2">
            <p>
              <strong>Total:</strong> PKR {selectedOrder?.total} /-
            </p>
            <p>
              <strong>Tax:</strong> {selectedOrder?.tax}%
            </p>
          </div>
          <p className="mt-2 mb-2">
            <strong>Grand Total:</strong> PKR {selectedOrder?.grand_total} /-
          </p>
          <p className="mt-2 mb-2">
            <strong>Cart:</strong>
          </p>
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Product Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3">
                  Price
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
              {selectedOrder?.cart.map((item) => (
                <tr
                  className="text-gray-700 dark:text-gray-400"
                  key={item.product_name}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <p>{item.product_name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p>{item.quantity}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p>{item.price}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer className="border-t-2 p-2">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded w-full"
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Order;
