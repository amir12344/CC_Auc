'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/src/components/ui/badge';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/src/components/ui/navigation-menu';
import { megaMenuData } from './megaMenuData';
import type { MegaMenuFeatured } from './types';

const MegaMenu = () => {
  return (
    <div
      className="hidden border-gray-200 border-b shadow-sm md:block"
      style={{ background: '#43CD66' }}
    >
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        <div className="flex w-full justify-center">
          <NavigationMenu>
            <NavigationMenuList className="flex items-center justify-center space-x-8 bg-transparent lg:space-x-12 xl:space-x-16">
              {megaMenuData.categories.map((category) => {
                // Check if category should have dropdown (has subcategories or featured items)
                const hasDropdown =
                  category.subcategories.length > 0 ||
                  (category.featured && category.featured.length > 0);

                return (
                  <NavigationMenuItem
                    className="cursor-pointer"
                    key={category.id}
                  >
                    {hasDropdown ? (
                      // Category with dropdown
                      <>
                        <NavigationMenuTrigger
                          className="!bg-transparent hover:!bg-transparent focus:!bg-transparent data-[state=open]:!bg-transparent border-none px-3 py-3 font-medium text-sm transition-colors duration-200"
                          style={{
                            color: '#1C1E21',
                            backgroundColor: 'transparent !important',
                          }}
                        >
                          {category.name}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          {/* All Categories - Wide 2-column layout */}
                          {category.id === 'all-categories' && (
                            <div className="w-[850px] p-6">
                              <div className="grid grid-cols-4 gap-8">
                                {/* Subcategories - First 3 columns */}
                                <div className="col-span-3">
                                  <div className="grid grid-cols-2 gap-8">
                                    {/* Left column */}
                                    <div>
                                      <ul className="space-y-2">
                                        {category.subcategories
                                          .slice(
                                            0,
                                            Math.ceil(
                                              category.subcategories.length / 2
                                            )
                                          )
                                          .map((subcategory) => (
                                            <li
                                              className="cursor-pointer"
                                              key={subcategory.id}
                                            >
                                              <NavigationMenuLink asChild>
                                                <Link
                                                  className="block p-1 text-gray-600 text-sm transition-colors duration-200 hover:text-[#43CD66]"
                                                  href={subcategory.href}
                                                >
                                                  {subcategory.name}
                                                </Link>
                                              </NavigationMenuLink>
                                            </li>
                                          ))}
                                      </ul>
                                    </div>

                                    {/* Right column */}
                                    <div>
                                      <h3 className="mb-3 font-semibold text-gray-900 text-sm">
                                        More Categories
                                      </h3>
                                      <ul className="space-y-2">
                                        {category.subcategories
                                          .slice(
                                            Math.ceil(
                                              category.subcategories.length / 2
                                            )
                                          )
                                          .map((subcategory) => (
                                            <li key={subcategory.id}>
                                              <NavigationMenuLink asChild>
                                                <Link
                                                  className="block p-1 text-gray-600 text-sm transition-colors duration-200 hover:text-[#43CD66]"
                                                  href={subcategory.href}
                                                >
                                                  {subcategory.name}
                                                </Link>
                                              </NavigationMenuLink>
                                            </li>
                                          ))}
                                      </ul>
                                    </div>
                                  </div>

                                </div>

                                {/* Featured Products - Last column */}
                                {category.featured &&
                                  category.featured.length > 0 && (
                                    <div className="col-span-1">
                                      <h3 className="mb-3 font-semibold text-gray-900 text-sm">
                                        Featured Deals
                                      </h3>
                                      <div>
                                        {category.featured
                                          .slice(0, 1)
                                          .map((product) => (
                                            <FeaturedProductCard
                                              key={product.id}
                                              product={product}
                                            />
                                          ))}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}

                          {/* By Condition - 2 column layout */}
                          {category.id === 'by-condition' && (
                            <div className="w-[500px] p-6">
                              <div className="space-y-4">
                                <h3 className="mb-4 font-semibold text-gray-900 text-lg">
                                  {category.name}
                                </h3>
                                <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
                                  {category.subcategories.map((subcategory) => (
                                    <li key={subcategory.id}>
                                      <NavigationMenuLink asChild>
                                        <Link
                                          className="block rounded-md p-2 text-gray-600 text-sm transition-colors duration-200 hover:bg-gray-50 hover:text-[#43CD66]"
                                          href={subcategory.href}
                                        >
                                          {subcategory.name}
                                        </Link>
                                      </NavigationMenuLink>
                                    </li>
                                  ))}
                                </ul>

                              </div>
                            </div>
                          )}

                          {/* Shop By Region - Grouped layout */}
                          {category.id === 'shop-by-region' && (
                            <div className="w-[900px] p-6">
                              <div className="space-y-4">
                                <h3 className="mb-4 font-semibold text-gray-900 text-lg">
                                  {category.name}
                                </h3>

                                {/* Regional Groups */}
                                <div className="grid grid-cols-3 gap-x-8 gap-y-6">
                                  {/* United States */}
                                  <div>
                                    <h4 className='mb-2 rounded bg-gray-100 p-2 font-semibold text-gray-800 text-sm'>
                                      UNITED STATES
                                    </h4>
                                    <ul className="space-y-1 pl-2">
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/northeast"
                                          >
                                            Northeast
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/midwest"
                                          >
                                            Midwest
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/south"
                                          >
                                            South
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/west"
                                          >
                                            West
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/shop-all-us"
                                          >
                                            Shop All US
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                    </ul>
                                  </div>

                                  {/* Canada */}
                                  <div>
                                    <h4 className='mb-2 rounded bg-gray-100 p-2 font-semibold text-gray-800 text-sm'>
                                      CANADA
                                    </h4>
                                    <ul className="space-y-1 pl-2">
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/alberta"
                                          >
                                            Alberta
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/british-columbia"
                                          >
                                            British Columbia
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/quebec"
                                          >
                                            Quebec
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/ontario"
                                          >
                                            Ontario
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/shop-all-canada"
                                          >
                                            Shop All Canada
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                    </ul>
                                  </div>

                                  {/* Europe */}
                                  <div>
                                    <h4 className='mb-2 rounded bg-gray-100 p-2 font-semibold text-gray-800 text-sm'>
                                      EUROPE
                                    </h4>
                                    <ul className="space-y-1 pl-2">
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/france"
                                          >
                                            France
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/germany"
                                          >
                                            Germany
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/poland"
                                          >
                                            Poland
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/spain"
                                          >
                                            Spain
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/united-kingdom"
                                          >
                                            United Kingdom
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/shop-all-europe"
                                          >
                                            Shop All Europe
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                    </ul>
                                  </div>

                                  {/* Asia */}
                                  <div>
                                    <h4 className='mb-2 rounded bg-gray-100 p-2 font-semibold text-gray-800 text-sm'>
                                      ASIA
                                    </h4>
                                    <ul className="space-y-1 pl-2">
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/china"
                                          >
                                            China
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/india"
                                          >
                                            India
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/vietnam"
                                          >
                                            Vietnam
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/indonesia"
                                          >
                                            Indonesia
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/philippines"
                                          >
                                            Philippines
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/shop-all-asia"
                                          >
                                            Shop All Asia
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                    </ul>
                                  </div>

                                  {/* Latin America */}
                                  <div>
                                    <h4 className='mb-2 rounded bg-gray-100 p-2 font-semibold text-gray-800 text-sm'>
                                      LATIN AMERICA
                                    </h4>
                                    <ul className="space-y-1 pl-2">
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/mexico"
                                          >
                                            Mexico
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/brazil"
                                          >
                                            Brazil
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/colombia"
                                          >
                                            Colombia
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/chile"
                                          >
                                            Chile
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/shop-all-latin-america"
                                          >
                                            Shop All Latin America
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                    </ul>
                                  </div>

                                  {/* Australia & Oceania */}
                                  <div>
                                    <h4 className='mb-2 rounded bg-gray-100 p-2 font-semibold text-gray-800 text-sm'>
                                      AUSTRALIA & OCEANIA
                                    </h4>
                                    <ul className="space-y-1 pl-2">
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/australia"
                                          >
                                            Australia
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/new-zealand"
                                          >
                                            New Zealand
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/shop-all-oceania"
                                          >
                                            Shop All Oceania
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                    </ul>
                                  </div>

                                  {/* Middle East & Africa - spanning 2 columns since it's the last */}
                                  <div>
                                    <h4 className='mb-2 rounded bg-gray-100 p-2 font-semibold text-gray-800 text-sm'>
                                      MIDDLE EAST & AFRICA
                                    </h4>
                                    <ul className="space-y-1 pl-2">
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/united-arab-emirates"
                                          >
                                            United Arab Emirates
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/saudi-arabia"
                                          >
                                            Saudi Arabia
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/south-africa"
                                          >
                                            South Africa
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/nigeria"
                                          >
                                            Nigeria
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            className="block p-1 text-gray-600 text-sm hover:text-[#43CD66]"
                                            href="/collections/region/shop-all-mea"
                                          >
                                            Shop All MEA
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                    </ul>
                                  </div>
                                </div>

                              </div>
                            </div>
                          )}
                        </NavigationMenuContent>
                      </>
                    ) : (
                      // Simple category without dropdown
                      <NavigationMenuLink asChild>
                        <Link
                          className="px-3 py-3 font-medium text-sm transition-colors duration-200 hover:text-[#369455]"
                          href={category.href}
                          style={{
                            color: '#1C1E21',
                          }}
                        >
                          {category.name}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </div>
  );
};

const FeaturedProductCard = ({ product }: { product: MegaMenuFeatured }) => {
  return (
    <NavigationMenuLink asChild>
      <Link className="group block" href={product.href}>
        <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg bg-gray-50">
          <Image
            alt={product.title}
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            fill
            src={product.image}
          />
          {product.discount && (
            <Badge className="absolute top-2 left-2 bg-red-500 font-medium text-white text-xs">
              -{product.discount}%
            </Badge>
          )}
        </div>
        <h4 className="mb-2 line-clamp-2 font-medium text-gray-900 text-sm transition-colors duration-200 group-hover:text-[#43CD66]">
          {product.title}
        </h4>
        <div className="flex items-center space-x-2">
          <span className="font-bold text-[#43CD66] text-base">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-gray-500 text-sm line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </Link>
    </NavigationMenuLink>
  );
};

export default MegaMenu;
