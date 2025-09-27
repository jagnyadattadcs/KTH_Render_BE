import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import productRoute from "./routes/product.route.js";
import adminRoute from "./routes/admin.route.js";
import orderRoute from "./routes/order.route.js";
import subscriptionRoute from "./routes/subscription.route.js";
import cors from "cors"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api/product",productRoute);
app.use("/api/admin", adminRoute);
app.use("/api/order", orderRoute);
app.use("/api/subscription", subscriptionRoute);

app.get("/",(req,res)=>{
    res.send("KTH comes from backend!");
});

app.listen(PORT,()=>{
    connectDB();
    console.log(`App is running on port - ${PORT}`);
});