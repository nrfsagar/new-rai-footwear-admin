"use client"
import React, { useCallback, useState, useEffect } from 'react';
import { Products } from '@/types/products';
import ProductForm from '@/components/ProductForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package, Trash2, PenSquare, Loader2, RefreshCw } from 'lucide-react';
import { deleteProduct } from '@/lib/actions/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';
import Link from 'next/link';
import axios from 'axios';

// Define valid categories type
type CategoryType = 'all'|'shoe' | 'sandals' | 'slippers';

// Define subcategories record type
type SubcategoriesType = {
  [K in CategoryType]: string[];
};

export default function Page() {
  const [products, setProducts] = useState<Products[]>([]);
  const [category, setCategory] = useState<CategoryType>('all');
  const [subcategory, setSubcategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; productId?: string; productName?: string }>({ isOpen: false });
  const { addToast } = useToast();
  
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

      const url = `/api/products?${queryParams.toString()}`;
      const response = await axios.get(url);
      
      if (Array.isArray(response.data)) {
        setProducts(response.data.sort((a, b) => new Date(b.timestamp).valueOf() - new Date(a.timestamp).valueOf()));
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      addToast('Failed to load products', 'error');
      setProducts([]);
    }
    setLoading(false);
    setRefreshing(false);
  }, [category, subcategory, addToast]);

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

  const handleDeleteClick = (productId: string, productName: string) => {
    setConfirmDialog({ isOpen: true, productId, productName });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.productId) return;

    const productId = confirmDialog.productId;
    setDeletingId(productId);
    
    try {
      await deleteProduct(productId);
      
      // Optimistically remove product from UI
      setProducts(prev => prev.filter(p => p._id !== productId));
      addToast(`"${confirmDialog.productName}" deleted successfully`, 'success');
      setConfirmDialog({ isOpen: false });
      
      // Reload to ensure consistency
      setTimeout(() => loadProducts(), 500);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete product';
      addToast(errorMsg, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Product"
        description={`Are you sure you want to delete "${confirmDialog.productName}"? This action will also delete all associated images from the cloud and cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deletingId === confirmDialog.productId}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false })}
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Products Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product inventory and listings</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-auto">
            <Select
              value={category}
              onValueChange={(value: CategoryType) => setCategory(value)}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="shoe">Shoes</SelectItem>
                <SelectItem value="sandals">Sandals</SelectItem>
                <SelectItem value="slippers">Slippers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <Select value={subcategory} onValueChange={setSubcategory}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Subcategory" />
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
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Refreshing
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] bg-gray-100">
          <TabsTrigger value="products" className="flex items-center gap-2 data-[state=active]:bg-white">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Products</span>
            {products.length > 0 && (
              <span className="ml-1 text-xs bg-primary text-white rounded-full px-2 py-0.5">
                {products.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2 data-[state=active]:bg-white">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="space-y-4">
          <ProductForm onSuccess={() => {
            addToast('Product added! Refreshing list...', 'success');
            setTimeout(() => loadProducts(), 1000);
          }} />
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Products ({products.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                  <p className="text-gray-500">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-900">No products found</p>
                  <p className="text-sm text-gray-500 mt-1">Get started by adding your first product</p>
                  <Link href="#" onClick={() => {
                    const elem = document.querySelector('[value="add"]') as HTMLElement;
                    elem?.click();
                  }}>
                    <Button className="mt-4">Add Your First Product</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-max">
                  {products.map((product) => (
                    <Card 
                      key={product._id} 
                      className={`overflow-hidden group transition-opacity duration-200 ${
                        deletingId === product._id ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <div className="aspect-video w-full overflow-hidden relative bg-gray-100">
                        {product.images[0] ? (
                          <>
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg truncate text-gray-900" title={product.name}>
                            {product.name}
                          </h3>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                            <p>
                              <span className="font-medium">Price:</span> ₹{product.price}
                            </p>
                            <p>
                              <span className="font-medium">Stock:</span> {product.stock}
                            </p>
                            <p className="col-span-2">
                              <span className="font-medium">Sizes:</span>{' '}
                              {Array.isArray(product.sizes) ? product.sizes.join(", ") : product.sizes}
                            </p>
                          </div>
                        </div>
                        
                        {product.otherDesignImg?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-2">Design Variants ({product.otherDesignImg.length})</p>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {product.otherDesignImg.map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Design ${index + 1}`}
                                  className="w-14 h-14 rounded-md object-cover flex-shrink-0 hover:scale-110 transition-transform duration-200 border border-gray-200"
                                  loading="lazy"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2 border-t">
                          <Link href={`/${product._id}`} className="flex-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full flex items-center gap-2"
                              disabled={deletingId === product._id}
                            >
                              <PenSquare className="w-4 h-4" />
                              Edit Stock
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(product._id, product.name)}
                            className="flex-1 flex items-center gap-2"
                            disabled={deletingId === product._id}
                          >
                            {deletingId === product._id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Deleting
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </>
                            )}
                          </Button>
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
