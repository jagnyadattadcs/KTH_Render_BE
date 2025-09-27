import express from "express";
import { forgotPassword, loginAdmin, registerAdmin, updateAdminDetails } from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/forgot-password", forgotPassword);
router.put("/update/:id", updateAdminDetails);

export default router;