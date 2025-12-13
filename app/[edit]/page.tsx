"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Package2, ArrowLeft } from 'lucide-react';
import { updateStock } from '@/lib/actions/actions';
import { useToast } from '@/components/ui/toast';
import Link from 'next/link';

const StockUpdateComponent = ({
  params,
}: {
  params: Promise<{ edit: string }>
}) => {
  const [stock, setStock] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async () => {
    try {
      const id = (await params).edit;
      
      // Validation
      if (!stock || stock.trim() === '') {
        addToast('Please enter a stock quantity', 'error');
        return;
      }

      const stockNum = parseInt(stock, 10);
      if (isNaN(stockNum)) {
        addToast('Stock must be a valid number', 'error');
        return;
      }

      if (stockNum < 0) {
        addToast('Stock cannot be negative', 'error');
        return;
      }

      setIsLoading(true);
      const result = await updateStock(id, stockNum);
      
      if (result?.success) {
        addToast(`Stock updated to ${stockNum} units successfully`, 'success');
        setStock('');
        // Redirect back after 2 seconds
        setTimeout(() => {
          window.location.href = '/dataupdate';
        }, 2000);
      } else {
        addToast('Failed to update stock', 'error');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update stock';
      addToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && stock.trim()) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Link href="/dataupdate" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100">
                <Package2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Update Stock</CardTitle>
                <CardDescription className="mt-1">
                  Enter the new stock quantity for this product
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                Stock Quantity *
              </label>
              <Input
                id="stock"
                type="number"
                placeholder="Enter new stock quantity"
                value={stock}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setStock(e.target.value);
                }}
                onKeyPress={handleKeyPress}
                className="w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                min="0"
                disabled={isLoading}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be a non-negative whole number
              </p>
            </div>

            {stock && !isNaN(parseInt(stock, 10)) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">New stock:</span> {stock} units
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-3">
            <Link href="/dataupdate" className="flex-1">
              <Button
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </Link>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={!stock || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Updating...
                </span>
              ) : (
                'Update Stock'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default StockUpdateComponent;