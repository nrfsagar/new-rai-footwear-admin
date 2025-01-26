import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['man', 'women', 'kids'],
    required: true,
  },
  category: {
    type: String,
    enum: ['shoe', 'sandals', 'slippers'],
    required: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  sizes: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  otherDesignImg: {
    type: [String],
  },
  quality: {
    type: String,
    enum: ['Fresh', 'Second'],
    default: "Fresh",
  },
});

const Product = models?.Product || model("Product", ProductSchema);

export default Product;
