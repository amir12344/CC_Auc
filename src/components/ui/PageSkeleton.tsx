'use client';

import { memo } from 'react';
import MainLayout from '@/src/components/layout/MainLayout';

interface PageSkeletonProps {
  type?: 'default' | 'product' | 'marketplace' | 'dashboard';
}

const PageSkeleton = ({ type = 'default' }: PageSkeletonProps) => {
  // For dashboard type, don't wrap in MainLayout since it's already in the dashboard layout
  if (type === 'dashboard') {
    return <DashboardSkeleton />;
  }

  return (
    <MainLayout>
      {type === 'marketplace' && <MarketplaceSkeleton />}
      {type === 'product' && <ProductSkeleton />}
      {type === 'default' && <DefaultSkeleton />}
    </MainLayout>
  );
};

const DefaultSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center">
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mx-auto mb-4"></div>
        <div className="h-6 w-96 bg-gray-200 rounded animate-pulse mx-auto mb-8"></div>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    </div>
  </div>
);

const MarketplaceSkeleton = () => (
  <>
    <div className="bg-white pt-3 w-full flex justify-center mb-4">
      <div className="flex flex-row items-center gap-4 md:gap-8 lg:gap-20 py-3 overflow-x-auto no-scrollbar">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full mb-1 animate-pulse"></div>
            <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>

    <div className="container mx-auto px-4 py-8">
      <div className="w-full h-20 bg-gray-100 rounded-lg animate-pulse mb-8"></div>

      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
        ))}
      </div>

      {Array(3).fill(0).map((_, sectionIndex) => (
        <div key={`section-${sectionIndex}`} className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={`product-${sectionIndex}-${i}`} className="animate-pulse">
                <div className="aspect-square w-full bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Pagination skeleton */}
      <div className="mt-12 flex justify-center">
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  </>
);

const ProductSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="mb-6">
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Product Gallery Skeleton */}
      <div className="space-y-4">
        <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-4 gap-2">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
      
      {/* Product Info Skeleton */}
      <div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4"></div>
          <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
    {/* Dashboard stats cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="h-5 w-24 bg-gray-200 rounded"></div>
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          </div>
          <div className="h-8 w-20 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
    
    {/* Dashboard content skeleton */}
    <div className="px-4 lg:px-6 mb-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>

    {/* Data table skeleton */}
    <div className="px-3">
      <div className="bg-white rounded-lg border">
        <div className="p-6">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default memo(PageSkeleton);
