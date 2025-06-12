'use client'

import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface CollectionsErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

const CollectionsError = ({ error, reset }: CollectionsErrorProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 text-center space-y-4">
        <div className="flex justify-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground">
            We couldn't load the collections. Please try again.
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
            onClick={() => window.location.href = '/marketplace'}
          >
            Go to Marketplace
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default CollectionsError 