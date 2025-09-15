"use client";

// For animations
import Link from "next/link";
import { usePathname } from "next/navigation";

import { motion } from "framer-motion";

// Placeholder - Replace with actual import from e.g., '@/src/constants/categories'
const CATEGORIES = {
  ALL: "All Items",
  ELECTRONICS: "Electronics",
  FASHION: "Fashion",
  HOME: "Home Goods",
  SPORTS: "Sports & Outdoors",
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

  const isMarketplacePage = pathname.startsWith("/marketplace");

  const handleCategoryClick = (category: string) => {
    if (onCategorySelect) {
      onCategorySelect(category === CATEGORIES.ALL ? null : category);
    }
  };

  return (
    <nav
      // ref={scrollRef} // scrollRef usage removed
      aria-label="Category navigation"
      className="no-scrollbar flex space-x-3 overflow-x-auto border-b border-gray-200 bg-white px-4 py-3 shadow-sm"
    >
      {Object.entries(CATEGORIES).map(([key, categoryName]) => {
        const isActive = currentCategory
          ? currentCategory === categoryName
          : isMarketplacePage &&
            pathname === `/marketplace/category/${key.toLowerCase()}`;

        return (
          <motion.div
            key={key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {onCategorySelect ? (
              <button
                className={`rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
                  isActive
                    ? "bg-primary-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }`}
                onClick={() => handleCategoryClick(categoryName)}
                type="button"
              >
                {categoryName}
              </button>
            ) : (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
                  isActive
                    ? "bg-primary-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }`}
                href={`/marketplace/category/${key.toLowerCase()}`}
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
