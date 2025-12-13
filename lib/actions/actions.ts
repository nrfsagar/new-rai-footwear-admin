'use server'

import { connectToDatabase } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import { revalidatePath } from 'next/cache';
import { ProductFormData } from "@/types/products";
import { deleteImagesFromCloudinary } from "@/lib/cloudinary";

/**
 * Add a new product to the database
 */
export async function addProduct(data: ProductFormData) {
  try {
    await connectToDatabase();

    if (!data.name || !data.price || !data.stock === undefined || !data.images?.length) {
      throw new Error('Missing required fields: name, price, stock, and at least one image are required');
    }

    const newProduct = new Product(data);
    await newProduct.save();
    
    revalidatePath('/dataupdate');
    revalidatePath('/');
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(newProduct)),
      message: 'Product added successfully'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add product';
    console.error('Error adding product:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Delete a product and its images from Cloudinary
 */
export async function deleteProduct(id: string) {
  try {
    if (!id || id.trim() === '') {
      throw new Error('Invalid product ID');
    }

    await connectToDatabase();

    // Find the product before deleting to get image URLs
    const product = await Product.findById(id);
    
    if (!product) {
      throw new Error('Product not found');
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
    
    revalidatePath('/dataupdate');
    revalidatePath('/');

    return {
      success: true,
      message: 'Product and associated images deleted successfully'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
    console.error('Error deleting product:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Get all products or filtered products
 */
export async function getProducts(filters?: Record<string, string>) {
  try {
    await connectToDatabase();
    const query = filters && Object.keys(filters).length > 0 ? filters : {};
    const products = await Product.find(query).lean();
    return {
      success: true,
      data: products,
      count: products.length
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
    console.error('Error fetching products:', errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Update product stock
 */
export async function updateStock(id: string, newStock: number) {
  try {
    if (!id || id.trim() === '') {
      throw new Error('Invalid product ID');
    }

    if (typeof newStock !== 'number' || newStock < 0) {
      throw new Error('Stock must be a non-negative number');
    }

    await connectToDatabase();

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id },
      { stock: newStock },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      throw new Error('Product not found');
    }

    revalidatePath('/dataupdate');
    revalidatePath(`/${id}`);
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedProduct)),
      message: 'Stock updated successfully'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update stock';
    console.error('Error updating stock:', error);
    throw new Error(errorMessage);
  }
}