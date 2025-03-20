import axios from "axios";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const handleResponse = async (response) => {
  if (response.status >= 200 && response.status < 300) {
    return { data: response.data };
  } else {
    return { error: response.data.message };
  }
};

const PredictiveService = {
  // Get sales predictions for the shop or a specific branch
  getSalesPredictions: async (branchId = null, days = 7) => {
    try {
      const url = branchId
        ? `${BASE_URL}/analytics/branch/predictions?branchId=${branchId}&days=${days}`
        : `${BASE_URL}/analytics/predictions?days=${days}`;

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      return handleResponse(response);
    } catch (error) {
      return { error: error.response?.data?.message || error.message };
    }
  },

  // Train the prediction model with historical data
  trainModel: async (branchId = null) => {
    try {
      const url = `${BASE_URL}/analytics/train-model`;
      const params = branchId ? { branchId } : {};

      const response = await axios.post(
        url,
        {},
        {
          params,
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return handleResponse(response);
    } catch (error) {
      return { error: error.response?.data?.message || error.message };
    }
  },

  // Get sales insights and patterns
  getSalesInsights: async (
    branchId = null,
    startDate = null,
    endDate = null
  ) => {
    try {
      let url = branchId
        ? `${BASE_URL}/analytics/branch/insights`
        : `${BASE_URL}/analytics/insights`;

      // Add query parameters if provided
      const params = {};
      if (branchId) params.branchId = branchId;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(url, {
        params,
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      return handleResponse(response);
    } catch (error) {
      return { error: error.response?.data?.message || error.message };
    }
  },

  // Get factors that influence sales
  getSalesFactors: async (branchId = null) => {
    try {
      const url = `${BASE_URL}/analytics/factors`;
      const params = branchId ? { branchId } : {};

      const response = await axios.get(url, {
        params,
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      return handleResponse(response);
    } catch (error) {
      return { error: error.response?.data?.message || error.message };
    }
  },

  // Get weather forecast for a specific city
  getWeatherForecast: async (city) => {
    try {
      const url = `${BASE_URL}/analytics/weather?city=${encodeURIComponent(
        city
      )}`;

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      return handleResponse(response);
    } catch (error) {
      return { error: error.response?.data?.message || error.message };
    }
  },
  getBranches: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/branches`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      return handleResponse(response);
    } catch (error) {
      return { error: error.message };
    }
  },
};

export default PredictiveService;
