import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// ================= GET USERS FOR SIDEBAR =================
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;

    const users = await User.find({ _id: { $ne: userId } })
      .select("-password")
      .lean();

    const unseenMessages = {};

    await Promise.all(
      users.map(async (user) => {
        const count = await Message.countDocuments({
          senderId: user._id,
          receiverId: userId,
          seen: false,
        });

        if (count > 0) unseenMessages[user._id] = count;
      })
    );

    res.status(200).json({
      success: true,
      users,
      unseenMessages,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET MESSAGES =================
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    // Mark unseen messages as seen
    await Message.updateMany(
      {
        senderId: selectedUserId,
        receiverId: myId,
        seen: false,
      },
      { seen: true }
    );

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= MARK MESSAGE AS SEEN =================
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;

    await Message.findByIdAndUpdate(id, { seen: true });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("MARK SEEN ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= SEND MESSAGE =================
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    let imageUrl = "";

    if (image) {
      const upload = await cloudinary.uploader.upload(image, {
        folder: "chat-images",
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });
      imageUrl = upload.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text || "",
      image: imageUrl,
    });

    const messageData = newMessage.toObject();

    // Real-time emit
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", messageData);
    }

    res.status(201).json({
      success: true,
      newMessage: messageData,
    });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
