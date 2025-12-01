import User from "../models/user.js";
import bcrypt from "bcrypt";

// GET LOGGED-IN USER PROFILE
export const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { _id, fullname, username, email, phone, address, gender, role } = req.user;

    return res.status(200).json({
      success: true,
      user: {
        id: _id,
        fullname,
        username,
        email,
        phone,
        address,
        gender,
        role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

// GET ALL USERS (optional)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// GET USER BY ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id; // from token
    const { fullname, email, phone, address, gender } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullname,
        email,
        phone,
        address,
        gender,
      },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};


// =========================
// CHANGE PASSWORD
// =========================
export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id; 
    const { oldPassword, newPassword } = req.body;

    // Fetch the user
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Validate old password
    const isMatched = await bcrypt.compare(oldPassword, user.password);
    if (!isMatched)
      return res.status(400).json({ message: "Old password is incorrect" });

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Update
    user.password = hashed;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};
