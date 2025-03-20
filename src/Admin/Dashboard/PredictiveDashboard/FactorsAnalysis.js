import React, { useState } from "react";
import {
  FaCalendarDay,
  FaCloudSun,
  FaClock,
  FaPercent,
  FaChartPie,
  FaLightbulb,
  FaInfoCircle,
  FaArrowRight,
  FaWeightHanging,
  FaThermometerHalf,
  FaUmbrella,
  FaTint,
  FaExchangeAlt,
  FaRegCalendarAlt,
  FaShoppingBag,
  FaCreditCard,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";

const FactorsAnalysis = ({ data }) => {
  const [view, setView] = useState("chart"); // chart, radar, or details

  if (!data || !data.factors) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-blue-600">No factors data available</p>
      </div>
    );
  }

  // Process the factors data for the chart
  const chartData = Object.entries(data.factors)
    .map(([factor, importance]) => ({
      factor: formatFactorName(factor),
      importance: Math.abs(importance * 100),
      positive: importance >= 0,
      rawFactor: factor,
    }))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 8);

  // Create radar chart data
  const radarData = chartData.slice(0, 6).map((item) => ({
    subject: item.factor,
    A: item.importance,
    fullMark: 100,
  }));

  // Helper function to format factor names for display
  function formatFactorName(factor) {
    // Replace underscores with spaces and capitalize
    const formatted = factor
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    // Handle special cases
    if (formatted.includes("Day Of Week")) {
      return formatted.replace("Day Of Week", "Day");
    } else if (formatted.includes("Is Weekend")) {
      return "Weekend";
    } else if (formatted.includes("Lag")) {
      return formatted.replace("Sales Lag", "Previous Sales");
    } else if (formatted.includes("Rolling")) {
      return "Weekly Average";
    } else if (formatted.includes("Temp")) {
      return "Temperature";
    }

    return formatted;
  }

  // Get icon for a factor
  const getFactorIcon = (factor) => {
    if (factor.includes("day_of_week"))
      return <FaCalendarDay className="text-blue-500" />;
    if (factor.includes("is_weekend"))
      return <FaRegCalendarAlt className="text-blue-500" />;
    if (factor.includes("hour")) return <FaClock className="text-blue-500" />;
    if (factor.includes("month"))
      return <FaCalendarDay className="text-blue-500" />;
    if (factor.includes("temp"))
      return <FaThermometerHalf className="text-red-500" />;
    if (factor.includes("rain"))
      return <FaUmbrella className="text-blue-500" />;
    if (factor.includes("humidity"))
      return <FaTint className="text-blue-400" />;
    if (factor.includes("wind"))
      return <FaExchangeAlt className="text-gray-500" />;
    if (factor.includes("payment_method"))
      return <FaCreditCard className="text-blue-500" />;
    if (factor.includes("order_type"))
      return <FaShoppingBag className="text-blue-500" />;
    return <FaWeightHanging className="text-blue-500" />;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-blue-200 shadow-md rounded-md">
          <p className="font-semibold text-blue-800">{label}</p>
          <p className="text-sm text-blue-600">
            Importance: {data.importance.toFixed(1)}%
          </p>
          <p className="text-sm text-blue-600">
            Impact:{" "}
            <span className={data.positive ? "text-green-600" : "text-red-600"}>
              {data.positive ? "Positive" : "Negative"}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const ViewToggle = () => (
    <div className="flex justify-center mb-4">
      <div className="inline-flex bg-blue-100 rounded-lg p-1">
        <button
          className={`px-4 py-1 rounded-lg text-sm font-medium ${
            view === "chart" ? "bg-blue-600 text-white" : "text-blue-600"
          }`}
          onClick={() => setView("chart")}
        >
          <FaChartPie className="inline mr-1" /> Chart
        </button>
        <button
          className={`px-4 py-1 rounded-lg text-sm font-medium ${
            view === "radar" ? "bg-blue-600 text-white" : "text-blue-600"
          }`}
          onClick={() => setView("radar")}
        >
          <FaChartPie className="inline mr-1" /> Radar
        </button>
        <button
          className={`px-4 py-1 rounded-lg text-sm font-medium ${
            view === "details" ? "bg-blue-600 text-white" : "text-blue-600"
          }`}
          onClick={() => setView("details")}
        >
          <FaInfoCircle className="inline mr-1" /> Details
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-blue-600 text-sm">
        These factors have the most significant influence on your sales.
        Understanding them can help you make better business decisions.
      </p>

      <ViewToggle />

      {view === "chart" && (
        <div className="bg-white rounded-lg border border-blue-100 p-4 shadow-sm">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fill: "#3182ce" }}
                />
                <YAxis
                  dataKey="factor"
                  type="category"
                  tick={{ fill: "#3182ce" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="importance" barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.positive ? "#4299e1" : "#90cdf4"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {view === "radar" && (
        <div className="bg-white rounded-lg border border-blue-100 p-4 shadow-sm">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#3182ce" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Factor Importance"
                  dataKey="A"
                  stroke="#3182ce"
                  fill="#3182ce"
                  fillOpacity={0.5}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {view === "details" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
              <h3 className="text-blue-700 font-semibold text-md mb-3 flex items-center">
                <FaCalendarDay className="mr-2" />
                Time Factors
              </h3>
              <ul className="space-y-3">
                {chartData
                  .filter(
                    (item) =>
                      item.rawFactor.includes("day") ||
                      item.rawFactor.includes("hour") ||
                      item.rawFactor.includes("month") ||
                      item.rawFactor.includes("weekend")
                  )
                  .map((factor, idx) => (
                    <li
                      key={idx}
                      className="flex items-center bg-blue-50 p-3 rounded-lg"
                    >
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <div className="flex-1">
                        <span className="text-blue-800 font-medium">
                          {factor.factor}:{" "}
                        </span>
                        <span className="text-blue-600">
                          {factor.importance.toFixed(1)}% importance
                        </span>
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          factor.positive ? "text-green-600" : "text-red-600"
                        } ml-2`}
                      >
                        {factor.positive ? "Positive" : "Negative"}
                      </div>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
              <h3 className="text-blue-700 font-semibold text-md mb-3 flex items-center">
                <FaCloudSun className="mr-2" />
                Weather Factors
              </h3>
              <ul className="space-y-3">
                {chartData
                  .filter(
                    (item) =>
                      item.rawFactor.includes("temp") ||
                      item.rawFactor.includes("rain") ||
                      item.rawFactor.includes("humid") ||
                      item.rawFactor.includes("wind")
                  )
                  .map((factor, idx) => (
                    <li
                      key={idx}
                      className="flex items-center bg-blue-50 p-3 rounded-lg"
                    >
                      {getFactorIcon(factor.rawFactor)}
                      <div className="flex-1 ml-2">
                        <span className="text-blue-800 font-medium">
                          {factor.factor}:{" "}
                        </span>
                        <span className="text-blue-600">
                          {factor.importance.toFixed(1)}% importance
                        </span>
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          factor.positive ? "text-green-600" : "text-red-600"
                        } ml-2`}
                      >
                        {factor.positive ? "Positive" : "Negative"}
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg border border-blue-100 shadow-sm">
            <h3 className="text-blue-700 font-semibold text-md mb-3 flex items-center">
              <FaLightbulb className="mr-2 text-yellow-500" />
              Recommendations
            </h3>
            <div className="space-y-3">
              {data.recommendations &&
                data.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex">
                    <div className="mr-3 mt-1">
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full text-blue-600 font-medium">
                        {idx + 1}
                      </div>
                    </div>
                    <p className="text-blue-800">{rec}</p>
                  </div>
                ))}
              {(!data.recommendations || data.recommendations.length === 0) && (
                <div className="flex">
                  <div className="mr-3 mt-1">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full text-blue-600 font-medium">
                      1
                    </div>
                  </div>
                  <p className="text-blue-800">
                    Based on our analysis of these factors, consider adjusting
                    your staffing and inventory on peak days and adapting your
                    marketing strategy to weather conditions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to get the importance value for a specific factor
  function getFactorImportance(factorName) {
    return data.factors[factorName] ? data.factors[factorName] * 100 : 0;
  }
};

export default FactorsAnalysis;
