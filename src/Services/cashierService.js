import axios from "axios";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const handleResponse = async (response) => {
  if (response.status >= 200 && response.status < 300) {
    //all possible valid (success) status codes
    return { data: response.data };
  } else {
    return { error: response.data.message };
  }
};

const cashierService = {
  addOrder: async (order) => {
    try {
      console.log(order);
      const response = await axios.post(
        `${BASE_URL}/cashier/order/add`,
        order,
        {
          withCredentials: true,
        }
      );
      return handleResponse(response);
    } catch (error) {
      return { error: error.message };
    }
  },

  getOrders: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/cashier/orders`, {
        withCredentials: true,
      });
      return handleResponse(response);
    } catch (error) {
      return { error: error.message };
    }
  },

  getActiveOrders: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/cashier/orders/active`, {
        withCredentials: true,
      });
      return handleResponse(response);
    } catch (error) {
      return { error: error.message };
    }
  },

  getPendingOrders: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/cashier/orders/pending`, {
        withCredentials: true,
      });
      return handleResponse(response);
    } catch (error) {
      return { error: error.message };
    }
  },

  getProducts: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/cashier/products`, {
        withCredentials: true,
      });
      return handleResponse(response);
    } catch (error) {
      return { error: error.message };
    }
  },

  markOrderCompleted: async (orderId,feedback) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/cashier/order/${orderId}/complete`,
        {feedback},
        {
          withCredentials: true,
        }
      );
      return handleResponse(response);
    } catch (error) {
      return { error: error.message };
    }
  },

  markOrderReady: async (orderId) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/cashier/order/${orderId}/ready`,
        {},
        {
          withCredentials: true,
        }
      );
      return handleResponse(response);
    } catch (error) {
      return { error: error.message };
    }
  },

  markOrderCancelled: async (orderId) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/cashier/order/${orderId}/cancel`,
        {},
        {
          withCredentials: true,
        }
      );
      return handleResponse(response);
    } catch (error) {
      return { error: error.message };
    }
  },

  getTaxes: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/cashier/taxes`, {
        withCredentials: true,
      });
      return handleResponse(response);
    } catch (error) {
      return { error: error.message };
    }
  },

  getBranchStatus: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/cashier/branch/status`, {
        withCredentials: true,
      });
      return handleResponse(response);
    } catch (error) {
      return { error: error.message };
    }
  },
};

export default cashierService;
