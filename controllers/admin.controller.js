import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";

// ✅ Register admin
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "❌ All fields are required" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "❌ Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await newAdmin.save();

    res.status(201).json({
      message: "✅ Admin registered successfully",
      admin: { id: newAdmin._id, name, email, phone },
    });
  } catch (error) {
    res.status(500).json({ message: "❌ Registration failed", error: error.message });
  }
};

// ✅ Login admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "❌ Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "❌ Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "❌ Invalid credentials" });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "✅ Login successful",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, phone: admin.phone },
    });
  } catch (error) {
    res.status(500).json({ message: "❌ Login failed", error: error.message });
  }
};

// ✅ Forgot password (generate reset token)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "❌ Email is required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "❌ Admin not found" });
    }

    // Generate reset token (in production send via email)
    const resetToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    res.status(200).json({
      message: "✅ Password reset token generated",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to generate reset token", error: error.message });
  }
};

// ✅ Update admin details
export const updateAdminDetails = async (req, res) => {
  try {
    const { id } = req.params; // admin ID from route
    const { name, email, phone, password } = req.body;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "❌ Admin not found" });
    }

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (phone) admin.phone = phone;
    if (password) {
      admin.password = await bcrypt.hash(password, 10);
    }

    await admin.save();

    res.status(200).json({
      message: "✅ Admin details updated successfully",
      admin: { id: admin._id, name: admin.name, email: admin.email, phone: admin.phone },
    });
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to update admin details", error: error.message });
  }
};
