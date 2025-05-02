'use client';

import { useState } from 'react';

interface CategoryFilterProps {
  categories: string[];
  onCategoryChange: (category: string | null) => void;
}

const CategoryFilter = ({ categories, onCategoryChange }: CategoryFilterProps) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    const newCategory = activeCategory === categoryId ? null : categoryId;
    setActiveCategory(newCategory);
    onCategoryChange(newCategory);
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-3">Filter by Category</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === category
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
        {activeCategory && (
          <button
            onClick={() => {
              setActiveCategory(null);
              onCategoryChange(null);
            }}
            className="px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            Clear Filter
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryFilter;

