import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import { deleteImagesFromCloudinary } from '@/lib/cloudinary';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!id || id.trim() === '') {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: "Failed to fetch product", details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!id || id.trim() === '') {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // Find the product before deleting to get image URLs
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Collect all image URLs to delete from Cloudinary
    const imagesToDelete: string[] = [];
    
    if (product.images && Array.isArray(product.images)) {
      imagesToDelete.push(...product.images);
    }
    
    if (product.otherDesignImg && Array.isArray(product.otherDesignImg)) {
      imagesToDelete.push(...product.otherDesignImg);
    }

    // Delete images from Cloudinary
    if (imagesToDelete.length > 0) {
      const deleteResults = await deleteImagesFromCloudinary(imagesToDelete);
      const successCount = deleteResults.filter(r => r).length;
      console.log(`Deleted ${successCount}/${imagesToDelete.length} images from Cloudinary`);
    }

    // Delete the product from MongoDB
    await Product.findByIdAndDelete(id);

    return NextResponse.json({ 
      success: true, 
      message: "Product and associated images deleted successfully" 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { 
        error: "Failed to delete product", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}
