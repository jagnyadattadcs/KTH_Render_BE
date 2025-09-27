import { Order } from "../models/order.model.js";

export const addOrder = async (req, res) => {
  try {
    const { name, email, phone, quantity, deliveryAddress, description } =
      req.body;

    // Validate required fields
    if (!name || !email || !phone || !quantity || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, phone, quantity, and delivery address are required fields",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Validate quantity is a positive number
    if (typeof quantity !== "number" || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive number",
      });
    }

    // Validate phone number (basic validation)
    if (phone.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid phone number",
      });
    }

    // Create new order
    const newOrder = new Order({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      quantity,
      deliveryAddress: deliveryAddress.trim(),
      description: description ? description.trim() : "",
      orderDate: new Date(),
      status: "pending", // Default status
    });

    // Save order to database
    const savedOrder = await newOrder.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: savedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    // Generic server error
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Find order by ID
    const order = await Order.findById(id);

    // Check if order exists
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Return order data
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);

    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

// Update order
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      quantity,
      deliveryAddress,
      description,
      status,
    } = req.body;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Check if order exists
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Prepare update data
    const updateData = {};

    // Only update fields that are provided in the request
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) {
      // Validate email format if provided
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
      }
      updateData.email = email.toLowerCase().trim();
    }
    if (phone !== undefined) {
      // Validate phone number if provided
      if (phone.length < 10) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid phone number",
        });
      }
      updateData.phone = phone.trim();
    }
    if (quantity !== undefined) {
      // Validate quantity if provided
      if (typeof quantity !== "number" || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be a positive number",
        });
      }
      updateData.quantity = quantity;
    }
    if (deliveryAddress !== undefined)
      updateData.deliveryAddress = deliveryAddress.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (status !== undefined) {
      // Validate status if provided
      const validStatuses = [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status. Must be one of: pending, confirmed, shipped, delivered, cancelled",
        });
      }
      updateData.status = status;
    }

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true } // Return updated document and run validators
    );

    // Return success response
    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);

    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An order with this email or phone already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

// Delete order
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Check if order exists
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Delete order
    await Order.findByIdAndDelete(id);

    // Return success response
    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);

    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

// Optional: Get all orders (useful for admin panel)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};
