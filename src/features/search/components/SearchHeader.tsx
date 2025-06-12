'use client'

import { Card, CardContent } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Search } from 'lucide-react'

interface SearchHeaderProps {
  query: string
  resultCount?: number
}

export const SearchHeader = ({ query, resultCount }: SearchHeaderProps) => {
  if (!query) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Search Products
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Search through thousands of surplus inventory products. Find electronics, furniture, home goods, and more at unbeatable prices.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <Search className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Search Results
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">Results for:</span>
                <Badge variant="secondary" className="font-medium">
                  {query}
                </Badge>
              </div>
            </div>
          </div>
          
          {resultCount !== undefined && (
            <Card className="w-fit">
              <CardContent className="px-4 py-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {resultCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    {resultCount === 1 ? 'Product' : 'Products'} Found
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 