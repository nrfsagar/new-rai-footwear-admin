// app/api/products/route.ts
import { connectToDatabase } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";



export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const filters: Record<string, string> = {};
    
    const gender = searchParams.get('gender');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');

    if (gender) filters.gender = gender;
    if (category) filters.category = category;
    if (subcategory) filters.subcategory = subcategory;
     

    const products = await Product.find(filters).lean();

    return Response.json(products);

  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const product = new Product(body);
    await product.save();

    return Response.json(product);

  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

