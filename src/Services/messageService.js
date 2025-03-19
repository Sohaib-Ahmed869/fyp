import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const MessageService = {
  // Get all messages for the current user
  getMessages: async () => {
    try {
      const response = await axios.get(`${API_URL}/messages`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error getting messages:", error);
      throw error;
    }
  },

  // Get unread message count
  getUnreadCount: async () => {
    try {
      const response = await axios.get(`${API_URL}/messages/unread-count`, {
        withCredentials: true,
      });
      return response.data.unreadCount;
    } catch (error) {
      console.error("Error getting unread count:", error);
      throw error;
    }
  },

  // Get conversation with a specific user
  getConversation: async (recipientId, recipientRole) => {
    try {
      const response = await axios.get(
        `${API_URL}/messages/conversation/${recipientId}/${recipientRole}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting conversation:", error);
      throw error;
    }
  },

  // Send a message
  sendMessage: async (
    recipientId,
    recipientRole,
    content,
    priority = "normal"
  ) => {
    try {
      const response = await axios.post(
        `${API_URL}/messages`,
        {
          recipient: recipientRole,
          recipientId: recipientId,
          content,
          priority,
        },
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  // Mark a message as read
  markAsRead: async (messageId) => {
    try {
      const response = await axios.put(
        `${API_URL}/messages/${messageId}/read`,
        {},
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw error;
    }
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    try {
      const response = await axios.delete(`${API_URL}/messages/${messageId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  },

  sendBranchBroadcast: async (branchId, content, priority = "normal") => {
    try {
      const response = await axios.post(
        `${API_URL}/messages/broadcast/branch/${branchId}`,
        {
          content,
          priority,
        },
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error sending branch broadcast:", error);
      throw error;
    }
  },

  // Get all branch broadcasts
  getBranchBroadcasts: async (branchId) => {
    try {
      const response = await axios.get(
        `${API_URL}/messages/broadcast/branch/${branchId}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting branch broadcasts:", error);
      throw error;
    }
  },
};

export default MessageService;
