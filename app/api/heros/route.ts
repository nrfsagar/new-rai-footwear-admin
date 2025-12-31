// app/api/heros/route.ts
import { connectToDatabase } from "@/lib/mongoose";
import Hero from "@/lib/models/hero.model";

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch all hero banners sorted by banner_number
    const heros = await Hero.find({}).sort({ banner_number: 1 }).lean();

    return Response.json(heros);

  } catch (error) {
    console.error('Hero API Error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const hero = new Hero(body);
    await hero.save();

    return Response.json(hero);

  } catch (error) {
    console.error('Hero API Error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
