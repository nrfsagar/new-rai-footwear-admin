import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongoose';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const userData = await req.json();

    // Check if user already exists
    const existingUser = await User.findOne({ uid: userData.uid });
    
    if (existingUser) {
      // Update last login time
      existingUser.lastLoginAt = new Date();
      await existingUser.save();
      return NextResponse.json(existingUser);
    }

    // Create new user
    const newUser = await User.create(userData);
    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error handling user data:', error);
    return NextResponse.json(
      { error: 'Failed to process user data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const users = await User.find();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 