// // pages/api/devices/register.js

// import AppNotification from "@/lib/models/notification.model";
// import { connectToDatabase } from "@/lib/mongoose";

// export default async function handler(req:any, res:any) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   try {
//     await connectToDatabase();

//     const { token, userId } = req.body;

//     if (!token) {
//       return res.status(400).json({ message: 'Token is required' });
//     }

//     // Update or create device token
//     const device = await AppNotification.findOneAndUpdate(
//       { token },
//       { 
//         token,
//         user: userId || null,
//         lastActive: new Date()
//       },
//       { upsert: true, new: true }
//     );

//     res.status(200).json({ success: true, device });
//   } catch (error) {
//     console.error('Error registering device:', error);
//     res.status(500).json({ message: 'Error registering device' });
//   }
// }

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
    const { token, userId } = body;

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
        token,
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
