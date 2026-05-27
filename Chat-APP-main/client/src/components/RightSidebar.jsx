import { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);

  const [msgImages, setMsgImages] = useState([]);

  // Collect all image messages
  useEffect(() => {
    const images = messages
      .filter((msg) => msg.image)
      .map((msg) => msg.image);

    setMsgImages(images);
  }, [messages]);

  if (!selectedUser) return null;

  return (
    <div className="bg-[#8185b2]/10 text-white w-full relative overflow-y-auto max-md:hidden">
      {/* ---------- USER INFO ---------- */}
      <div className="pt-12 flex flex-col items-center gap-2 text-xs font-light mx-auto">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt="profile"
          className="w-20 h-20 rounded-full -translate-y-2 object-cover"
        />

        <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2 whitespace-nowrap">
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          )}
          {selectedUser.fullName}
        </h1>

        <p className="px-10 mx-auto text-center text-gray-300">
          {selectedUser.bio || "No bio available"}
        </p>
      </div>

      <hr className="border-[#ffffff50] my-4" />

      {/* ---------- MEDIA ---------- */}
      <div className="px-5 text-xs pb-24">
        <p className="mb-2">Media</p>

        <div className="max-h-[200px] overflow-y-auto grid grid-cols-2 gap-4 opacity-80">
          {msgImages.length > 0 ? (
            msgImages.map((url, index) => (
              <div
                key={index}
                onClick={() => window.open(url, "_blank")}
                className="cursor-pointer rounded"
              >
                <img
                  src={url}
                  alt="media"
                  className="h-full w-full object-cover rounded-md"
                />
              </div>
            ))
          ) : (
            <p className="col-span-2 text-center text-gray-400">
              No media shared
            </p>
          )}
        </div>
      </div>

      {/* ---------- LOGOUT ---------- */}
      <div className="sticky bottom-0 bg-[#0f172a] py-4">
        <button
          onClick={logout}
          className="mx-auto block bg-gradient-to-r from-purple-400 to-violet-600
          text-white text-sm font-light py-2 px-20 rounded-full cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;
