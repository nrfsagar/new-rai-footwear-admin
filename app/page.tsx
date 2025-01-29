"use client"
import React, { useCallback, useState, useEffect } from 'react';
import { Products } from '@/types/products';
import ProductForm from '@/components/ProductForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package, Trash2, PenSquare, Loader2 } from 'lucide-react';
import { deleteProduct } from '@/lib/actions/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';
import axios from 'axios';

// Define valid categories type
type CategoryType = 'all'|'shoe' | 'sandals' | 'slippers';

// Define subcategories record type
type SubcategoriesType = {
  [K in CategoryType]: string[];
};

export default function Home() {
  const [products, setProducts] = useState<Products[]>([]);
  const [category, setCategory] = useState<CategoryType>('all');
  const [subcategory, setSubcategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const subcategories: SubcategoriesType = {
    all:["all"],
    shoe: ['All','Eva', 'Air-sole', 'Foam', 'Formal', 'School-shoes', 'China'],
    sandals: ['All','Filone', 'Air', 'Pu', 'Fancy', 'China', 'Cross'],
    slippers: ['All','Pu', 'Air', 'Eva', 'Cross', 'Wacker', 'Pu-fancy', 'China'],
  };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (category !== 'all') queryParams.append('category', category);
      if (subcategory !== 'all') queryParams.append('subcategory', subcategory);
      // queryParams.append('category', category);
      // queryParams.append('subcategory', subcategory);

      const url = `https://nrf-admin-gsl7.vercel.app/api/products?${queryParams.toString()}`;
      console.log(url)
      const response = await axios.get(url);
      
      if (Array.isArray(response.data)) {
        setProducts(response.data)//.sort((a:any, b:any) => new Date(b.updatetime).getTime() - new Date(a.updatetime).getTime()));
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
    setLoading(false);
    setRefreshing(false);
  }, [category, subcategory]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts, category, subcategory]);

  // Update subcategory when category changes
  useEffect(() => {
    setSubcategory(subcategories[category][0]);
  }, [category]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };
  console.log(category)
  console.log(subcategory)
  

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
        <h1 className="text-2xl md:text-3xl font-bold">NRF Admin Dashboard</h1>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
          <div className="w-full sm:w-auto">
            <Select
              value={category}
              onValueChange={(value: CategoryType) => setCategory(value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="all">All</SelectItem>
                <SelectItem value="shoe">Shoe</SelectItem>
                <SelectItem value="sandals">Sandals</SelectItem>
                <SelectItem value="slippers">Slippers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <Select value={subcategory} onValueChange={setSubcategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                {subcategories[category].map((subcat) => (
                  <SelectItem key={subcat} value={subcat.toLocaleLowerCase()}>
                    {subcat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className="w-full sm:w-auto"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Package className="w-4 h-4 mr-2" />
            )}
            Refresh ({products.length})
          </Button>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Product List
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="space-y-4">
          <ProductForm />
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Products ({products.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900">No products found</p>
                  <p className="text-sm text-gray-500">Get started by adding your first product</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <Card key={product._id} className="overflow-hidden group">
                      <div className="aspect-video w-full overflow-hidden relative">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <CardContent className="p-4 space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                          <p className="text-sm text-gray-500">
                            Price: ₹{product.price}
                          </p>
                          <p className="text-sm text-gray-500">
                            Sizes: {Array.isArray(product.sizes) ? product.sizes.join(", ") : product.sizes}
                          </p>
                        </div>
                        
                        {product.otherDesignImg?.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {product.otherDesignImg.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Design ${index + 1}`}
                                className="w-16 h-16 rounded-md object-cover flex-shrink-0 hover:scale-105 transition-transform duration-300"
                              />
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Link href={`/edit/${product._id}`} className="flex-1">
                            <Button
                              variant="outline"
                              className="w-full flex items-center gap-2"
                            >
                              <PenSquare className="w-4 h-4" />
                              Edit
                            </Button>
                          </Link>
                          <form action={deleteProduct.bind(null, product._id)} className="flex-1">
                            <Button
                              variant="destructive"
                              type="submit"
                              className="w-full flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </form>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}