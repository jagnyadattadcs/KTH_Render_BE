import express from "express";
import { addOrder, deleteOrder, getAllOrders, getOrderById, updateOrder } from "../controllers/order.controller.js";

const router = express.Router();

router.route("/add").post(addOrder);
router.route("/allorder").get(getAllOrders);
router.route("/:id").get(getOrderById);
router.route("/:id").put(updateOrder);
router.route("/:id").delete(deleteOrder);

export default router;