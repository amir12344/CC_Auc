'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchSuggestions } from '../hooks/useSearch'
import { Card, CardContent } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Search, TrendingUp, Clock, X } from 'lucide-react'
import { cn } from '@/src/lib/utils'

interface SearchSuggestionsProps {
  query: string
  onSuggestionClick: (suggestion: string) => void
  onClose: () => void
  isVisible: boolean
  className?: string
}

export const SearchSuggestions = ({
  query,
  onSuggestionClick,
  onClose,
  isVisible,
  className
}: SearchSuggestionsProps) => {
  const { data: suggestions = [], isLoading } = useSearchSuggestions(query)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('recentSearches') || '[]')
      } catch {
        return []
      }
    }
    return []
  })

  const suggestionRef = useRef<HTMLDivElement>(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible, onClose])

  // Popular search terms (could be dynamic in real app)
  const popularSearches = [
    'Electronics',
    'Furniture',
    'Home & Garden',
    'Sports Equipment',
    'Fashion',
    'Kitchen Appliances'
  ]

  const handleSuggestionClick = (suggestion: string) => {
    // Save to recent searches
    if (typeof window !== 'undefined') {
      try {
        const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]')
        const updated = [suggestion, ...recent.filter((s: string) => s !== suggestion)].slice(0, 5)
        localStorage.setItem('recentSearches', JSON.stringify(updated))
        setRecentSearches(updated)
      } catch {
        // Ignore localStorage errors
      }
    }
    
    onSuggestionClick(suggestion)
  }

  const clearRecentSearches = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('recentSearches')
        setRecentSearches([])
      } catch {
        // Ignore localStorage errors
      }
    }
  }

  const removeRecentSearch = (searchToRemove: string) => {
    if (typeof window !== 'undefined') {
      try {
        const updated = recentSearches.filter(search => search !== searchToRemove)
        localStorage.setItem('recentSearches', JSON.stringify(updated))
        setRecentSearches(updated)
      } catch {
        // Ignore localStorage errors
      }
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <div 
      ref={suggestionRef}
      className={cn(
        "absolute top-full left-0 right-0 z-[100] mt-1",
        className
      )}
    >
      <Card className="shadow-lg border-2">
        <CardContent className="p-0">
          {/* Loading state */}
          {isLoading && query && (
            <div className="p-4 text-center text-sm text-gray-500">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching...
            </div>
          )}

          {/* Search suggestions */}
          {suggestions.length > 0 && (
            <div className="border-b border-gray-100 last:border-b-0">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 group"
                >
                  <Search className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                  <span className="text-gray-900 group-hover:text-blue-600 font-medium">
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Recent searches */}
          {recentSearches.length > 0 && !query && (
            <div className="border-b border-gray-100 last:border-b-0">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Recent Searches
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="h-auto p-1 text-xs text-gray-500 hover:text-red-600"
                >
                  Clear All
                </Button>
              </div>
              {recentSearches.slice(0, 5).map((search, index) => (
                <div
                  key={index}
                  className="flex items-center hover:bg-gray-50 transition-colors group"
                >
                  <button
                    onClick={() => handleSuggestionClick(search)}
                    className="flex-1 px-4 py-3 text-left flex items-center gap-3"
                  >
                    <Clock className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                    <span className="text-gray-700 group-hover:text-blue-600">
                      {search}
                    </span>
                  </button>
                  <button
                    onClick={() => removeRecentSearch(search)}
                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Popular searches */}
          {!query && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                Popular Searches
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors"
                      onClick={() => handleSuggestionClick(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* No suggestions found */}
          {query && suggestions.length === 0 && !isLoading && (
            <div className="p-4 text-center text-sm text-gray-500">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              No suggestions found for "{query}"
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 