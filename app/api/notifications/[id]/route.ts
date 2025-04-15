import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongoose";
import AppNotification from "@/lib/models/notification.model";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const body = await req.json();
    const updatedDevice = await AppNotification.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    );

    if (!updatedDevice) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, device: updatedDevice });
  } catch (error) {
    return NextResponse.json(
      { error: 'Update failed' },
      { status: 500 }
    );
  }
}
