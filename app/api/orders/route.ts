import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongoose";
import Order from "@/lib/models/order.model";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { user_id, product_id, quantity } = body;

    if (!user_id || !product_id || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const order = await Order.create({
      user_id,
      product_id,
      quantity
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const user_id = url.searchParams.get('user_id');

    let query = {};
    if (user_id) {
      query = { user_id };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.log('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
