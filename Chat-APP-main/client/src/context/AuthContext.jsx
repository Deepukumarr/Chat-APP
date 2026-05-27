import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // ================= CHECK AUTH =================
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/user/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      // ❗ invalid / expired token
      localStorage.removeItem("token");
      setToken(null);
      setAuthUser(null);
    }
  };

  // ================= LOGIN / SIGNUP =================
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/user/${state}`, credentials);

      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setAuthUser(data.user);

        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${data.token}`;

        connectSocket(data.user);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Request failed");
    }
  };

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);

    delete axios.defaults.headers.common["Authorization"];

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    toast.success("Logged out successfully");
  };

  // ================= UPDATE PROFILE =================
  const updateProfile = async (profileData) => {
    try {
      const { data } = await axios.put("/api/user/update", profileData);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  // ================= SOCKET =================
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });

    setSocket(newSocket);
  };

  // ================= INIT =================
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
      checkAuth();
    } else {
      setAuthUser(null);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
