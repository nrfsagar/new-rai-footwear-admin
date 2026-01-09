import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongoose";
import Order from "@/lib/models/order.model";
import mongoose from 'mongoose';

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
    console.log('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const user_id = url.searchParams.get('user_id');
    const status = url.searchParams.get('status');
    const expand = url.searchParams.get('expand');

    let query: Record<string, unknown> = {};
    if (user_id) query = { ...query, user_id };
    if (status) {
      const statuses = status
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (statuses.length === 1) {
        query = { ...query, status: statuses[0] };
      } else if (statuses.length > 1) {
        query = { ...query, status: { $in: statuses } };
      }
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    const expansions = new Set(
      (expand ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    );

    if (!expansions.has('user') && !expansions.has('product')) {
      return NextResponse.json({ orders });
    }

    const plainOrders = orders.map((order: any) => (typeof order?.toObject === 'function' ? order.toObject() : order));

    const userIdStrings = Array.from(
      new Set(plainOrders.map((o: any) => String(o.user_id ?? '')).filter((v: string) => v.length > 0))
    );
    const productIdStrings = Array.from(
      new Set(plainOrders.map((o: any) => String(o.product_id ?? '')).filter((v: string) => v.length > 0))
    );

    let userByIdOrEmail = new Map<string, { _id?: string; name?: string; email?: string }>();
    let productById = new Map<string, any>();

    if (expansions.has('user') && userIdStrings.length > 0) {
      const objectIdUserIds = userIdStrings.filter((id) => mongoose.Types.ObjectId.isValid(id));
      const emailUserIds = userIdStrings.filter((id) => id.includes('@'));

      const { default: AppNotification } = await import('@/lib/models/notification.model');

      const users: any[] = [];
      if (objectIdUserIds.length > 0) {
        users.push(
          ...(await AppNotification.find({ _id: { $in: objectIdUserIds } })
            .select('name email')
            .lean())
        );
      }
      if (emailUserIds.length > 0) {
        users.push(
          ...(await AppNotification.find({ email: { $in: emailUserIds } })
            .select('name email')
            .lean())
        );
      }

      for (const u of users) {
        if (u?._id) userByIdOrEmail.set(String(u._id), { _id: String(u._id), name: u.name, email: u.email });
        if (u?.email) userByIdOrEmail.set(String(u.email), { _id: u?._id ? String(u._id) : undefined, name: u.name, email: u.email });
      }
    }

    if (expansions.has('product') && productIdStrings.length > 0) {
      const objectIdProductIds = productIdStrings.filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (objectIdProductIds.length > 0) {
        const { default: Product } = await import('@/lib/models/product.model');
        const products = await Product.find({ _id: { $in: objectIdProductIds } }).lean();
        for (const p of products) {
          if (p?._id) productById.set(String(p._id), p);
        }
      }
    }

    const enrichedOrders = plainOrders.map((o: any) => {
      const userKey = String(o.user_id ?? '');
      const user = expansions.has('user') ? (userByIdOrEmail.get(userKey) ?? userByIdOrEmail.get(String(o.user_email ?? '')) ?? null) : undefined;
      const productKey = String(o.product_id ?? '');
      const product = expansions.has('product') ? (productById.get(productKey) ?? null) : undefined;

      return {
        ...o,
        user,
        user_name: user?.name ?? null,
        user_email: user?.email ?? null,
        product,
      };
    });

    return NextResponse.json({ orders: enrichedOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
