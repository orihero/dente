import React from 'react';

export const ProfileSkeleton: React.FC = () => {
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
            </div>

            <div className="space-y-4">
              {/* Profile photo skeleton */}
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse" />
              </div>

              {/* Info skeletons */}
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center text-gray-600">
                  <div className="w-5 h-5 mr-3 bg-gray-200 rounded animate-pulse" />
                  <div className="w-48 h-5 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}

              {/* Social links skeleton */}
              <div className="flex items-center gap-4 mt-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                    <div className="w-24 h-5 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Certificates section skeleton */}
          <div className="border-t border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
                <div className="w-40 h-6 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="aspect-[4/3] w-full bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </div>

          {/* Services section skeleton */}
          <div className="border-t border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
                <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg">
                    <div className="w-full h-6 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};