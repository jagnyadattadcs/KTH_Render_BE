import { Subscription } from "../models/subscription.model.js";

export const subscriptionMail = async (req, res) => {
    try {
        const {email} = req.body;
        if(!email){
            return res.status(400).json({
                success:false,
                message:"Email is required"
            });
        }
        // Check if the email already exists in the database
        const existingSubscription = await Subscription.findOne({ email });
        if (existingSubscription) {
            return res.status(400).json({
                success: false,
                message: "This email is already subscribed."
            });
        }
        const newSubscription = new Subscription({ email });
        await newSubscription.save();
        res.status(200).json({
            success:true,
            message:"Subscription successful. Thank you for subscribing!"
        });
    } catch (error) {
        console.error("Error in subscriptionMail:", error);
        res.status(500).json({
            success:false,
            message:"Internal server error. Please try again later."
        });
    }
}