import { Schema, model, models } from "mongoose";

const PaymentSchema = new Schema({
  user_id: {
    type: String,
    required: true,
    index: true,
  },
  user_email: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['given', 'taken'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: '',
  },
});

const Payment = models?.Payment || model("Payment", PaymentSchema);

export default Payment;
