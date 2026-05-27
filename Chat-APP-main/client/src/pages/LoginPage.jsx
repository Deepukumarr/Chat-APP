import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";
const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Signup first step → show bio screen
    if (currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    const payload =
      currState === "Sign up"
        ? { fullName, email, password, bio }
        : { email, password };

    await login(currState === "Sign up" ? "signup" : "login", payload);

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-cover flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      <img
        src={assets.logo_big}
        alt="logo"
        className="w-[min(30vw,250px)]"
      />

      <form
        onSubmit={onSubmitHandler}
        className="border-2 bg-white/10 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg"
      >
        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currState}
          {isDataSubmitted && (
            <img
              src={assets.arrow_icon}
              alt="back"
              className="w-5 cursor-pointer"
              onClick={() => setIsDataSubmitted(false)}
            />
          )}
        </h2>

        {/* FULL NAME */}
        {currState === "Sign up" && !isDataSubmitted && (
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="p-2 border border-gray-500 rounded-md"
          />
        )}

        {/* EMAIL & PASSWORD */}
        {!isDataSubmitted && (
          <>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-2 border border-gray-500 rounded-md"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-2 border border-gray-500 rounded-md"
            />
          </>
        )}

        {/* BIO */}
        {currState === "Sign up" && isDataSubmitted && (
          <textarea
            rows={4}
            placeholder="Provide a short bio..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
            className="p-2 border border-gray-500 rounded-md"
          />
        )}

        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 rounded-md"
        >
          {currState === "Sign up" ? "Create Account" : "Login Now"}
        </button>

        <p className="text-sm text-gray-400">
          {currState === "Sign up" ? (
            <>
              Already have an account?{" "}
              <span
                className="text-violet-400 cursor-pointer"
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false);
                }}
              >
                Login here
              </span>
            </>
          ) : (
            <>
              Create an account{" "}
              <span
                className="text-violet-400 cursor-pointer"
                onClick={() => setCurrState("Sign up")}
              >
                Click here
              </span>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
