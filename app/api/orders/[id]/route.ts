// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongoose";
import Order from "@/lib/models/order.model";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const order = await Order.findById(params.id);
    
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    return NextResponse.json(order, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching order:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const updatedOrder = await Order.findByIdAndUpdate(params.id, body, { new: true });
    
    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error: any) {
    console.error('Error updating order:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const deletedOrder = await Order.findByIdAndDelete(params.id);
    
    if (!deletedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Order deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting order:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}