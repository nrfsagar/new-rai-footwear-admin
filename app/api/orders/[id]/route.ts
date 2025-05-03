// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongoose";
import Order from "@/lib/models/order.model";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const { id } = await params;
    const order = await Order.findById(id);
    
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const updatedOrder = await Order.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const { id } = await params;
    const deletedOrder = await Order.findByIdAndDelete(id);
    
    if (!deletedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}