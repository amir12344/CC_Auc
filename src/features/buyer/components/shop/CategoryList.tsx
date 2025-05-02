import Link from 'next/link';

// This is a server component for displaying product categories
// It doesn't require client-side interactivity

interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}

interface CategoryListProps {
  categories: Category[];
  activeCategory?: string;
}

const CategoryList = ({ categories, activeCategory = 'all' }: CategoryListProps) => {
  return (
    <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-4 mb-6">
      <h3 className="font-medium text-lg mb-3">Categories</h3>
      <div className="space-y-1">
        <Link
          href="/marketplace"
          className={`block px-3 py-2 rounded-md ${
            activeCategory === 'all'
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          All Products
        </Link>
        
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/marketplace?category=${category.slug}`}
            className={`block px-3 py-2 rounded-md ${
              activeCategory === category.id
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex justify-between items-center">
              {category.name}
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {category.count}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;

