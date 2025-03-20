import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";

const SalesPredictionChart = ({ data }) => {
  const [chartData, setChartData] = useState([]);
  const [averageSales, setAverageSales] = useState(0);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(0);

  useEffect(() => {
    if (data && data.predictions) {
      // Format the data for the chart
      const formattedData = data.predictions.map((pred) => {
        // Calculate confidence range
        const confidenceRange = pred.predicted_sales * (1 - pred.confidence);
        return {
          date: new Date(pred.date).toLocaleDateString(),
          predicted: pred.predicted_sales,
          confidence: pred.confidence,
          lowerBound: Math.max(0, pred.predicted_sales - confidenceRange),
          upperBound: pred.predicted_sales + confidenceRange,
        };
      });

      setChartData(formattedData);

      // Calculate average sales
      if (formattedData.length > 0) {
        const sum = formattedData.reduce(
          (acc, item) => acc + item.predicted,
          0
        );
        setAverageSales(sum / formattedData.length);

        // Set min and max for better chart scaling
        const allValues = formattedData.flatMap((item) => [
          item.lowerBound,
          item.predicted,
          item.upperBound,
        ]);
        setMinValue(Math.max(0, Math.floor(Math.min(...allValues) * 0.9)));
        setMaxValue(Math.ceil(Math.max(...allValues) * 1.1));
      }
    }
  }, [data]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-blue-200 shadow-md rounded-md">
          <p className="font-semibold text-blue-800 mb-1">{label}</p>
          <p className="text-blue-600 font-medium">
            Predicted Sales: {formatCurrency(payload[0].payload.predicted)}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Range: {formatCurrency(payload[0].payload.lowerBound)} -{" "}
            {formatCurrency(payload[0].payload.upperBound)}
          </p>
          <p className="text-sm text-blue-500 mt-1">
            Confidence: {(payload[0].payload.confidence * 100).toFixed(0)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      {chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
            >
              <defs>
                <linearGradient id="colorUpper" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3182CE" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3182CE" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLower" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3182CE" stopOpacity={0} />
                  <stop offset="95%" stopColor="#3182CE" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBF4FF" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#4A5568" }}
                tickLine={{ stroke: "#CBD5E0" }}
                axisLine={{ stroke: "#CBD5E0" }}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fill: "#4A5568" }}
                tickLine={{ stroke: "#CBD5E0" }}
                axisLine={{ stroke: "#CBD5E0" }}
                domain={[minValue, maxValue]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 10 }}
                payload={[
                  { value: "Predicted Sales", type: "line", color: "#3182CE" },
                  { value: "Confidence Range", type: "rect", color: "#90CDF4" },
                ]}
              />
              <ReferenceLine
                y={averageSales}
                label={{
                  value: "Avg",
                  position: "right",
                  fill: "#4A5568",
                  fontSize: 12,
                }}
                stroke="#4A5568"
                strokeDasharray="3 3"
              />

              {/* Confidence range as area */}
              <Area
                type="monotone"
                dataKey="upperBound"
                stroke="none"
                fill="url(#colorUpper)"
                fillOpacity={1}
              />
              <Area
                type="monotone"
                dataKey="lowerBound"
                stroke="none"
                fill="url(#colorLower)"
                fillOpacity={1}
              />

              {/* Main prediction line */}
              <Line
                type="monotone"
                dataKey="predicted"
                name="Predicted Sales"
                stroke="#3182CE"
                strokeWidth={3}
                dot={{
                  stroke: "#2B6CB0",
                  strokeWidth: 2,
                  r: 5,
                  fill: "#FFFFFF",
                }}
                activeDot={{
                  stroke: "#2B6CB0",
                  strokeWidth: 2,
                  r: 7,
                  fill: "#3182CE",
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="text-right text-xs text-blue-500 mt-2">
            Forecast generated:{" "}
            {data.forecast_generated_at
              ? new Date(data.forecast_generated_at).toLocaleString()
              : "N/A"}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-blue-600">No prediction data available</p>
        </div>
      )}
    </div>
  );
};

export default SalesPredictionChart;
