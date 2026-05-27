import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext.jsx";
import { ChatContext } from "../context/ChatContext.jsx";

const Sidebar = () => {
  const navigate = useNavigate();

  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  } = useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);

  const [input, setInput] = useState("");

  // FILTER USERS
  const filteredUsers = input
    ? users.filter((user) =>
        user.fullName.toLowerCase().includes(input.toLowerCase())
      )
    : users;

  // FETCH USERS ON ONLINE CHANGE
  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-auto text-white
      ${selectedUser ? "max-md:hidden" : ""}`}
    >
      {/* ---------- TOP ---------- */}
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />

          <div className="relative py-2 group">
            <img
              src={assets.menu_icon}
              alt="menu"
              className="max-h-5 cursor-pointer"
            />

            <div
              className="absolute top-full right-0 z-30 w-32 p-4 rounded-md
              bg-[#282142] border border-gray-600 text-gray-100
              hidden group-hover:block"
            >
              <p
                onClick={() => navigate("/profile")}
                className="cursor-pointer text-sm hover:text-violet-400"
              >
                Edit Profile
              </p>

              <hr className="my-2 border-gray-500" />

              <p
                onClick={logout}
                className="cursor-pointer text-sm hover:text-red-400"
              >
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* ---------- SEARCH ---------- */}
        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="search" className="w-3" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search User..."
            className="bg-transparent outline-none text-white text-xs
            placeholder-[#c8c8c8] flex-1"
          />
        </div>
      </div>

      {/* ---------- USER LIST ---------- */}
      <div className="flex flex-col gap-1">
        {filteredUsers.map((user) => {
          const isActive = selectedUser?._id === user._id;

          return (
            <div
              key={user._id}
              onClick={() => {
                setSelectedUser(user);
                setUnseenMessages((prev) => ({
                  ...prev,
                  [user._id]: 0,
                }));
              }}
              className={`relative flex items-center gap-3 p-2 pl-4 rounded
              cursor-pointer max-sm:text-sm transition
              ${isActive ? "bg-[#282142]/50" : "hover:bg-[#282142]/30"}`}
            >
              <img
                src={user.profilePic || assets.avatar_icon}
                alt="avatar"
                className="w-[35px] h-[35px] rounded-full object-cover"
              />

              <div className="flex flex-col leading-5">
                <p className="font-medium">{user.fullName}</p>
                {onlineUsers.includes(user._id) ? (
                  <span className="text-green-400 text-xs">Online</span>
                ) : (
                  <span className="text-neutral-400 text-xs">Offline</span>
                )}
              </div>

              {unseenMessages[user._id] > 0 && (
                <span
                  className="absolute top-3 right-4 text-xs h-5 w-5 flex
                  justify-center items-center rounded-full bg-violet-500/50"
                >
                  {unseenMessages[user._id]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
