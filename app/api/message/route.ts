import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json([{ company: 'आरपार',price: 190 },{company: 'bairathi',price: 130}]
        
    );
}