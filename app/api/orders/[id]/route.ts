// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongoose";
import Order from "@/lib/models/order.model";

type RouteContext = {
  params: { id: string }
};

export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const order = await Order.findById(context.params.id);
    
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.log('Error fetching order:', error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const body = await request.json();
    const updatedOrder = await Order.findByIdAndUpdate(context.params.id, body, { new: true });
    
    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.log('Error updating order:', error);
    return NextResponse.json({ error: error}, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const deletedOrder = await Order.findByIdAndDelete(context.params.id);
    
    if (!deletedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Order deleted successfully" }, { status: 200 });
  } catch (error) {
    console.log('Error deleting order:', error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}