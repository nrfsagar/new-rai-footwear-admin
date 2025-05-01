
"use client"
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2 } from "lucide-react";
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
  Sport= 'Sport',
  Foam = 'Foam',
  Formal = 'Formal',
  School_shoes = 'School-shoes',
  China = 'China',
  Filone = 'Filone',
  Hawaii = 'Hawaii',
  Pu = 'Pu',
  Fancy = 'Fancy',
  Crocs = 'Crocs',
  Pu_fancy = 'Pu-fancy'
}

interface FormData {
  name: string;
  gender: string;
  category: string;
  subcategory: string;
  stock: number;
  sizes: string;
  description: string;
  price: number;
  xprice: number;
  quality: string;
}

const ProductForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [images, setImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [imgfile, setImgFiles] = useState<File[]>([]);
  const [cloudinaryUrls, setCloudinaryUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      gender: '',
      category: '',
      subcategory: '',
      stock: 0,
      sizes: '',
      description: '',
      price: 0,
      xprice: 0,
      quality: ''
    }
  });

  const handleFileUpload = async (newFiles: File[]) => {
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

  const handleImageUpload = async (newImgFiles: File[]) => {
    const filesToUpload = newImgFiles.filter(
      newImgFile => !imgfile.some(
        existingFile => 
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

  const resetForm = () => {
    form.reset();
    setImages([]);
    setCloudinaryUrls([]);
    setFiles([]);
    setImgFiles([]);
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const productData = {
        ...formData,
        images: images,
        otherDesignImg: cloudinaryUrls,
      };

      const result = await addProduct(productData);
      
      if (result !== undefined) {
        setShowSuccess(true);
        resetForm();
        if (onSuccess) onSuccess();
        
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to add product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Product added successfully!
          </AlertDescription>
        </Alert>
      )}

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Add New Product
            {isSubmitting && (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  {...form.register('name')}
                  placeholder="Enter product name"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={value => form.setValue('gender', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Gender).map((gender) => (
                      <SelectItem 
                        key={gender} 
                        value={gender}
                        className="cursor-pointer hover:bg-primary/10"
                      >
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={value => form.setValue('category', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Category).map((category) => (
                      <SelectItem 
                        key={category} 
                        value={category.toLowerCase()}
                        className="cursor-pointer hover:bg-primary/10"
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Select onValueChange={value => form.setValue('subcategory', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Subcategory).map((subcategory) => (
                      <SelectItem 
                        key={subcategory} 
                        value={subcategory.toLowerCase()}
                        className="cursor-pointer hover:bg-primary/10"
                      >
                        {subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  {...form.register('stock', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  placeholder="Enter stock quantity"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    {...form.register('price', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="pl-8 transition-all duration-200 focus:ring-2 focus:ring-primary"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="xprice">xPrice</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    {...form.register('xprice', { valueAsNumber: true })}
                    type="number"
                    step="1"
                    className="pl-8 transition-all duration-200 focus:ring-2 focus:ring-primary"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality">Quality</Label>
                <Select onValueChange={value => form.setValue('quality', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Quality).map((quality) => (
                      <SelectItem 
                        key={quality} 
                        value={quality}
                        className="cursor-pointer hover:bg-primary/10"
                      >
                        {quality.charAt(0).toUpperCase() + quality.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sizes">Sizes</Label>
                <Input
                  {...form.register('sizes')}
                  placeholder="e.g., 6,7,8,9,10"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  {...form.register('description')}
                  placeholder="Enter product description"
                  className="min-h-32 transition-all duration-200 focus:ring-2 focus:ring-primary resize-y"
                />
              </div>
            </div>

            <Separator className="my-8" />

            <div className="space-y-6">
              <ImageUpload
                id="product-images"
                label="Product Images"
                files={imgfile}
                setFiles={handleImageUpload}
                
              />

              <ImageUpload
                id="Other-images"
                label="Similar Design"
                files={files}
                setFiles={handleFileUpload}
               
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="w-full md:w-auto min-w-[200px] relative overflow-hidden transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding Product...
                  </span>
                ) : (
                  'Add Product'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductForm;