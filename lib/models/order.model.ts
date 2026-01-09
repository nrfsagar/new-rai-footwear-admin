import { Schema, model, models } from "mongoose";

const OrderSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  product_id: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  status: {
    type: String,
    // Keep 'confirmed' for legacy/admin flows and add 'submitted' for the mobile app.
    enum: ['pending', 'submitted', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Order = models?.Order || model("Order", OrderSchema);
export default Order;
