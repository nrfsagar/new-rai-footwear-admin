import { NextRequest, NextResponse } from 'next/server';
import AppNotification from "@/lib/models/notification.model";
import { connectToDatabase } from "@/lib/mongoose";
import { INotificationDevice, ApiResponse } from '@/types/notification';

interface RegisterDeviceRequest {
  token: string;
  email?: string;
  name?: string;
  phone?: string;
  timestamp?: string;
  
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<INotificationDevice>>> {
  try {
    await connectToDatabase();

    const body = await req.json() as RegisterDeviceRequest;
    const { token, email, name, phone, timestamp } = body;

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token is required' 
        },
        { status: 400 }
      );
    }

    // Update or create device token with new fields
    const device = await AppNotification.findOneAndUpdate(
      { token },
      { 
        token,
        email,
        name,
        phone,
        
        lastActive: timestamp || new Date().toISOString(),
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
