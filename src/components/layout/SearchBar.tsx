'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { SearchSuggestions } from '@/src/features/search/components/SearchSuggestions'

/**
 * Search Bar Component
 * Used in both desktop and mobile layouts with form submission and autocomplete support
 */
const SearchBar = () => {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (query.trim()) {
      setShowSuggestions(false)
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setShowSuggestions(true)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
    router.push(`/search?q=${encodeURIComponent(suggestion)}`)
  }

  const handleInputFocus = () => {
    setShowSuggestions(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (query.trim()) {
        setShowSuggestions(false)
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div className='relative'>
      <form onSubmit={handleSubmit} className='relative'>
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <Search className='h-5 w-5 text-neutral-400' />
        </div>
        <input
          type='text'
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder='Search brands or products'
          className='w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-full focus:outline-hidden focus:ring-2 focus:ring-black bg-white text-black placeholder-neutral-400'
          spellCheck={false}
          autoComplete='off'
        />
      </form>
      
      <SearchSuggestions
        query={query}
        onSuggestionClick={handleSuggestionClick}
        onClose={() => setShowSuggestions(false)}
        isVisible={showSuggestions}
      />
    </div>
  );
};

export default SearchBar; 