import AppNotification from "../models/notification.model";
import { connectToDatabase } from "../mongoose";

export async function getProducts() {
    await connectToDatabase();
    try {
      const tokens = await AppNotification.find({}).lean();
      return tokens;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }