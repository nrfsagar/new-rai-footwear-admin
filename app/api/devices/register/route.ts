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

    if (!email) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email is required' 
        },
        { status: 400 }
      );
    }

    // Update or create device by email (primary identifier for users)
    // This ensures that one user = one device record, regardless of token changes
    const device = await AppNotification.findOneAndUpdate(
      { email },
      { 
        token,
        email,
        name,
        phone,
        lastActive: timestamp || new Date().toISOString(),
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Device registered successfully',
      device: device.toObject()
    });
  } catch (error) {
    console.error('Error registering device:', error);
    
    // Handle duplicate key error
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      const field = Object.keys((error as any).keyPattern)[0];
      return NextResponse.json(
        { 
          success: false, 
          message: `Device with this ${field} already exists` 
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error registering device' 
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<INotificationDevice>>> {
  try {
    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email is required' 
        },
        { status: 400 }
      );
    }

    const device = await AppNotification.findOne({ email });

    if (!device) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Device not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      device: device.toObject()
    });
  } catch (error) {
    console.error('Error getting device:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error getting device' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    await connectToDatabase();

    // This endpoint removes duplicate entries, keeping only the latest one per email
    const result = await AppNotification.collection.aggregate([
      {
        $group: {
          _id: '$email',
          count: { $sum: 1 },
          ids: { $push: '$_id' },
          maxDate: { $max: '$createdAt' },
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]).toArray();

    let deletedCount = 0;

    for (const group of result) {
      if (group._id && group.ids && group.ids.length > 1) {
        // Find the document with the latest createdAt
        const docs = await AppNotification.find({ email: group._id }).sort({ createdAt: -1 });
        const keepId = docs[0]._id;
        
        // Delete all others
        const idsToDelete = group.ids.filter((id: any) => id.toString() !== keepId.toString());
        const deleteResult = await AppNotification.deleteMany({ _id: { $in: idsToDelete } });
        deletedCount += deleteResult.deletedCount;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} duplicate device entries`,
      deletedCount
    });
  } catch (error) {
    console.error('Error cleaning up duplicates:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error cleaning up duplicates' 
      },
      { status: 500 }
    );
  }
}
