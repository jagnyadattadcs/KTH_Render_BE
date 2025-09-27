import express from "express";
import { addProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../controllers/product.controller.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.route("/add").post(upload.any(), addProduct);
router.route("/all").get(getAllProducts);
router.route("/:id").get(getProductById);
router.route("/:id").put(upload.any(), updateProduct);
router.route("/:id").delete(deleteProduct);

export default router;