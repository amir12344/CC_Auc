'use client';

import MainLayout from '@/src/components/layout/MainLayout';

export const AuctionDetailSkeleton = () => (
 <MainLayout>
  <div className="min-h-screen bg-white">
   {/* Breadcrumb Skeleton */}
   <div className="border-gray-100 border-b">
    <div className="mx-auto max-w-8xl px-6 py-4">
     <div className='h-6 w-1/3 animate-pulse rounded bg-gray-200' />
    </div>
   </div>

   <div className="mx-auto max-w-8xl px-6 py-6">
    <div className="space-y-8">
     {/* Back Button Skeleton */}
     <div className='h-10 w-24 animate-pulse rounded bg-gray-200' />

     {/* Main Content Two-Column Layout */}
     <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6">
      {/* Left Column: Image Gallery */}
      <div className="lg:col-span-2">
       <div className='h-96 w-full animate-pulse rounded bg-gray-200' />
       <div className="mt-4 grid grid-cols-4 gap-2">
        {new Array(4).fill(null).map((_, i) => (
         <div
          className='h-20 animate-pulse rounded bg-gray-200'
          key={`gallery-thumb-${i}`}
         />
        ))}
       </div>
      </div>

      {/* Right Column: Bidding Area */}
      <div className='space-y-4 lg:col-span-3'>
       <div className='h-12 w-3/4 animate-pulse rounded bg-gray-200' />
       <div className='h-24 animate-pulse rounded bg-gray-200' />
       <div className='h-12 w-full animate-pulse rounded bg-gray-200' />
      </div>
     </div>

     {/* Auction Details Card */}
     <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className='mb-6 h-8 w-48 animate-pulse rounded bg-gray-200' />

      {/* First Row of Info Cards */}
      <div className='mb-6 flex flex-wrap gap-4'>
       {new Array(3).fill(null).map((_, i) => (
        <div
         className="flex items-center gap-3"
         key={`info-card-1-${i}`}
        >
         <div className='h-9 w-9 animate-pulse rounded bg-gray-200' />
         <div className="space-y-2">
          <div className='h-4 w-20 animate-pulse rounded bg-gray-200' />
          <div className='h-5 w-32 animate-pulse rounded bg-gray-200' />
         </div>
        </div>
       ))}
      </div>

      {/* Divider */}
      <div className='my-6 border-gray-200 border-t' />

      {/* Second Row of Info Cards */}
      <div className="flex flex-wrap gap-4">
       {new Array(2).fill(null).map((_, i) => (
        <div
         className="flex items-center gap-3"
         key={`info-card-2-${i}`}
        >
         <div className='h-9 w-9 animate-pulse rounded bg-gray-200' />
         <div className="space-y-2">
          <div className='h-4 w-20 animate-pulse rounded bg-gray-200' />
          <div className='h-5 w-32 animate-pulse rounded bg-gray-200' />
         </div>
        </div>
       ))}
      </div>
     </div>

     {/* Manifest Section Skeleton */}
     <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="h-64 rounded bg-gray-200" />
     </div>

     {/* Additional Details Section Skeleton */}
     <div className="animate-pulse space-y-4">
      <div className="h-8 w-64 rounded bg-gray-200" />
      <div className="h-48 rounded bg-gray-200" />
     </div>
    </div>
   </div>
  </div>
 </MainLayout>
);
