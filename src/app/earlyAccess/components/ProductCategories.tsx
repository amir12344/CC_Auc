'use client';

import React from 'react';
import Image from 'next/image';

const productCategories = [
  { name: "Houseware", imageUrl: "/images/KitchenHouseware.webp" },
  { name: "Appliances", imageUrl: "/images/SmallAppliances.webp" },
  { name: "Electronics", imageUrl: "/images/ConsumerElectronics.webp" },
  { name: "Beauty", imageUrl: "/images/beauty_products.webp" },
  { name: "CPG", imageUrl: "/images/CleaningSupplies_Option2.webp" },
  { name: "Furniture", imageUrl: "/images/Furnitures.webp" },
];

export default function ProductCategories() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl pb-4 text-[#ffffff] text-center" style={{ fontWeight: 900 }}>
          Products from the World&apos;s <br />
          <span className="text-[#43CD66] relative inline-block">
            best brands
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#43CD66]"></span>
          </span>
        </h2>
        <p className="mb-2 text-[#D8F4CC] font-semibold text-center">
          Get access to surplus and returned inventory from the brands consumers love, from mass market to designer.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4 md:gap-6 lg:gap-8 xl:gap-10 mb-8 border-none">
        {productCategories.map((category, index) => (
          <div key={index} className="mb-3 border-none">
            <div className="bg-white shadow-xs overflow-hidden border-none transform transition-transform duration-300 hover:scale-105" style={{ borderRadius: '8px' }}>
              <div className="border-none relative aspect-square rounded-sm overflow-hidden">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover border-none"
                  priority={index < 3}
                />
              </div>
            </div>
            <div className="py-1 text-center rounded-lg">
              <span className="text-sm md:text-base lg:text-lg text-gray-300">{category.name}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}