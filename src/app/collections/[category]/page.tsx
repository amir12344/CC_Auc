import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import MainLayout from '@/src/components/layout/MainLayout'
import { CategoryProducts } from '@/src/features/collections/components/CategoryProducts'
import { FilterSidebar } from '@/src/features/navigation/components/FilterSidebar'
import { ActiveFilterChips } from '@/src/features/navigation/components/ActiveFilterChips'
import { DynamicBreadcrumb } from '@/src/components/ui/DynamicBreadcrumb'
import { Skeleton } from '@/src/components/ui/skeleton'
import { getCollectionBySlug, formatCategoryName } from '@/src/features/collections/services/collectionsService'

interface CategoryPageProps {
  params: Promise<{ category: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const generateMetadata = async ({ params }: CategoryPageProps): Promise<Metadata> => {
  const { category } = await params
  const collection = await getCollectionBySlug(category)
  
  if (!collection) {
    return {
      title: 'Category Not Found | Commerce Central',
    }
  }

  const categoryName = formatCategoryName(category)
  
  return {
    title: `${categoryName} Collection | Commerce Central`,
    description: `Shop ${categoryName.toLowerCase()} from top brands. Quality surplus inventory at unbeatable prices with fast shipping.`,
    openGraph: {
      title: `${categoryName} Collection | Commerce Central`,
      description: `Shop ${categoryName.toLowerCase()} from top brands. Quality surplus inventory at unbeatable prices.`,
      images: collection.image ? [{ url: collection.image }] : [],
    },
  }
}

const CategoryProductsSkeleton = () => (
  <div className="space-y-6">
    {/* Category Header Skeleton */}
    <div className="mb-6">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-64" />
    </div>
    
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-10 w-40" />
    </div>
    
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  </div>
)

const CategoryPage = async ({ params, searchParams }: CategoryPageProps) => {
  const { category } = await params
  const filters = await searchParams
  
  const collection = await getCollectionBySlug(category)
  
  if (!collection) {
    notFound()
  }

  const categoryName = formatCategoryName(category)

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Breadcrumb Navigation */}
        <div className="border-b border-gray-100">
          <div className="max-w-8xl mx-auto px-6 py-4">
            <DynamicBreadcrumb />
          </div>
        </div>
        
        <div className="max-w-8xl mx-auto px-6 py-6">
          {/* Mobile Filter Button - Only visible on mobile */}
          <div className="lg:hidden mb-4">
            <FilterSidebar category={category} />
          </div>

          {/* Active Filter Chips */}
          <div className="mb-6">
            <ActiveFilterChips 
              category={category}
              className="justify-start"
            />
          </div>

          <div className="flex gap-6">
            {/* Enhanced Filter Sidebar - Desktop Only */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-6">
                <FilterSidebar category={category} />
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {/* Category Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                      {categoryName}
                    </h1>
                    <p className="text-gray-600 text-sm">
                      {collection.description}
                    </p>
                  </div>
                </div>
              </div>

              <Suspense fallback={<CategoryProductsSkeleton />}>
                <CategoryProducts 
                  category={category}
                  filters={filters}
                />
              </Suspense>
            </main>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default CategoryPage 