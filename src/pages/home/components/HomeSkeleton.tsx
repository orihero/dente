import React from 'react';

export const HomeSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
            <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-20">
        <div className="bg-white rounded-lg shadow p-4">
          {/* Date navigation skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex flex-col items-center">
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          </div>

          {/* Appointments skeleton */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="relative">
                <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="relative flex gap-6 py-4">
                  <div className="relative z-10">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                  </div>
                  <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="w-48 h-5 bg-gray-200 rounded animate-pulse mb-2" />
                        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="mt-2">
                      <div className="w-36 h-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};