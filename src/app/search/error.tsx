'use client'

import { Button } from '@/src/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface SearchErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

const SearchError = ({ error, reset }: SearchErrorProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg max-w-lg w-full p-8 text-center space-y-8">
        <div className="flex justify-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-50 to-orange-50 rounded-full shadow-sm">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">Oops! Search Failed</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            We encountered an unexpected error while searching. Don't worry, this happens sometimes.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="text-left text-sm text-gray-600 bg-gray-50 border border-gray-200 p-4 rounded-xl">
            <summary className="cursor-pointer font-medium mb-3 text-gray-800">
              🔍 Technical Details
            </summary>
            <div className="bg-white border border-gray-200 rounded-lg p-3 mt-2">
              <pre className="whitespace-pre-wrap break-words text-xs font-mono text-gray-700">
                {error.message}
              </pre>
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button 
            onClick={reset} 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            size="lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/marketplace'}
            className="border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            size="lg"
          >
            <Home className="w-4 h-4 mr-2" />
            Browse Products
          </Button>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            If this problem persists, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SearchError 