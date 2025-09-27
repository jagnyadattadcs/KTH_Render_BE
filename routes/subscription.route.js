import express from "express";
import { subscriptionMail } from "../controllers/subscription.controller.js";

const router = express.Router();

router.route("/").post(subscriptionMail);

export default router;