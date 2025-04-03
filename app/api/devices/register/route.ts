

import { NextRequest, NextResponse } from 'next/server';
import AppNotification from "@/lib/models/notification.model";
import { connectToDatabase } from "@/lib/mongoose";
import { INotificationDevice, RegisterDeviceRequest, ApiResponse } from '@/types/notification';

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<INotificationDevice>>> {
  try {
    await connectToDatabase();

    const body = await req.json() as RegisterDeviceRequest;
    const { token, userId,email,platform } = body;

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token is required' 
        },
        { status: 400 }
      );
    }

    // Update or create device token
    const device = await AppNotification.findOneAndUpdate(
      { token },
      { 
        token,email,platform,
        user: userId || null,
        lastActive: new Date()
        
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      device: device.toObject()
    });
  } catch (error) {
    console.error('Error registering device:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error registering device' 
      },
      { status: 500 }
    );
  }
}
