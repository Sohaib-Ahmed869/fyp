import React, { useState, useEffect } from "react";
import {
  FaChartLine,
  FaCloudSun,
  FaLightbulb,
  FaBrain,
  FaCalendarAlt,
  FaSync,
  FaStore,
  FaChartBar,
  FaChartPie,
  FaExclamationTriangle,
  FaFilter,
  FaTimes,
  FaCog,
  FaArrowRight,
  FaInfoCircle,
} from "react-icons/fa";
import PredictiveService from "../../../Services/predectiveService";
import SalesPredictionChart from "./SalesPredictionChart";
import SalesInsightsPanel from "./SalesInsightPanel";
import WeatherForecast from "./WeatherForecast";
import FactorsAnalysis from "./FactorsAnalysis";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6 shadow-sm">
    <div className="flex items-start">
      <FaExclamationTriangle className="text-red-500 mt-0.5 mr-3" />
      <div>
        <h3 className="text-red-800 font-medium">Error</h3>
        <p className="text-red-700 text-sm mt-1">{message}</p>
      </div>
    </div>
  </div>
);

const PredictiveAnalyticsDashboard = () => {
  const [branches, setBranches] = useState([]);
  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      const result = await PredictiveService.getBranches();
      if (result.error) {
        setError(result.error);
      } else {
        setBranches(result.data);
      }
    };
    fetchBranches();
  }, []);

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [predictionDays, setPredictionDays] = useState(7);
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());
  const [city, setCity] = useState("");

  const [predictions, setPredictions] = useState(null);
  const [insights, setInsights] = useState(null);
  const [weather, setWeather] = useState(null);
  const [factors, setFactors] = useState(null);

  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [loadingFactors, setLoadingFactors] = useState(false);
  const [loadingModel, setLoadingModel] = useState(false);

  const [error, setError] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState(null);

  // Helper functions for date handling
  function getDefaultStartDate() {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  }

  function getDefaultEndDate() {
    return new Date().toISOString().split("T")[0];
  }

  // Show notification with auto-dismiss
  const showNotification = (message, duration = 3000) => {
    setNotificationMessage(message);
    setTimeout(() => {
      setNotificationMessage(null);
    }, duration);
  };

  // Load predictions when branch or days change
  useEffect(() => {
    fetchPredictions();
  }, [selectedBranch, predictionDays]);

  // Load insights when branch or date range changes
  useEffect(() => {
    fetchInsights();
  }, [selectedBranch, startDate, endDate]);

  // Load weather when city changes
  useEffect(() => {
    if (city) {
      fetchWeather();
    }
  }, [city]);

  // Load factors when branch changes
  useEffect(() => {
    fetchFactors();
  }, [selectedBranch]);

  // Extract city from branch data when selected
  useEffect(() => {
    if (selectedBranch && branches.length > 0) {
      const branch = branches.find((b) => b._id === selectedBranch);
      if (branch && branch.city) {
        setCity(branch.city);
      }
    }
  }, [selectedBranch, branches]);

  const fetchPredictions = async () => {
    setLoadingPredictions(true);
    setError(null);

    const branchId = selectedBranch || null;
    const result = await PredictiveService.getSalesPredictions(
      branchId,
      predictionDays
    );

    if (result.error) {
      if (result.error.includes("Model not found")) {
        setModelStatus("untrained");
      } else {
        setError(result.error);
      }
      setPredictions(null);
    } else {
      setPredictions(result.data);
      setModelStatus("trained");
    }

    setLoadingPredictions(false);
  };

  const fetchInsights = async () => {
    setLoadingInsights(true);
    setError(null);

    const branchId = selectedBranch || null;
    const result = await PredictiveService.getSalesInsights(
      branchId,
      startDate,
      endDate
    );

    if (result.error) {
      // Don't show error for missing insights
      setInsights(null);
    } else {
      setInsights(result.data);
    }

    setLoadingInsights(false);
  };

  const fetchWeather = async () => {
    if (!city) return;

    setLoadingWeather(true);
    setError(null);

    const result = await PredictiveService.getWeatherForecast(city);

    if (result.error) {
      // Don't show error for weather
      setWeather(null);
    } else {
      setWeather(result.data);
    }

    setLoadingWeather(false);
  };

  const fetchFactors = async () => {
    setLoadingFactors(true);
    setError(null);

    const branchId = selectedBranch || null;
    const result = await PredictiveService.getSalesFactors(branchId);

    if (result.error) {
      // Only show model not found error
      if (result.error.includes("Model not found")) {
        setModelStatus("untrained");
      }
      setFactors(null);
    } else {
      setFactors(result.data);
      setModelStatus("trained");
    }

    setLoadingFactors(false);
  };

  const handleTrainModel = async () => {
    setLoadingModel(true);
    setError(null);

    const branchId = selectedBranch || null;
    const result = await PredictiveService.trainModel(branchId);

    if (result.error) {
      setError(result.error);
    } else {
      setModelStatus("trained");
      showNotification("Model trained successfully!");
      // Refetch data after training
      fetchPredictions();
      fetchFactors();
    }

    setLoadingModel(false);
  };

  // Selected branch name for display
  const getSelectedBranchName = () => {
    if (!selectedBranch) return "All Branches";
    const branch = branches.find((b) => b._id === selectedBranch);
    return branch ? branch.branch_name : "Selected Branch";
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen">
      {/* Notification */}
      {notificationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in-out flex items-center">
          <FaInfoCircle className="mr-2" />
          {notificationMessage}
          <button
            onClick={() => setNotificationMessage(null)}
            className="ml-3 text-white opacity-70 hover:opacity-100"
          >
            <FaTimes />
          </button>
        </div>
      )}

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-800 flex items-center">
                <FaChartLine className="mr-3 text-blue-600" />
                Predictive Analytics
              </h1>
              <p className="text-blue-600 mt-1">
                Data-driven insights to optimize your business performance
              </p>
            </div>

            <div className="flex items-center mt-4 md:mt-0 space-x-3">
              <div className="bg-white rounded-full px-4 py-2 shadow-sm border border-blue-100 flex items-center text-gray-700">
                <FaStore className="text-blue-500 mr-2" />
                <span className="font-medium">{getSelectedBranchName()}</span>
              </div>

              <button
                onClick={() => setIsFiltersPanelOpen(!isFiltersPanelOpen)}
                className="bg-white text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-full shadow-sm border border-blue-100 flex items-center"
              >
                <FaFilter className="mr-1" />
                <span>Filters</span>
              </button>

              <button
                onClick={handleTrainModel}
                disabled={loadingModel}
                className={`flex items-center px-4 py-2 rounded-full shadow-sm transition-colors ${
                  loadingModel
                    ? "bg-blue-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {loadingModel ? (
                  <>
                    <FaSync className="mr-2 animate-spin" />
                    Training...
                  </>
                ) : (
                  <>
                    <FaBrain className="mr-2" />
                    Train Model
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Model Status Indicator */}
          {modelStatus === "untrained" && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md mb-6 shadow-sm">
              <div className="flex items-start">
                <FaExclamationTriangle className="text-amber-500 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-amber-800 font-medium">
                    Model Needs Training
                  </h3>
                  <p className="text-amber-700 text-sm mt-1">
                    The prediction model needs to be trained before it can
                    generate forecasts and insights. Click the "Train Model"
                    button to start the training process.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filters Panel - Conditional rendering */}
          {isFiltersPanelOpen && (
            <div className="bg-white p-5 rounded-xl shadow-md mb-6 border border-blue-100 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-blue-800 flex items-center">
                  <FaCog className="mr-2" />
                  Dashboard Settings
                </h2>
                <button
                  onClick={() => setIsFiltersPanelOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label
                    htmlFor="branch"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Branch
                  </label>
                  <select
                    id="branch"
                    value={selectedBranch || ""}
                    onChange={(e) => setSelectedBranch(e.target.value || null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Branches</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.branch_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="days"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Prediction Days
                  </label>
                  <select
                    id="days"
                    value={predictionDays}
                    onChange={(e) => setPredictionDays(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={7}>7 Days</option>
                    <option value={14}>14 Days</option>
                    <option value={30}>30 Days</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => {
                    fetchPredictions();
                    fetchInsights();
                    fetchFactors();
                    fetchWeather();
                    setIsFiltersPanelOpen(false);
                    showNotification("Filters applied successfully");
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  Apply Filters <FaArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && <ErrorMessage message={error} />}

          {/* Dashboard content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Sales Prediction Chart - takes 2 columns */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden h-96 border border-blue-50 transition-all duration-300 hover:shadow-lg">
              <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white flex items-center justify-between">
                <div className="flex items-center">
                  <FaChartLine className="mr-2" />
                  <h2 className="font-semibold">Sales Predictions</h2>
                </div>
                <span className="text-xs bg-blue-700 px-2 py-1 rounded-full">
                  Next {predictionDays} Days
                </span>
              </div>
              <div className="p-4 h-80">
                {loadingPredictions ? (
                  <LoadingSpinner />
                ) : modelStatus === "untrained" ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <FaBrain className="text-4xl text-blue-200 mb-3" />
                    <p className="text-blue-700">
                      No prediction model available
                    </p>
                    <p className="text-sm text-blue-500 mt-1">
                      Please train the model first
                    </p>
                  </div>
                ) : predictions ? (
                  <SalesPredictionChart data={predictions} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-blue-700">
                      No prediction data available
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Weather Forecast */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-50 transition-all duration-300 hover:shadow-lg">
              <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-400 text-white flex items-center">
                <FaCloudSun className="mr-2" />
                <h2 className="font-semibold">Weather Forecast</h2>
              </div>
              <div className="p-4 h-80 overflow-y-auto">
                {loadingWeather ? (
                  <LoadingSpinner />
                ) : !city ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <FaCloudSun className="text-4xl text-blue-200 mb-3" />
                    <p className="text-blue-700">
                      Select a branch to view weather
                    </p>
                  </div>
                ) : weather ? (
                  <WeatherForecast data={weather} city={city} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-blue-700">Weather data not available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Second row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Insights */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-50 transition-all duration-300 hover:shadow-lg">
              <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-400 text-white flex items-center justify-between">
                <div className="flex items-center">
                  <FaLightbulb className="mr-2" />
                  <h2 className="font-semibold">Sales Insights</h2>
                </div>
                <div className="flex items-center text-xs bg-blue-600 bg-opacity-50 px-2 py-1 rounded-full">
                  <FaCalendarAlt className="mr-1" />
                  <span>
                    {new Date(startDate).toLocaleDateString()} -{" "}
                    {new Date(endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="p-4 min-h-80">
                {loadingInsights ? (
                  <LoadingSpinner />
                ) : insights ? (
                  <SalesInsightsPanel data={insights} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-blue-700">
                      No insights available for the selected period
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Factors Analysis */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-50 transition-all duration-300 hover:shadow-lg">
              <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-400 text-white flex items-center">
                <FaChartPie className="mr-2" />
                <h2 className="font-semibold">Influencing Factors</h2>
              </div>
              <div className="p-4 min-h-80">
                {loadingFactors ? (
                  <LoadingSpinner />
                ) : modelStatus === "untrained" ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <FaBrain className="text-4xl text-blue-200 mb-3" />
                    <p className="text-blue-700">
                      No prediction model available
                    </p>
                    <p className="text-sm text-blue-500 mt-1">
                      Please train the model first
                    </p>
                  </div>
                ) : factors ? (
                  <FactorsAnalysis data={factors} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-blue-700">No factors data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalyticsDashboard;
