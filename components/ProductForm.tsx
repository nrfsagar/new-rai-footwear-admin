'use client'
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUpload from './ImageUpload';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { addProduct } from '@/lib/actions/actions';

enum Gender {
  MALE = 'man',
  FEMALE = 'women',
  Kids = 'kids'
}

enum Category {
    Shoe = 'shoe',
  Sandals = 'sandals',
  Slippers = 'slippers',

}

enum Quality {
    FRESH = 'Fresh',
    SECOND = 'Second',
}

enum Subcategory {
    Eva = 'Eva',
    Sole = 'Air sole',
    Foam='Foam',
    Formal='Formal',
    Shoes='School shoes',
    China='China',
    Filone = 'Filone',
    Air = 'Air',
    Pu='Pu',
    Fancy='Fancy',
    Cross='Cross',
    Wacker='Wacker',
    Pu_fancy='Pu-fancy'
}


const ProductForm = () => {
  
  const [images, setImages] = useState<string[]>([]);
  
  const [files, setFiles] = useState<File[]>([]);
  const [imgfile, setImgFiles] = useState<File[]>([]);
  const [cloudinaryUrls, setCloudinaryUrls] = useState<string[]>([]);
  
  console.log(cloudinaryUrls)
  console.log(images)

  
  // const handleFileUpload = async (newFiles: File[]) => {
  //   setIsUploading(true);
  //   try {
  //     const urls = await Promise.all(
  //       newFiles.map(file => uploadToCloudinary(file))
  //     );
  //     setCloudinaryUrls(prev => [...prev, ...urls]);
  //     setFiles(prev => [...prev, ...newFiles]);
  //   } catch (error) {
  //     console.error('Upload failed', error);
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  const handleFileUpload = async (newFiles: File[]) => {
    // Filter out files that have already been uploaded
    const filesToUpload = newFiles.filter(
      newFile => !files.some(existingFile => 
        existingFile.name === newFile.name && existingFile.size === newFile.size
      )
    );

    if (filesToUpload.length === 0) return;

    
    try {
      const urls = await Promise.all(
        filesToUpload.map(file => uploadToCloudinary(file))
      );
      
      setCloudinaryUrls(prev => [...prev, ...urls]);
      setFiles(prev => [...prev, ...filesToUpload]);
    } catch (error) {
      console.error('Upload failed', error);
    } 
  };

  // const handleImageUpload = async (newImgFiles: File[]) => {
  //   // Filter out files that have already been uploaded
  //   const filesToUpload = newImgFiles.filter(
  //     newImgFile => !files.some(existingFile => 
  //       existingFile.name === newImgFile.name && existingFile.size === newImgFile.size
  //     )
  //   );

  //   if (filesToUpload.length === 0) return;

  //   setIsUploading(true);
  //   try {
  //     const urls = await Promise.all(
  //       filesToUpload.map(file => uploadToCloudinary(file))
  //     );
      
  //     setImages(prev => [...prev, ...urls]);
  //     setImgFiles(prev => [...prev, ...filesToUpload]);
  //   } catch (error) {
  //     console.error('Upload failed', error);
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };
  const handleImageUpload = async (newImgFiles: File[]) => {
    // Filter out files that have already been uploaded based on existing image files
    const filesToUpload = newImgFiles.filter(
      newImgFile => !imgfile.some(
        (existingFile: File) => 
          existingFile.name === newImgFile.name && 
          existingFile.size === newImgFile.size
      )
    );
  
    if (filesToUpload.length === 0) return;
  
  
    try {
      const urls = await Promise.all(
        filesToUpload.map(file => uploadToCloudinary(file))
      );
  
      setImages(prev => [...prev, ...urls]);
      setImgFiles(prev => [...prev, ...filesToUpload]);
    } catch (error) {
      console.error('Upload failed', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const productData = {
      name: formData.get('name'),
      gender: formData.get('gender'),
      category: formData.get('category'),
      subcategory: formData.get('subcategory'),
      stock: Number(formData.get('stock')),
      sizes: formData.get('sizes'),
      description: formData.get('description'),
      price: Number(formData.get('price')),
      quality: formData.get('quality'),
      images:images,
      otherDesignImg:cloudinaryUrls,
    };

    // Ensure all fields are strings and not null
    const validatedProductData = {
      name: productData.name as string,
      gender: productData.gender as string,
      category: productData.category as string,
      subcategory: productData.subcategory as string,
      stock: productData.stock,
      sizes: productData.sizes as string,
      description: productData.description as string,
      price: productData.price,
      quality: productData.quality as string,
      images: productData.images,
      otherDesignImg: productData.otherDesignImg,
    };

    const result = await addProduct(validatedProductData);
    if (result !== undefined) {
      setImages([]);
      setCloudinaryUrls([]);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Products</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select name="gender" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Gender).map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Category).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select name="subcategory" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Subcategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                placeholder="Enter stock quantity"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  className="pl-8"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality">Quality</Label>
              <Select name="quality" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Quality).map((quality) => (
                    <SelectItem key={quality} value={quality}>
                      {quality.charAt(0).toUpperCase() + quality.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sizes">Sizes</Label>
              <Input
                id="sizes"
                name="sizes"
                type="text"
                placeholder="Enter sizes"
                required
              />
            </div>



            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter product description"
                className="min-h-32"
                required
              />
            </div>
          </div>

          <Separator />
          <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Product Image</Label>
          <ImageUpload
      id="product-images"
      label="Product Images"
      files={imgfile}
      setFiles={handleImageUpload}
      // isUploading={isUploading}
    />
</div>
<div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Other Design</Label>
          <ImageUpload
      id="Other-images"
      label="Other Design"
      files={files}
      setFiles={handleFileUpload}
      // isUploading={isUploading}
    />
    </div>
    
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="w-full md:w-auto"
            >
              Add Product
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;


