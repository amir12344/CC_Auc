'use client'

import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface CategoryErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

const CategoryError = ({ error, reset }: CategoryErrorProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 text-center space-y-4">
        <div className="flex justify-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Category not found</h2>
          <p className="text-muted-foreground">
            The category you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="text-left text-sm text-muted-foreground bg-muted p-3 rounded">
            <summary className="cursor-pointer">Error Details</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words">
              {error.message}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button onClick={reset} variant="default">
            Try Again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/collections'}
          >
            View All Collections
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default CategoryError 