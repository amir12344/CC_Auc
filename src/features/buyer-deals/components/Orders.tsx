"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { Badge } from '@/src/components/ui/badge'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Card, CardContent } from '@/src/components/ui/card'

// Define the Order interface
interface Order {
  id: number
  title: string
  date: string
  status: 'Delivered' | 'Shipped' | 'Processing'
  amount: number
  tracking: string
}

// Sample data for orders
const sampleOrders: Order[] = [
  {
    id: 2001,
    title: 'Kitchen Essentials',
    date: 'May 15, 2025',
    status: 'Delivered',
    amount: 250.00,
    tracking: 'TRK10001'
  },
  {
    id: 2002,
    title: 'Home Decor Set',
    date: 'May 10, 2025',
    status: 'Shipped',
    amount: 500.00,
    tracking: 'TRK10002'
  },
  {
    id: 2003,
    title: 'Beauty Collection',
    date: 'May 5, 2025',
    status: 'Delivered',
    amount: 750.00,
    tracking: 'TRK10003'
  },
  {
    id: 2004,
    title: 'Baby Products',
    date: 'May 1, 2025',
    status: 'Processing',
    amount: 1000.00,
    tracking: 'TRK10004'
  }
]

export default function Orders() {
  // State for orders data with loading state
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState('Most Recent')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  // Simulate data fetching
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await fetch('/api/orders')
        // const data = await response.json()
        setOrders(sampleOrders)
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Add a small delay to simulate network request
    const timer = setTimeout(() => {
      fetchOrders()
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Filter and sort orders based on user selection
  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders]
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(order => order.status === statusFilter)
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'Price: High to Low':
        return result.sort((a, b) => b.amount - a.amount)
      case 'Price: Low to High':
        return result.sort((a, b) => a.amount - b.amount)
      case 'Most Recent':
      default:
        return result
    }
  }, [orders, sortBy, statusFilter])

  // Handle status filter change with useCallback
  const handleStatusFilterChange = useCallback((status: string | null) => {
    setStatusFilter(status)
  }, [])

  // Handle sort change with useCallback
  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
  }, [])

  // Format price with proper currency formatting
  const formatPrice = useCallback((price: number) => {
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }, [])

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Status Filter - More Rounded Buttons */}
        <div className="flex flex-wrap gap-2">
          <button 
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${statusFilter === null ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => handleStatusFilterChange(null)}
          >
            All
          </button>
          <button 
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${statusFilter === 'Delivered' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => handleStatusFilterChange('Delivered')}
          >
            Delivered
          </button>
          <button 
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${statusFilter === 'Shipped' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => handleStatusFilterChange('Shipped')}
          >
            Shipped
          </button>
        </div>

        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Sort by</span>
          <select 
            className="text-sm border border-gray-200 rounded-md bg-white py-1.5 px-3 font-medium focus:outline-none focus:ring-1 focus:ring-gray-200"
            value={sortBy}
            onChange={handleSortChange}
            aria-label="Sort orders by"
          >
            <option value="Most Recent">Most Recent</option>
            <option value="Price: High to Low">Price: High to Low</option>
            <option value="Price: Low to High">Price: Low to High</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-px">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
              <div className="flex items-center space-x-4">
                <Skeleton className="w-20 h-20 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </div>
          ))
        ) : filteredAndSortedOrders.length === 0 ? (
          // Empty state
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-500">No orders found matching your filters.</p>
          </div>
        ) : (
          // Orders list - matching the image design
          filteredAndSortedOrders.map((order, index) => (
            <div key={order.id} className="border-b border-gray-200 py-4 hover:bg-gray-50">
              <div className="flex">
                <div className="w-24 h-24 mr-4 flex-shrink-0 overflow-hidden">
                  <Image 
                    src={`https://images.unsplash.com/photo-1523275335684-37898b6baf30`} 
                    alt={order.title}
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
                      <h3 className="font-semibold text-lg">{order.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">Order #{order.id} • Placed on {order.date}</p>
                      <p className="text-xs text-gray-500 mt-1">Tracking: {order.tracking}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold">${formatPrice(order.amount)}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-xs text-gray-500"></div>
                    <div>
                      <Badge variant="outline" className="text-xs font-normal bg-transparent">
                        {order.status}
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