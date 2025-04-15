import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongoose";
import AppNotification from "@/lib/models/notification.model";

export async function GET() {
  try {
    await connectToDatabase();
    const devices = await AppNotification.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ devices });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 });
  }
}
