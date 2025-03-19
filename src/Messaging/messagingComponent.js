import React, { useState, useEffect, useRef } from "react";
import {
  BiSend,
  BiMessageRoundedDetail,
  BiX,
  BiArrowBack,
} from "react-icons/bi";
import { BsCircleFill } from "react-icons/bs";
import io from "socket.io-client";
import axios from "axios";
import useStore from "../Store/store";

const MessagingComponent = () => {
  const { userRole, userId, shopId, branchId, shopName, branchName } =
    useStore();

  // States
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chats"); // 'chats' or 'contacts'
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

  // Initialize socket connection
  useEffect(() => {
    if (!userId || !userRole) return;

    const newSocket = io(API_URL);
    setSocket(newSocket);

    // Socket.io event listeners
    newSocket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);

      // Register user with socket server
      newSocket.emit("register", {
        userId,
        role: userRole,
        shopId,
        branchId,
      });
    });

    newSocket.on("registered", (data) => {
      console.log("Registration successful:", data);
    });

    newSocket.on("private-message", (data) => {
      console.log("Received private message:", data);
      handleNewMessage(data);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    // Clean up on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [userId, userRole, shopId, branchId]);

  // Fetch conversations and unread count on component mount
  useEffect(() => {
    if (!userRole || !userId) return;

    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/messages`, {
          withCredentials: true,
        });

        if (response.data) {
          // Group messages by conversation
          const conversationMap = new Map();

          response.data.messages.forEach((msg) => {
            let conversationId, recipientId, recipientRole, recipientName;

            if (msg.sender_id !== userId) {
              // This is a message TO us
              conversationId = msg.sender_id;
              recipientId = msg.sender_id;
              recipientRole = msg.sender_role;
              recipientName = getNameFromRole(msg.sender_role);
            } else {
              // This is a message FROM us
              conversationId = msg.recipient_id;
              recipientId = msg.recipient_id;
              recipientRole = msg.recipient_role;
              recipientName = getNameFromRole(msg.recipient_role);
            }

            if (!conversationMap.has(conversationId)) {
              conversationMap.set(conversationId, {
                id: conversationId,
                recipientId,
                recipientRole,
                recipientName,
                lastMessage: msg.content,
                lastMessageTime: msg.sent_at,
                unread:
                  msg.sender_id !== userId && msg.status !== "read" ? 1 : 0,
              });
            } else {
              const conv = conversationMap.get(conversationId);
              if (new Date(msg.sent_at) > new Date(conv.lastMessageTime)) {
                conv.lastMessage = msg.content;
                conv.lastMessageTime = msg.sent_at;
              }
              if (msg.sender_id !== userId && msg.status !== "read") {
                conv.unread += 1;
              }
            }
          });

          // Convert map to array and sort by most recent
          const conversationsArray = Array.from(conversationMap.values()).sort(
            (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
          );

          setConversations(conversationsArray);

          // Calculate total unread messages
          const totalUnread = conversationsArray.reduce(
            (acc, conv) => acc + conv.unread,
            0
          );
          setUnreadCount(totalUnread);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchContacts = async () => {
      try {
        let contactsList = [];

        // Based on user role, fetch appropriate contacts
        if (userRole === "admin") {
          // Admin can message all managers and all branches
          const managersResponse = await axios.get(
            `${API_URL}/admin/managers`,
            {
              withCredentials: true,
            }
          );

          if (managersResponse.data) {
            contactsList = managersResponse.data.map((manager) => ({
              id: manager._id,
              name: `${manager.first_name} ${manager.last_name}`,
              role: "manager",
              branchName: manager.branch_id.branch_name,
            }));
          }
        } else if (userRole === "manager") {
          // Manager can message admin and cashiers of their branch
          const adminContact = {
            id: shopId, // Using shopId as admin ID
            name: "Admin",
            role: "admin",
          };

          const cashiersResponse = await axios.get(
            `${API_URL}/manager/cashiers`,
            {
              withCredentials: true,
            }
          );

          let cashiersList = [];
          if (cashiersResponse.data && cashiersResponse.data.cashiers) {
            cashiersList = cashiersResponse.data.cashiers.map((cashier) => ({
              id: cashier._id,
              name: cashier.username,
              role: "cashier",
            }));
          }

          contactsList = [adminContact, ...cashiersList];
        } else if (userRole === "cashier") {
          // Cashier can message managers of their branch and admin
          const adminContact = {
            id: shopId,
            name: "Admin",
            role: "admin",
          };

          // We need to fetch the branch's manager(s)
          const branchResponse = await axios.get(`${API_URL}/cashier/branch`, {
            withCredentials: true,
          });

          if (branchResponse.data) {
            const managerContact = {
              id: branchResponse.data.manager_ids[0], // Assuming first manager
              name: "Branch Manager",
              role: "manager",
            };
            contactsList = [adminContact, managerContact];
          }
        }

        setContacts(contactsList);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchConversations();
    fetchContacts();

    // Set up periodic refresh
    const intervalId = setInterval(fetchConversations, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [userRole, userId, shopId, branchId]);

  // Fetch messages when an active conversation is selected
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/messages/conversation/${activeConversation.recipientId}/${activeConversation.recipientRole}`,
          { withCredentials: true }
        );

        if (response.data && response.data.messages) {
          setMessages(
            response.data.messages.sort(
              (a, b) => new Date(a.sent_at) - new Date(b.sent_at)
            )
          );

          // Mark messages as read
          markConversationAsRead(activeConversation.id);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [activeConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewMessage = (data) => {
    // If the message is from the active conversation, add it to the messages
    if (
      activeConversation &&
      data.sender.id === activeConversation.recipientId
    ) {
      setMessages((prev) => [
        ...prev,
        {
          _id: new Date().getTime().toString(),
          content: data.message,
          sender_id: data.sender.id,
          sender_role: data.sender.role,
          recipient_id: userId,
          recipient_role: userRole,
          sent_at: data.timestamp || new Date().toISOString(),
          status: "delivered",
        },
      ]);

      // Mark as read immediately
      markMessageAsRead(data.messageId);
    } else {
      // Otherwise, update the conversations list
      setUnreadCount((prev) => prev + 1);
      setConversations((prev) => {
        const existing = prev.find((c) => c.recipientId === data.sender.id);

        if (existing) {
          return prev
            .map((c) => {
              if (c.recipientId === data.sender.id) {
                return {
                  ...c,
                  lastMessage: data.message,
                  lastMessageTime: data.timestamp || new Date().toISOString(),
                  unread: c.unread + 1,
                };
              }
              return c;
            })
            .sort(
              (a, b) =>
                new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
            );
        } else {
          // New conversation
          const newConversation = {
            id: data.sender.id,
            recipientId: data.sender.id,
            recipientRole: data.sender.role,
            recipientName:
              data.sender.name || getNameFromRole(data.sender.role),
            lastMessage: data.message,
            lastMessageTime: data.timestamp || new Date().toISOString(),
            unread: 1,
          };

          return [newConversation, ...prev];
        }
      });
    }
  };

  const markConversationAsRead = async (conversationId) => {
    try {
      // Update local state first for better UX
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c))
      );

      // Calculate new total unread count
      const newUnreadCount = conversations.reduce(
        (acc, conv) => (conv.id === conversationId ? acc : acc + conv.unread),
        0
      );

      setUnreadCount(newUnreadCount);

      // Mark messages as read on the server
      // This would require a backend endpoint to mark all messages in a conversation as read
      // For now, we'll mark each visible message as read
      messages.forEach((msg) => {
        if (msg.sender_id === conversationId && msg.status !== "read") {
          markMessageAsRead(msg._id);
        }
      });
    } catch (error) {
      console.error("Error marking conversation as read:", error);
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      await axios.put(
        `${API_URL}/messages/${messageId}/read`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !activeConversation) return;

    try {
      const messageData = {
        to: {
          id: activeConversation.recipientId,
          role: activeConversation.recipientRole,
        },
        content: message,
        priority: "normal",
      };

      // Add message to UI immediately for better UX
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        content: message,
        sender_id: userId,
        sender_role: userRole,
        recipient_id: activeConversation.recipientId,
        recipient_role: activeConversation.recipientRole,
        sent_at: new Date().toISOString(),
        status: "sent",
      };

      setMessages((prev) => [...prev, tempMessage]);
      setMessage("");

      // Send via socket if connected
      if (socket && isConnected) {
        socket.emit("private-message", {
          to: {
            id: activeConversation.recipientId,
            role: activeConversation.recipientRole,
          },
          message: message,
          shopId,
          branchId,
          senderInfo: {
            id: userId,
            role: userRole,
            name: getUserName(),
          },
        });
      }

      // Also send via API
      const response = await axios.post(`${API_URL}/messages/send`, messageData, {
        withCredentials: true,
      });

      if (response.data) {
        // Update conversation list
        setConversations((prev) => {
          const updatedConversations = prev.map((c) => {
            if (c.id === activeConversation.id) {
              return {
                ...c,
                lastMessage: message,
                lastMessageTime: new Date().toISOString(),
              };
            }
            return c;
          });

          // Sort by most recent
          return updatedConversations.sort(
            (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
          );
        });

        // Replace the temp message with the real one
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempMessage._id
              ? {
                  ...response.data.message,
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Replace temp message with error state
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === `temp-${Date.now()}`
            ? {
                ...msg,
                error: true,
              }
            : msg
        )
      );
    }
  };

  const selectConversation = (conversation) => {
    setActiveConversation(conversation);
    markConversationAsRead(conversation.id);
    setActiveTab("chats");
  };

  const startNewConversation = (contact) => {
    const newConversation = {
      id: contact.id,
      recipientId: contact.id,
      recipientRole: contact.role,
      recipientName: contact.name,
      lastMessage: "",
      lastMessageTime: new Date().toISOString(),
      unread: 0,
    };

    setActiveConversation(newConversation);
    setMessages([]);
    setActiveTab("chats");

    // Check if conversation already exists
    const existingConvo = conversations.find(
      (c) => c.recipientId === contact.id
    );
    if (!existingConvo) {
      setConversations((prev) => [newConversation, ...prev]);
    }
  };

  const getNameFromRole = (role) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "manager":
        return "Manager";
      case "cashier":
        return "Cashier";
      default:
        return "User";
    }
  };

  const getUserName = () => {
    // Return the current user's name based on their role
    switch (userRole) {
      case "admin":
        return "Admin";
      case "manager":
        return "Manager";
      case "cashier":
        return "Cashier";
      default:
        return "User";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      // Today: Show time
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (date.getFullYear() === now.getFullYear()) {
      // This year: Show date without year
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } else {
      // Different year: Show date with year
      return date.toLocaleDateString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Message bubble button */}
      <button
        className="bg-blue-500 hover:bg-blue-600 rounded-full p-3 text-white shadow-lg relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <BiMessageRoundedDetail size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-2 py-0.5">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Messaging panel */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-80 h-96 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-blue-500 text-white p-3 flex justify-between items-center">
            <h3 className="font-semibold">
              {activeConversation ? (
                <div className="flex items-center">
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="mr-2"
                  >
                    <BiArrowBack />
                  </button>
                  {activeConversation.recipientName}
                </div>
              ) : (
                "Messages"
              )}
            </h3>
            <button onClick={() => setIsOpen(false)}>
              <BiX size={20} />
            </button>
          </div>

          {/* Content area */}
          {activeConversation ? (
            // Message view
            <div className="flex flex-col flex-grow">
              {/* Messages */}
              <div className="flex-grow p-3 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-10">
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`mb-2 max-w-[80%] ${
                        msg.sender_id === userId
                          ? "ml-auto bg-blue-100 rounded-l-lg rounded-br-lg"
                          : "mr-auto bg-gray-100 rounded-r-lg rounded-bl-lg"
                      } p-2`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <div className="text-xs text-gray-500 flex justify-between items-center mt-1">
                        <span>{formatDate(msg.sent_at)}</span>
                        {msg.sender_id === userId && (
                          <span>
                            {msg.status === "read"
                              ? "Read"
                              : msg.status === "delivered"
                              ? "Delivered"
                              : "Sent"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-2 border-t flex">
                <input
                  type="text"
                  className="flex-grow border rounded-l-lg p-2 focus:outline-none"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  className="bg-blue-500 text-white p-2 rounded-r-lg"
                  onClick={sendMessage}
                >
                  <BiSend />
                </button>
              </div>
            </div>
          ) : (
            // Conversation/contacts list
            <div className="flex flex-col flex-grow">
              {/* Tabs */}
              <div className="flex border-b">
                <button
                  className={`flex-1 py-2 ${
                    activeTab === "chats"
                      ? "border-b-2 border-blue-500 font-semibold"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("chats")}
                >
                  Chats
                </button>
                <button
                  className={`flex-1 py-2 ${
                    activeTab === "contacts"
                      ? "border-b-2 border-blue-500 font-semibold"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("contacts")}
                >
                  Contacts
                </button>
              </div>

              {/* List */}
              <div className="flex-grow overflow-y-auto">
                {isLoading ? (
                  <div className="text-center p-4">
                    <p>Loading...</p>
                  </div>
                ) : activeTab === "chats" ? (
                  conversations.length === 0 ? (
                    <div className="text-center text-gray-500 p-4">
                      <p>No conversations yet</p>
                      <p className="text-sm">
                        Go to contacts to start messaging
                      </p>
                    </div>
                  ) : (
                    conversations.map((convo) => (
                      <div
                        key={convo.id}
                        className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => selectConversation(convo)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold">
                            {convo.recipientName}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatDate(convo.lastMessageTime)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600 truncate w-5/6">
                            {convo.lastMessage || "New conversation"}
                          </p>
                          {convo.unread > 0 && (
                            <span className="bg-blue-500 text-white rounded-full text-xs px-2 py-0.5 ml-2">
                              {convo.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )
                ) : contacts.length === 0 ? (
                  <div className="text-center text-gray-500 p-4">
                    <p>No contacts available</p>
                  </div>
                ) : (
                  contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-3 border-b hover:bg-gray-50 cursor-pointer flex items-center"
                      onClick={() => startNewConversation(contact)}
                    >
                      <div className="flex-grow">
                        <h4 className="font-semibold">{contact.name}</h4>
                        <p className="text-sm text-gray-600">
                          {contact.role.charAt(0).toUpperCase() +
                            contact.role.slice(1)}
                          {contact.branchName && ` (${contact.branchName})`}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <BsCircleFill
                          className={`${
                            true // Replace with actual online status logic
                              ? "text-green-500"
                              : "text-gray-300"
                          } text-xs mr-2`}
                        />
                        <span className="text-xs text-gray-500">
                          {true ? "Online" : "Offline"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessagingComponent;
