import React from 'react';
import { Bell, Database, Settings } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">NRF Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">New Rai Footwear - Inventory & Management System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Product Management Card */}
          <Link href="/dataupdate" className="group">
            <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-gray-900">Product Management</CardTitle>
                    <p className="text-sm text-gray-600 mt-2">Add, edit, and manage your product inventory with ease</p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 group-hover:bg-blue-600 transition-colors duration-300">
                      <Database className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="flex items-center text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                  <span>Manage products</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Notifications Card */}
          <Link href="/notifications" className="group">
            <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-gray-900">Send Notifications</CardTitle>
                    <p className="text-sm text-gray-600 mt-2">Broadcast messages and updates to your users instantly</p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100 group-hover:bg-purple-600 transition-colors duration-300">
                      <Bell className="h-6 w-6 text-purple-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="flex items-center text-sm text-gray-600 group-hover:text-purple-600 transition-colors">
                  <span>Send notifications</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Settings Card */}
          <div className="group opacity-50 cursor-not-allowed">
            <Card className="h-full border-dashed">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-gray-900">Settings</CardTitle>
                    <p className="text-sm text-gray-600 mt-2">Configure system settings and preferences</p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gray-100">
                      <Settings className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-500 font-medium">Coming Soon</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Quick Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-3 font-bold text-blue-600">•</span>
              <span><strong>Product Images:</strong> Upload high-quality images for better product visibility</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 font-bold text-blue-600">•</span>
              <span><strong>Stock Management:</strong> Keep your inventory updated in real-time</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 font-bold text-blue-600">•</span>
              <span><strong>Image Cleanup:</strong> Deleted products automatically remove images from the cloud</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 font-bold text-blue-600">•</span>
              <span><strong>Categories:</strong> Organize products by gender, category, and subcategory</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
