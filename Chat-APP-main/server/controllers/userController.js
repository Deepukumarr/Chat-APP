import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";

// ================= SIGNUP =================
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, bio } = req.body;

    if (!fullName || !email || !password || !bio) {
      return res.status(400).json({
        success: false,
        message: "Missing details",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Account already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);

    const { password: _, ...safeUser } = newUser.toObject();

    res.status(201).json({
      success: true,
      user: safeUser,
      token,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Signup failed",
    });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing credentials",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);

    const { password: _, ...safeUser } = user.toObject();

    res.json({
      success: true,
      user: safeUser,
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// ================= CHECK AUTH =================
export const checkAuth = (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, bio, profilePic } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (fullName) user.fullName = fullName.trim();
    if (bio) user.bio = bio;

    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic, {
        folder: "profiles",
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });

      user.profilePic = upload.secure_url;
    }

    await user.save();

    const { password: _, ...safeUser } = user.toObject();

    res.json({
      success: true,
      user: safeUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Profile update failed",
    });
  }
};
