import DashboardCard from './DashboardCard';
import ActivityTable from './ActivityTable';
import Link from 'next/link';

// Define proper types for insights
interface RecommendedItem {
  id: string;
  title: string;
  retailer: string;
  price: string;
}

interface ActivityItem {
  id: string
  action: string 
  item: string 
  date: string
  amount: string 
  status?: string
}

interface Insights {
  totalPurchases: string;
  activeBids: number;
  savedItems: number;
  recentActivity: ActivityItem[];
  recommendedItems: RecommendedItem[];
}

interface DashboardClientContentProps {
  insights: Insights;
}

/**
 * Client Component for interactive dashboard content
 * Handles client-side state and interactivity while using server-fetched data
 */
export function DashboardClientContent({ insights }: DashboardClientContentProps) {

  return (
    <>
      {/* Dashboard Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
        <DashboardCard
          title='Total Purchases'
          value={insights.totalPurchases}
          icon={
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          }
          trend={{ value: '+5% from last month', isPositive: true }}
        />

        <DashboardCard
          title='Active Bids'
          value={insights.activeBids}
          icon={
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          }
        />

        <DashboardCard
          title='Saved Items'
          value={insights.savedItems}
          icon={
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'
              />
            </svg>
          }
        />
      </div>

      {/* Activity Table */}
      <div className='mb-8'>
        <ActivityTable
          activities={insights.recentActivity}
          title='Recent Activity'
        />
      </div>

      {/* Recommended Items */}
      <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Recommended For You
        </h3>

        {insights.recommendedItems.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {insights.recommendedItems.map((item: RecommendedItem) => (
              <div
                key={item.id}
                className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
              >
                <h4 className='font-medium text-gray-900 mb-1'>{item.title}</h4>
                <p className='text-sm text-gray-500 mb-2'>
                  Retailer: {item.retailer}
                </p>
                <div className='flex justify-between items-center'>
                  <span className='font-bold text-primary-600'>
                    {item.price}
                  </span>
                  <Link
                    href={`/marketplace/${item.id}`}
                    className='text-primary-600 hover:text-primary-700 text-sm font-medium'
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-gray-500'>
            No recommendations available at this time.
          </p>
        )}
      </div>

      {/* Chart Placeholder */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Purchase History
        </h3>
        <div className='h-64 bg-gray-100 rounded-lg flex items-center justify-center'>
          <p className='text-gray-500'>
            Chart will be available in future updates
          </p>
        </div>
      </div>
    </>
  )
}
