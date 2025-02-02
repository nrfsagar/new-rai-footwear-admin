// pages/api/devices/register.js

import AppNotification from "@/lib/models/notification.model";
import { connectToDatabase } from "@/lib/mongoose";

export default async function handler(req:any, res:any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const { token, userId } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Update or create device token
    const device = await AppNotification.findOneAndUpdate(
      { token },
      { 
        token,
        user: userId || null,
        lastActive: new Date()
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, device });
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({ message: 'Error registering device' });
  }
}