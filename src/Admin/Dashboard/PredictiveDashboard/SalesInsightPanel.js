import React, { useState } from "react";
import {
  FaCalendarDay,
  FaClock,
  FaBoxOpen,
  FaCreditCard,
  FaShoppingBag,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaChartLine,
  FaTags,
  FaCaretDown,
  FaCaretRight,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const SalesInsightsPanel = ({ data }) => {
  const [activeSection, setActiveSection] = useState("all");

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-blue-600">No insights data available</p>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Render growth trend icon
  const renderTrendIcon = (value) => {
    if (value > 0) {
      return <FaArrowUp className="text-green-500" />;
    } else if (value < 0) {
      return <FaArrowDown className="text-red-500" />;
    }
    return <FaEquals className="text-gray-500" />;
  };

  // Toggle section
  const toggleSection = (section) => {
    if (activeSection === section) {
      setActiveSection("all");
    } else {
      setActiveSection(section);
    }
  };

  // Component for section header with toggle
  const SectionHeader = ({ id, icon, title, count = null }) => (
    <div
      className="flex items-center justify-between bg-blue-50 p-3 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
      onClick={() => toggleSection(id)}
    >
      <div className="flex items-center">
        {icon}
        <h3 className="text-blue-700 font-semibold text-md ml-2">{title}</h3>
        {count && (
          <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      {activeSection === id ? (
        <FaCaretDown className="text-blue-500" />
      ) : (
        <FaCaretRight className="text-blue-500" />
      )}
    </div>
  );

  // COLORS
  const COLORS = ["#3182CE", "#4299E1", "#63B3ED", "#90CDF4", "#BEE3F8"];
  const RED_COLORS = ["#E53E3E", "#F56565", "#FC8181", "#FEB2B2"];
  const GREEN_COLORS = ["#38A169", "#48BB78", "#68D391", "#9AE6B4"];

  return (
    <div className="space-y-4">
      {/* Peak Sales Days */}
      <div>
        <SectionHeader
          id="peak_days"
          icon={<FaCalendarDay className="text-blue-500" />}
          title="Peak Sales Days"
        />

        {(activeSection === "peak_days" || activeSection === "all") &&
          data.peak_days &&
          data.peak_days.by_revenue && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-blue-500 mb-2 font-medium">
                    Top Revenue Days
                  </div>
                  <div className="space-y-2">
                    {data.peak_days.by_revenue.slice(0, 3).map((day, idx) => (
                      <div
                        key={idx}
                        className="flex items-center bg-blue-50 p-2 rounded-md"
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-blue-${
                            600 - idx * 100
                          } mr-2`}
                        ></div>
                        <span className="text-blue-800 font-medium">{day}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-blue-500 mb-2 font-medium">
                    Top Order Count Days
                  </div>
                  <div className="space-y-2">
                    {data.peak_days.by_order_count
                      .slice(0, 3)
                      .map((day, idx) => (
                        <div
                          key={idx}
                          className="flex items-center bg-blue-50 p-2 rounded-md"
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-blue-${
                              600 - idx * 100
                            } mr-2`}
                          ></div>
                          <span className="text-blue-800 font-medium">
                            {day}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Peak Hours */}
      <div>
        <SectionHeader
          id="peak_hours"
          icon={<FaClock className="text-blue-500" />}
          title="Peak Hours"
        />

        {(activeSection === "peak_hours" || activeSection === "all") &&
          data.peak_hours &&
          data.peak_hours.by_revenue && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
              <div className="text-xs text-blue-500 mb-2 font-medium">
                Busiest Hours
              </div>
              <div className="flex flex-wrap gap-2">
                {data.peak_hours.by_revenue.slice(0, 5).map((hour, idx) => (
                  <div
                    key={idx}
                    className={`bg-blue-${
                      100 + idx * 100
                    } text-blue-800 px-3 py-2 rounded-lg font-medium`}
                  >
                    {hour}:00 - {hour + 1}:00
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <span className="font-medium text-blue-600">Pro Tip:</span>{" "}
                Schedule your staff according to these peak hours to improve
                service and efficiency.
              </div>
            </div>
          )}
      </div>

      {/* Popular Products */}
      {data.popular_products && data.popular_products.by_revenue && (
        <div>
          <SectionHeader
            id="products"
            icon={<FaBoxOpen className="text-blue-500" />}
            title="Top Products"
            count={data.popular_products.by_revenue.length}
          />

          {(activeSection === "products" || activeSection === "all") && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.popular_products.by_revenue.slice(0, 5)}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                  >
                    <XAxis
                      type="number"
                      tick={{ fill: "#3182ce" }}
                      tickFormatter={formatCurrency}
                    />
                    <YAxis
                      dataKey="product_name"
                      type="category"
                      width={100}
                      tick={{ fill: "#3182ce" }}
                      tickFormatter={(value) =>
                        value.length > 12
                          ? `${value.substring(0, 12)}...`
                          : value
                      }
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={(value) => `Product: ${value}`}
                      contentStyle={{
                        backgroundColor: "white",
                        borderColor: "#90cdf4",
                        borderRadius: "0.5rem",
                        padding: "10px",
                      }}
                    />
                    <Bar dataKey="revenue" name="Revenue">
                      {data.popular_products.by_revenue
                        .slice(0, 5)
                        .map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment Method Stats */}
      {data.payment_method_stats && (
        <div>
          <SectionHeader
            id="payment"
            icon={<FaCreditCard className="text-blue-500" />}
            title="Payment Methods"
          />

          {(activeSection === "payment" || activeSection === "all") && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.payment_method_stats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={60}
                        innerRadius={30}
                        dataKey="percentage"
                        nameKey="payment_method"
                      >
                        {data.payment_method_stats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => `${value.toFixed(1)}%`}
                        contentStyle={{
                          backgroundColor: "white",
                          borderColor: "#90cdf4",
                          borderRadius: "0.5rem",
                          padding: "10px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <div className="text-xs text-blue-500 mb-2 font-medium">
                    Payment Method Breakdown
                  </div>
                  <div className="space-y-2">
                    {data.payment_method_stats.map((method, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm"
                      >
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor: COLORS[idx % COLORS.length],
                            }}
                          ></div>
                          <span className="text-blue-800 capitalize">
                            {method.payment_method}
                          </span>
                        </div>
                        <span className="font-medium text-blue-600">
                          {method.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Type Stats */}
      {data.order_type_stats && (
        <div>
          <SectionHeader
            id="order_types"
            icon={<FaShoppingBag className="text-blue-500" />}
            title="Order Types"
          />

          {(activeSection === "order_types" || activeSection === "all") && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
              <div className="grid grid-cols-3 gap-3">
                {data.order_type_stats.map((type, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-r from-blue-50 to-white p-3 rounded-lg shadow-sm border border-blue-100 relative overflow-hidden"
                  >
                    {/* Progress bar background */}
                    <div
                      className="absolute bottom-0 left-0 h-1 bg-blue-400 opacity-50"
                      style={{ width: `${type.percentage}%` }}
                    ></div>

                    <div className="text-blue-800 font-medium text-center capitalize mb-1">
                      {type.order_type}
                    </div>
                    <div className="text-blue-600 text-lg font-bold text-center">
                      {type.percentage}%
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      {type.count} orders
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Growth Trends */}
      {data.growth_trends && data.growth_trends.length > 0 && (
        <div>
          <SectionHeader
            id="growth"
            icon={<FaChartLine className="text-blue-500" />}
            title="Growth Trends"
          />

          {(activeSection === "growth" || activeSection === "all") && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left text-blue-600 font-medium pb-2">
                      Month
                    </th>
                    <th className="text-right text-blue-600 font-medium pb-2">
                      Revenue
                    </th>
                    <th className="text-right text-blue-600 font-medium pb-2">
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.growth_trends.slice(-3).map((month, idx) => (
                    <tr
                      key={idx}
                      className={`border-b ${
                        idx % 2 === 0 ? "bg-blue-50" : "bg-white"
                      }`}
                    >
                      <td className="py-2 pl-2 text-blue-800 font-medium">
                        {month.month_year}
                      </td>
                      <td className="py-2 text-right text-blue-800 font-medium">
                        {formatCurrency(month.grand_total)}
                      </td>
                      <td className="py-2 pr-2 text-right flex items-center justify-end">
                        {renderTrendIcon(month.revenue_growth)}
                        <span
                          className={`ml-1 font-medium ${
                            month.revenue_growth > 0
                              ? "text-green-600"
                              : month.revenue_growth < 0
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          {Math.abs(month.revenue_growth).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex items-center justify-between mt-4 text-xs text-gray-500 bg-blue-50 p-2 rounded">
                <span className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                  Growth
                </span>
                <span className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                  Decline
                </span>
                <span className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-gray-400 rounded-full mr-1"></span>
                  No Change
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesInsightsPanel;
