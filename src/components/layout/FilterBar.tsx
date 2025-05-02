'use client';

import { memo, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Import icons dynamically to reduce initial bundle size
const FiZap = dynamic(() => import('react-icons/fi').then(mod => mod.FiZap));
const FiStar = dynamic(() => import('react-icons/fi').then(mod => mod.FiStar));
const FiTrendingUp = dynamic(() => import('react-icons/fi').then(mod => mod.FiTrendingUp));
const FiHome = dynamic(() => import('react-icons/fi').then(mod => mod.FiHome));
const FiDroplet = dynamic(() => import('react-icons/fi').then(mod => mod.FiDroplet));
const FiWatch = dynamic(() => import('react-icons/fi').then(mod => mod.FiWatch));
const GiConverseShoe = dynamic(() => import('react-icons/gi').then(mod => mod.GiConverseShoe));
const PiShirtFoldedLight = dynamic(() => import('react-icons/pi').then(mod => mod.PiShirtFoldedLight));

// Define filter items
const FILTERS = [
  { name: 'New', iconName: 'FiZap' },
  { name: 'Featured', iconName: 'FiStar' },
  { name: 'Trending', iconName: 'FiTrendingUp' },
  { name: 'Footwear', iconName: 'GiConverseShoe' },
  { name: 'Electronics', iconName: 'PiShirtFoldedLight' },
  { name: 'Beauty', iconName: 'FiDroplet' },
  { name: 'Accessories', iconName: 'FiWatch' },
  { name: 'Home', iconName: 'FiHome' },
];

// Icon component that renders the appropriate icon
const IconComponent = memo(({ iconName }: { iconName: string }) => {
  switch (iconName) {
    case 'FiZap':
      return <FiZap size={24} />;
    case 'FiStar':
      return <FiStar size={24} />;
    case 'FiTrendingUp':
      return <FiTrendingUp size={24} />;
    case 'GiConverseShoe':
      return <GiConverseShoe size={24} />;
    case 'PiShirtFoldedLight':
      return <PiShirtFoldedLight size={24} />;
    case 'FiDroplet':
      return <FiDroplet size={24} />;
    case 'FiWatch':
      return <FiWatch size={24} />;
    case 'FiHome':
      return <FiHome size={24} />;
    default:
      return null;
  }
});

// Add display name
IconComponent.displayName = 'IconComponent';

// Filter button component
const FilterButton = memo(({ name, iconName, isActive, onClick }: {
  name: string;
  iconName: string;
  isActive: boolean;
  onClick: () => void
}) => {
  return (
    <li className="flex flex-col items-center text-black">
      <button
        className="flex flex-col items-center focus:outline-hidden group"
        onClick={onClick}
        aria-pressed={isActive}
      >
        <span className={`mb-1 ${isActive ? 'text-primary-600' : 'group-hover:text-primary-600'}`}>
          <IconComponent iconName={iconName} />
        </span>
        <span className={`text-xs font-bold ${isActive ? 'text-primary-600' : 'group-hover:text-primary-600'}`}>
          {name}
        </span>
      </button>
    </li>
  );
});

// Add display name
FilterButton.displayName = 'FilterButton';

const FilterBar = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const handleFilterClick = useCallback((name: string) => {
    setActiveFilter(prev => prev === name ? null : name);
  }, []);

  return (
    <nav className="bg-white pt-3 w-full flex justify-center">
      <ul className="flex flex-row items-center gap-4 md:gap-8 lg:gap-20 py-3 overflow-x-auto no-scrollbar">
        {FILTERS.map(({ name, iconName }) => (
          <FilterButton
            key={name}
            name={name}
            iconName={iconName}
            isActive={activeFilter === name}
            onClick={() => handleFilterClick(name)}
          />
        ))}
      </ul>
    </nav>
  );
};

export default memo(FilterBar);

