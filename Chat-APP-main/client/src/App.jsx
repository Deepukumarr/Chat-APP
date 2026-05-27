import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

import { AuthContext } from "./context/AuthContext.jsx";

const App = () => {
  const { authUser } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-[url('/bgImage.svg')] bg-cover bg-center">
      <Toaster position="top-right" />

      <Routes>
        {/* HOME */}
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" replace />}
        />

        {/* LOGIN / SIGNUP */}
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" replace />}
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            authUser ? <ProfilePage /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </div>
  );
};

export default App;
