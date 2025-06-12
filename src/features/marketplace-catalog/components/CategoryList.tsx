'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
// import CATEGORIES from '@/src/components/earlyaccess/ProductCategories'; // This import is a component, not the required constant object
import { motion } from 'framer-motion'; // For animations

// Placeholder - Replace with actual import from e.g., '@/src/constants/categories'
const CATEGORIES = {
  ALL: 'All Items',
  ELECTRONICS: 'Electronics',
  FASHION: 'Fashion',
  HOME: 'Home Goods',
  SPORTS: 'Sports & Outdoors',
} as const;

interface CategoryListProps {
  currentCategory?: string;
  onCategorySelect?: (category: string | null) => void;
}

/**
 * Component to display a scrollable list of categories.
 * Handles both navigation and filtering based on props.
 */
export function CategoryList({
  currentCategory,
  onCategorySelect,
}: CategoryListProps) {
  const pathname = usePathname();
  // const scrollRef = useHorizontalScroll(); // Hook for horizontal scroll - import removed

  const isMarketplacePage = pathname.startsWith('/marketplace');

  const handleCategoryClick = (category: string) => {
    if (onCategorySelect) {
      onCategorySelect(category === CATEGORIES.ALL ? null : category);
    }
  };

  return (
    <nav
      // ref={scrollRef} // scrollRef usage removed
      className="flex space-x-3 py-3 px-4 overflow-x-auto bg-white shadow-sm border-b border-gray-200 no-scrollbar"
      aria-label="Category navigation"
    >
      {Object.entries(CATEGORIES).map(([key, categoryName]) => {
        const isActive = currentCategory
          ? currentCategory === categoryName
          : isMarketplacePage && pathname === `/marketplace/category/${key.toLowerCase()}`;

        return (
          <motion.div
            key={key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {onCategorySelect ? (
              <button
                onClick={() => handleCategoryClick(categoryName)}
                className={`whitespace-nowrap px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150
                  ${isActive
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
              >
                {categoryName}
              </button>
            ) : (
              <Link
                href={`/marketplace/category/${key.toLowerCase()}`}
                className={`whitespace-nowrap px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150
                  ${isActive
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {categoryName}
              </Link>
            )}
          </motion.div>
        );
      })}
    </nav>
  );
} 