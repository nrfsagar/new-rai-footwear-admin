
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
import { Loader2 } from "lucide-react";
import ImageUpload from './ImageUpload';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { addProduct } from '@/lib/actions/actions';
import { useToast } from '@/components/ui/toast';

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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { addToast } = useToast();
  
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

  const validateForm = (formData: FormData): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) errors.name = 'Product name is required';
    if (!formData.gender?.trim()) errors.gender = 'Gender is required';
    if (!formData.category?.trim()) errors.category = 'Category is required';
    if (!formData.subcategory?.trim()) errors.subcategory = 'Subcategory is required';
    if (formData.stock < 0) errors.stock = 'Stock cannot be negative';
    if (!formData.sizes?.trim()) errors.sizes = 'Sizes are required';
    if (!formData.description?.trim()) errors.description = 'Description is required';
    if (formData.price <= 0) errors.price = 'Price must be greater than 0';
    if (formData.xprice < 0) errors.xprice = 'xPrice cannot be negative';
    if (!formData.quality?.trim()) errors.quality = 'Quality is required';
    if (images.length === 0) errors.images = 'At least one product image is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
      addToast(`${filesToUpload.length} design image(s) uploaded successfully`, 'success');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      console.error('Upload failed', error);
      addToast(`Design image upload failed: ${errorMsg}`, 'error');
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
      addToast(`${filesToUpload.length} product image(s) uploaded successfully`, 'success');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      console.error('Upload failed', error);
      addToast(`Product image upload failed: ${errorMsg}`, 'error');
    }
  };

  const resetForm = () => {
    form.reset();
    setImages([]);
    setCloudinaryUrls([]);
    setFiles([]);
    setImgFiles([]);
    setValidationErrors({});
  };

  const handleSubmit = async (formData: FormData) => {
    if (!validateForm(formData)) {
      addToast('Please fill in all required fields correctly', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const productData = {
        ...formData,
        images: images,
        otherDesignImg: cloudinaryUrls,
      };

      const result = await addProduct(productData);
      
      if (result.success) {
        addToast(result.message || 'Product added successfully!', 'success');
        resetForm();
        if (onSuccess) onSuccess();
      } else {
        addToast('Failed to add product', 'error');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to add product';
      console.error('Failed to add product:', error);
      addToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
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
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  {...form.register('name')}
                  placeholder="Enter product name"
                  className={`transition-all duration-200 focus:ring-2 focus:ring-primary ${
                    validationErrors.name ? 'border-red-500' : ''
                  }`}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-500">{validationErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select onValueChange={value => {
                  form.setValue('gender', value);
                  setValidationErrors(prev => ({ ...prev, gender: '' }));
                }}>
                  <SelectTrigger className={`w-full ${validationErrors.gender ? 'border-red-500' : ''}`}>
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
                {validationErrors.gender && (
                  <p className="text-sm text-red-500">{validationErrors.gender}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={value => {
                  form.setValue('category', value);
                  setValidationErrors(prev => ({ ...prev, category: '' }));
                }}>
                  <SelectTrigger className={`w-full ${validationErrors.category ? 'border-red-500' : ''}`}>
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
                {validationErrors.category && (
                  <p className="text-sm text-red-500">{validationErrors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory *</Label>
                <Select onValueChange={value => {
                  form.setValue('subcategory', value);
                  setValidationErrors(prev => ({ ...prev, subcategory: '' }));
                }}>
                  <SelectTrigger className={`w-full ${validationErrors.subcategory ? 'border-red-500' : ''}`}>
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
                {validationErrors.subcategory && (
                  <p className="text-sm text-red-500">{validationErrors.subcategory}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  {...form.register('stock', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  placeholder="Enter stock quantity"
                  className={`transition-all duration-200 focus:ring-2 focus:ring-primary ${
                    validationErrors.stock ? 'border-red-500' : ''
                  }`}
                />
                {validationErrors.stock && (
                  <p className="text-sm text-red-500">{validationErrors.stock}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  {...form.register('price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className={`transition-all duration-200 focus:ring-2 focus:ring-primary ${
                    validationErrors.price ? 'border-red-500' : ''
                  }`}
                  placeholder="0.00"
                />
                {validationErrors.price && (
                  <p className="text-sm text-red-500">{validationErrors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="xprice">xPrice (₹)</Label>
                <Input
                  {...form.register('xprice', { valueAsNumber: true })}
                  type="number"
                  step="1"
                  min="0"
                  className={`transition-all duration-200 focus:ring-2 focus:ring-primary ${
                    validationErrors.xprice ? 'border-red-500' : ''
                  }`}
                  placeholder="0"
                />
                {validationErrors.xprice && (
                  <p className="text-sm text-red-500">{validationErrors.xprice}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality">Quality *</Label>
                <Select onValueChange={value => {
                  form.setValue('quality', value);
                  setValidationErrors(prev => ({ ...prev, quality: '' }));
                }}>
                  <SelectTrigger className={`w-full ${validationErrors.quality ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Quality).map((quality) => (
                      <SelectItem 
                        key={quality} 
                        value={quality}
                        className="cursor-pointer hover:bg-primary/10"
                      >
                        {quality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.quality && (
                  <p className="text-sm text-red-500">{validationErrors.quality}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sizes">Sizes (comma-separated) *</Label>
                <Input
                  {...form.register('sizes')}
                  placeholder="e.g., 6,7,8,9,10"
                  className={`transition-all duration-200 focus:ring-2 focus:ring-primary ${
                    validationErrors.sizes ? 'border-red-500' : ''
                  }`}
                />
                {validationErrors.sizes && (
                  <p className="text-sm text-red-500">{validationErrors.sizes}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  {...form.register('description')}
                  placeholder="Enter product description"
                  className={`min-h-32 transition-all duration-200 focus:ring-2 focus:ring-primary resize-y ${
                    validationErrors.description ? 'border-red-500' : ''
                  }`}
                />
                {validationErrors.description && (
                  <p className="text-sm text-red-500">{validationErrors.description}</p>
                )}
              </div>
            </div>

            <Separator className="my-8" />

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Label htmlFor="product-images">Product Images *</Label>
                  <span className="text-sm text-gray-500">({images.length} selected)</span>
                </div>
                <ImageUpload
                  id="product-images"
                  label=""
                  files={imgfile}
                  setFiles={handleImageUpload}
                />
                {validationErrors.images && (
                  <p className="text-sm text-red-500 mt-2">{validationErrors.images}</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Label htmlFor="Other-images">Similar Design Images (Optional)</Label>
                  <span className="text-sm text-gray-500">({cloudinaryUrls.length} selected)</span>
                </div>
                <ImageUpload
                  id="Other-images"
                  label=""
                  files={files}
                  setFiles={handleFileUpload}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => resetForm()}
                disabled={isSubmitting}
              >
                Reset
              </Button>
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