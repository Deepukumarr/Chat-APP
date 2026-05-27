import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext.jsx";

export const ChatContext = createContext();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket } = useContext(AuthContext);

  // ================= GET USERS =================
  const getUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login again");
        return;
      }

      const res = await fetch(
        `${BACKEND_URL}/api/messages/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setUsers(data.users);
      setUnseenMessages(data.unseenMessages || {});
    } catch (error) {
      console.error("GET USERS ERROR:", error);
      toast.error("Failed to load users");
    }
  };

  // ================= GET MESSAGES =================
  const getMessages = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${BACKEND_URL}/api/messages/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error("Failed to load messages");
    }
  };

  // ================= SEND MESSAGE =================
  const sendMessage = async (messageData) => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${BACKEND_URL}/api/messages/send/${selectedUser._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(messageData),
        }
      );

      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      }
    } catch (error) {
      toast.error("Message send failed");
    }
  };

  // ================= SOCKET =================
  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => socket.off("newMessage");
  }, [socket, selectedUser]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        selectedUser,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        getUsers,
        getMessages,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
