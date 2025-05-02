import { ReactNode } from 'react';
import Link from 'next/link';

// This is a server component as it doesn't require client-side interactivity

interface ProductSectionProps {
  title: string;
  viewAllLink?: string;
  children: ReactNode;
}

const ProductSection = ({ title, viewAllLink, children }: ProductSectionProps) => {
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        
        {viewAllLink && (
          <Link 
            href={viewAllLink}
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
          >
            View All
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 ml-1" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {children}
      </div>
    </section>
  );
};

export default ProductSection;

