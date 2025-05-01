// app/api/orders/[id]/route.ts
import { NextRequest } from 'next/server';
import { connectToDatabase } from "@/lib/mongoose";
import Order from "@/lib/models/order.model";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;
    const order = await Order.findById(id);
    
    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }
    
    return Response.json(order);
  } catch (error) {
    console.log('Error fetching order:', error);
    return Response.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;
    const body = await request.json();
    const updatedOrder = await Order.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedOrder) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }
    
    return Response.json(updatedOrder);
  } catch (error) {
    console.log('Error updating order:', error);
    return Response.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;
    const deletedOrder = await Order.findByIdAndDelete(id);
    
    if (!deletedOrder) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }
    
    return Response.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.log('Error deleting order:', error);
    return Response.json({ error: "Failed to delete order" }, { status: 500 });
  }
}