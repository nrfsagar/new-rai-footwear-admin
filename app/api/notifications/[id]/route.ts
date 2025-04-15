import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongoose";
import AppNotification from "@/lib/models/notification.model";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(
  req: NextRequest,
  context: RouteParams
): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const { id } = context.params;
    const body = await req.json();
    const updatedDevice = await AppNotification.findByIdAndUpdate(
      id,
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
    console.log(error);
    return NextResponse.json(
      { error: 'Update failed' },
      { status: 500 }
    );
  }
}
