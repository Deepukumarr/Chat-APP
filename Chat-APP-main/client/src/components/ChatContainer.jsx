import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import assets from "../assets/assets";
import { ChatContext } from "../context/ChatContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { formatMessageTime } from "../lib/utlis.js";

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
  } = useContext(ChatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef(null);
  const [input, setInput] = useState("");

  // LOAD MESSAGES
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // AUTO SCROLL
  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // SEND TEXT
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage({ text: input.trim() });
    setInput("");
  };

  // SEND IMAGE
  const handleSendImage = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  // NO USER SELECTED
  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
        <img src={assets.logo_icon} className="max-w-16" alt="logo" />
        <p className="text-lg font-medium text-white">
          Chat anytime, anywhere
        </p>
      </div>
    );
  }

  return (
    <div className="h-full relative overflow-hidden backdrop-blur-lg">
      {/* HEADER */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-stone-500/30">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 h-8 rounded-full"
        />

        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500" />
          )}
        </p>

        <img
          src={assets.arrow_icon}
          alt="back"
          className="md:hidden w-6 cursor-pointer"
          onClick={() => setSelectedUser(null)}
        />
      </div>

      {/* CHAT AREA */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-auto p-3 pb-6">
        {messages.map((msg) => {
          const isMe = msg.senderId === authUser?._id;

          return (
            <div
              key={msg._id}
              className={`flex items-end gap-2 ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              {!isMe && (
                <img
                  src={selectedUser.profilePic || assets.avatar_icon}
                  alt=""
                  className="w-7 h-7 rounded-full"
                />
              )}

              {msg.image ? (
                <img
                  src={msg.image}
                  alt=""
                  className="max-w-[230px] rounded-lg mb-6"
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] text-sm rounded-lg mb-6 break-words ${
                    isMe
                      ? "bg-violet-500/30 rounded-br-none"
                      : "bg-gray-500/20 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </p>
              )}

              {isMe && (
                <div className="text-center text-xs">
                  <img
                    src={authUser?.profilePic || assets.avatar_icon}
                    alt=""
                    className="w-7 h-7 rounded-full mx-auto"
                  />
                  <p className="text-gray-500">
                    {formatMessageTime(msg.createdAt)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
        <div ref={scrollEnd} />
      </div>

      {/* INPUT */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/10 px-3 rounded-full">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
            placeholder="Send a message"
            className="flex-1 text-sm p-3 bg-transparent outline-none text-white"
          />

          <input
            type="file"
            id="image"
            hidden
            accept="image/png, image/jpeg"
            onChange={handleSendImage}
          />

          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt="gallery"
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>

        <img
          src={assets.send_button}
          alt="send"
          className="w-7 cursor-pointer"
          onClick={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default ChatContainer;
