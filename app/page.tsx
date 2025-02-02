import React from 'react';
import { Bell, Database } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-8">
      <nav className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">NRF Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/dataupdate"
              className="group flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200"
            >
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <Database className="h-6 w-6 text-blue-600 group-hover:text-white" />
              </div>
              <div className="ml-4">
                <h2 className="font-semibold text-gray-800">Product List Update</h2>
                <p className="text-sm text-gray-500">Manage and update product information</p>
              </div>
            </a>

            <a
              href="/notifications"
              className="group flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200"
            >
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <Bell className="h-6 w-6 text-blue-600 group-hover:text-white" />
              </div>
              <div className="ml-4">
                <h2 className="font-semibold text-gray-800">Send Notifications</h2>
                <p className="text-sm text-gray-500">Broadcast messages to users</p>
              </div>
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
}
