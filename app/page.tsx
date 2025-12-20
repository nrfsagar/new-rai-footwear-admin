import React from 'react';
import { Bell, Database, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">NRF Admin Dashboard</h1>
              <p className="mt-1 text-sm text-neutral-600">New Rai Footwear - Inventory & Management System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {/* Product Management Card */}
          <Link
            href="/dataupdate"
            className="group block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            <Card className="relative h-full overflow-hidden border border-neutral-200 bg-white transition-colors group-hover:bg-black">
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
              <CardHeader className="relative pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-black group-hover:text-white">Product Management</CardTitle>
                    <p className="mt-2 text-sm text-neutral-600 group-hover:text-neutral-300">Add, edit, and manage your product inventory</p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-white transition-colors group-hover:border-neutral-800 group-hover:bg-black">
                      <Database className="h-6 w-6 text-black group-hover:text-white" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="flex items-center text-sm text-neutral-600 group-hover:text-neutral-200">
                  <span>Open</span>
                  <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Notifications Card */}
          <Link
            href="/notifications"
            className="group block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            <Card className="relative h-full overflow-hidden border border-neutral-200 bg-white transition-colors group-hover:bg-black">
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
              <CardHeader className="relative pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-black group-hover:text-white">Send Notifications</CardTitle>
                    <p className="mt-2 text-sm text-neutral-600 group-hover:text-neutral-300">Broadcast messages and updates to users</p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-white transition-colors group-hover:border-neutral-800 group-hover:bg-black">
                      <Bell className="h-6 w-6 text-black group-hover:text-white" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="flex items-center text-sm text-neutral-600 group-hover:text-neutral-200">
                  <span>Open</span>
                  <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* All Users Card */}
          <Link
            href="/all-user"
            className="group block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            <Card className="relative h-full overflow-hidden border border-neutral-200 bg-white transition-colors group-hover:bg-black">
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
              <CardHeader className="relative pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-black group-hover:text-white">All Users</CardTitle>
                    <p className="mt-2 text-sm text-neutral-600 group-hover:text-neutral-300">View and manage all registered users</p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-white transition-colors group-hover:border-neutral-800 group-hover:bg-black">
                      <Users className="h-6 w-6 text-black group-hover:text-white" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="flex items-center text-sm text-neutral-600 group-hover:text-neutral-200">
                  <span>Open</span>
                  <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Settings Card */}
          <div className="cursor-not-allowed opacity-60">
            <Card className="h-full border border-dashed border-neutral-300 bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-black">Settings</CardTitle>
                    <p className="mt-2 text-sm text-neutral-600">Configure system settings and preferences</p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-white">
                      <Settings className="h-6 w-6 text-neutral-600" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xs font-semibold text-neutral-500">Coming Soon</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6">
          <h3 className="mb-3 text-lg font-semibold">Quick Tips</h3>
          <ul className="space-y-2 text-sm text-neutral-700">
            <li className="flex items-start">
              <span className="mr-3 font-bold text-black">•</span>
              <span><strong>Product Images:</strong> Upload high-quality images for better product visibility</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 font-bold text-black">•</span>
              <span><strong>Stock Management:</strong> Keep your inventory updated in real-time</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 font-bold text-black">•</span>
              <span><strong>Image Cleanup:</strong> Deleted products automatically remove images from the cloud</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 font-bold text-black">•</span>
              <span><strong>Categories:</strong> Organize products by gender, category, and subcategory</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
