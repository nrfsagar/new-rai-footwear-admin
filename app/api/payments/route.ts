import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Payment from "@/lib/models/payment.model";

// GET - Fetch all payments or payments for a specific user
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const user_email = searchParams.get('user_email');
    const user_id = searchParams.get('user_id');
    
    let query = {};
    if (user_email) {
      query = { user_email };
    } else if (user_id) {
      query = { user_id };
    }
    
    const payments = await Payment.find(query).sort({ timestamp: -1 });
    
    // Calculate totals
    let totalGiven = 0;
    let totalTaken = 0;
    
    payments.forEach((payment) => {
      if (payment.type === 'given') {
        totalGiven += payment.amount;
      } else {
        totalTaken += payment.amount;
      }
    });
    
    const balance = totalGiven - totalTaken;
    
    return NextResponse.json({
      success: true,
      payments,
      summary: {
        totalGiven,
        totalTaken,
        balance, // Positive means user owes money, negative means store owes user
      }
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// POST - Create a new payment
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { user_id, user_email, amount, type, note, timestamp } = body;
    
    if (!user_id || !user_email || !amount || !type) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    if (!['given', 'taken'].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Type must be 'given' or 'taken'" },
        { status: 400 }
      );
    }
    
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Amount must be a positive number" },
        { status: 400 }
      );
    }
    
    const payment = await Payment.create({
      user_id,
      user_email,
      amount,
      type,
      note: note || '',
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });
    
    return NextResponse.json({
      success: true,
      message: "Payment recorded successfully",
      payment,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create payment" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a payment
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Payment ID is required" },
        { status: 400 }
      );
    }
    
    const payment = await Payment.findByIdAndDelete(id);
    
    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete payment" },
      { status: 500 }
    );
  }
}
