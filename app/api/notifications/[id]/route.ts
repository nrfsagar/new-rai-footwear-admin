import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongoose";
import AppNotification from "@/lib/models/notification.model";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const updatedDevice = await AppNotification.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    );
    return NextResponse.json(updatedDevice);
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
