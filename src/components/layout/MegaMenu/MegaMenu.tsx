'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/src/components/ui/navigation-menu'
import { Badge } from '@/src/components/ui/badge'
import { cn } from '@/src/lib/utils'
import { megaMenuData } from './megaMenuData'
import { MegaMenuCategory, MegaMenuFeatured } from './types'

const MegaMenu = () => {
  return (
    <div className="hidden md:block border-b border-gray-200 shadow-sm" style={{ background: '#43CD66' }}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full flex justify-center">
          <NavigationMenu>
            <NavigationMenuList className="flex justify-center items-center space-x-8 lg:space-x-12 xl:space-x-16 bg-transparent">
              {megaMenuData.categories.map((category) => (
                <NavigationMenuItem key={category.id} className='cursor-pointer'>
                  <NavigationMenuTrigger 
                    className="font-medium text-sm px-3 py-3 transition-colors duration-200 !bg-transparent border-none hover:!bg-transparent focus:!bg-transparent data-[state=open]:!bg-transparent"
                    style={{ color: '#1C1E21', backgroundColor: 'transparent !important' }}
                  >
                    {category.name}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[850px] p-6">
                      <div className="grid grid-cols-4 gap-8">
                        {/* Subcategories - First 3 columns */}
                        <div className="col-span-3">
                          <div className="grid grid-cols-2 gap-8">
                            {/* Left column */}
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                Categories
                              </h3>
                              <ul className="space-y-2">
                                {category.subcategories.slice(0, Math.ceil(category.subcategories.length / 2)).map((subcategory) => (
                                  <li key={subcategory.id} className='cursor-pointer '>
                                    <NavigationMenuLink asChild>
                                      <Link
                                        href={subcategory.href}
                                        className="block text-sm text-gray-600 hover:text-[#43CD66] transition-colors duration-200 p-1"
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
                              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                More Categories
                              </h3>
                              <ul className="space-y-2">
                                {category.subcategories.slice(Math.ceil(category.subcategories.length / 2)).map((subcategory) => (
                                  <li key={subcategory.id}>
                                    <NavigationMenuLink asChild>
                                      <Link
                                        href={subcategory.href}
                                        className="block text-sm text-gray-600 hover:text-[#43CD66] transition-colors duration-200 p-1"
                                      >
                                        {subcategory.name}
                                      </Link>
                                    </NavigationMenuLink>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          {/* View All Link */}
                          <div className="mt-6 pt-4 border-t border-gray-100">
                            <NavigationMenuLink asChild>
                              <Link
                                href={category.href}
                                className="inline-flex items-center text-sm font-medium text-[#43CD66] hover:text-[#369455] transition-colors duration-200 whitespace-nowrap gap-2"
                              >
                                View All {category.name}
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            </NavigationMenuLink>
                          </div>
                        </div>
                        
                        {/* Featured Products - Last column */}
                        {category.featured && category.featured.length > 0 && (
                          <div className="col-span-1">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">
                              Featured Deals
                            </h3>
                            <div>
                              {category.featured.slice(0, 1).map((product) => (
                                <FeaturedProductCard key={product.id} product={product} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </div>
  )
}

const FeaturedProductCard = ({ product }: { product: MegaMenuFeatured }) => {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={product.href}
        className="block group"
      >
        <div className="relative overflow-hidden rounded-lg bg-gray-50 aspect-[4/3] mb-3">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {product.discount && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium">
              -{product.discount}%
            </Badge>
          )}
        </div>
        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#43CD66] transition-colors duration-200 mb-2">
          {product.title}
        </h4>
        <div className="flex items-center space-x-2">
          <span className="text-base font-bold text-[#43CD66]">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </Link>
    </NavigationMenuLink>
  )
}

export default MegaMenu 