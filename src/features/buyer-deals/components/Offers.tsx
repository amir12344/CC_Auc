'use client'

import { Badge } from '@/src/components/ui/badge'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Card, CardContent } from '@/src/components/ui/card'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'

// Define the Deal interface to match the data structure
interface Deal {
  id: number
  title: string
  seller: string
  category: string
  units: number
  price: number
  status: 'Draft' | 'In Progress' | 'Action Required' 
  date: string
  productCount?: number
}

// Sample data for deals
const sampleDeals: Deal[] = [
  {
    id: 1001,
    title: 'Willing Beauty',
    seller: 'Skincare & Lip Treatments',
    category: 'Beauty',
    units: 5000,
    price: 42174.9,
    status: 'Draft',
    date: 'Apr 14, 2025',
  },
  {
    id: 1002,
    title: 'Stokke',
    seller: 'Cushion, Highchairs & More',
    category: 'Baby',
    units: 76,
    price: 50.0,
    status: 'In Progress',
    date: 'Apr 14, 2025',
  },
  {
    id: 1003,
    title: 'House Warming',
    seller: 'Sofas & More',
    category: 'Home',
    units: 1570,
    price: 768482.91,
    status: 'Draft',
    date: 'Apr 14, 2025',
  },
  {
    id: 1004,
    title: 'Mepal',
    seller: 'Food Storage, Dishes & More',
    category: 'Kitchen',
    units: 1000,
    price: 1000.0,
    status: 'Draft',
    date: 'Apr 14, 2025',
  },
  {
    id: 1005,
    title: 'Assortment',
    seller: 'COSRX, Klairs & More',
    category: 'Beauty',
    units: 5477,
    price: 12870.95,
    status: 'Draft',
    date: 'Apr 14, 2025',
  },
  {
    id: 1006,
    title: 'Assortment',
    seller: 'COSRX, Klairs & More',
    category: 'Beauty',
    units: 5477,
    price: 12870.95,
    status: 'Action Required',
    date: 'Apr 14, 2025',
  },
  {
    id: 1007,
    title: 'Assortment',
    seller: 'COSRX, Klairs & More',
    category: 'Beauty',
    units: 5477,
    price: 12870.95,
    status: 'Action Required',
    date: 'Apr 14, 2025',
  },
  {
    id: 1008,
    title: 'Assortment',
    seller: 'COSRX, Klairs & More',
    category: 'Beauty',
    units: 5477,
    price: 12870.95,
    status: 'Action Required',
    date: 'Apr 14, 2025',
  },
]

export default function Offers() {
  // State for deals data with loading state
  const [deals, setDeals] = useState<Deal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState('Most Recent')
  const [activeTab, setActiveTab] = useState<'Draft' | 'In Progress' | 'Action Required'>('Draft')

  // Simulate data fetching
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await fetch('/api/deals')
        // const data = await response.json()
        setDeals(sampleDeals)
      } catch (error) {
        console.error('Error fetching deals:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Add a small delay to simulate network request
    const timer = setTimeout(() => {
      fetchDeals()
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Filter and sort deals based on user selection
  const filteredAndSortedDeals = useMemo(() => {
    let result = [...deals]

    // Apply status filter based on active tab
    result = result.filter((deal) => deal.status === activeTab)

    // Apply sorting
    switch (sortBy) {
      case 'Price: High to Low':
        return result.sort((a, b) => b.price - a.price)
      case 'Price: Low to High':
        return result.sort((a, b) => a.price - b.price)
      case 'Most Recent':
      default:
        return result
    }
  }, [deals, sortBy, activeTab])

  // Handle tab change with useCallback
  const handleTabChange = useCallback((tab: 'Draft' | 'In Progress' | 'Action Required') => {
    setActiveTab(tab)
  }, [])

  // Handle sort change with useCallback
  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSortBy(e.target.value)
    },
    []
  )

  // Format price with proper currency formatting
  const formatPrice = useCallback((price: number) => {
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }, [])

  return (
    <div className='w-full max-w-6xl mx-auto'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
        {/* Status Filter - More Rounded Buttons */}
        <div className='flex flex-wrap gap-2'>
          <button
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${activeTab === 'Draft' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => handleTabChange('Draft')}
          >
            Draft
          </button>
          <button
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${activeTab === 'In Progress' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => handleTabChange('In Progress')}
          >
            In Progress
          </button>
          <button
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${activeTab === 'Action Required' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => handleTabChange('Action Required')}
          >
            Action Required
          </button>
        </div>

        <div className='flex items-center'>
          <span className='text-sm text-gray-500 mr-2'>Sort by</span>
          <select
            className='text-sm border border-gray-200 rounded-md bg-white py-1.5 px-3 font-medium focus:outline-none focus:ring-1 focus:ring-gray-200'
            value={sortBy}
            onChange={handleSortChange}
            aria-label='Sort deals by'
          >
            <option value='Most Recent'>Most Recent</option>
            <option value='Price: High to Low'>Price: High to Low</option>
            <option value='Price: Low to High'>Price: Low to High</option>
          </select>
        </div>
      </div>

      {/* Deals List */}
      <div className='space-y-px'>
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='bg-white rounded-lg p-4 animate-pulse'>
              <div className='flex items-center space-x-4'>
                <Skeleton className='w-20 h-20 rounded-md' />
                <div className='flex-1'>
                  <Skeleton className='h-4 w-3/4 mb-2' />
                  <Skeleton className='h-3 w-1/2' />
                </div>
                <div className='flex flex-col items-end gap-1'>
                  <Skeleton className='h-6 w-20' />
                  <Skeleton className='h-4 w-16' />
                  <Skeleton className='h-3 w-12' />
                </div>
              </div>
            </div>
          ))
        ) : filteredAndSortedDeals.length === 0 ? (
          // Empty state
          <div className='bg-white rounded-lg p-8 text-center'>
            <p className='text-gray-500'>
              No deals found matching your filters.
            </p>
          </div>
        ) : (
          // Deals list - matching the image design
          filteredAndSortedDeals.map((deal, index) => (
            <div key={deal.id} className="border-b border-gray-200 py-4 hover:bg-gray-50">
              <div className="flex">
                <div className="w-24 h-24 mr-4 flex-shrink-0 overflow-hidden">
                  <Image
                    src={`https://images.unsplash.com/photo-1523275335684-37898b6baf30`}
                    alt={deal.title}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover rounded-sm"
                    priority={index === 0}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    sizes="96px"
                    unoptimized
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{deal.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{deal.seller}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <span>{deal.productCount || (index + 1)} products</span>
                        <span className="mx-1">•</span>
                        <span>{deal.units.toLocaleString()} units</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold">${formatPrice(deal.price)}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-xs text-gray-500">{deal.date}</div>
                    <div>
                      <Badge variant="outline" className="text-xs font-normal bg-transparent">
                        {deal.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
