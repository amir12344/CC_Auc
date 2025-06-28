import { ChevronDown, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { megaMenuData } from './megaMenuData';
import type {
  MegaMenuCategory,
  MegaMenuGroup,
  MegaMenuSubcategory,
} from './types';

const MegaMenu = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<
    string | null
  >(null);

  const handleCategoryHover = (categoryId: string): void => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      // Only on tablet+
      setActiveDropdown(categoryId);
    }
  };

  const handleMouseLeave = (): void => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      // Only on tablet+
      setActiveDropdown(null);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Escape') {
      setActiveDropdown(null);
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setExpandedMobileCategory(null);
  };

  const toggleMobileCategory = (categoryId: string) => {
    setExpandedMobileCategory(
      expandedMobileCategory === categoryId ? null : categoryId
    );
  };

  return (
    <>
      {/* Desktop/Tablet Navigation */}
      <div
        className="relative hidden border-gray-200 border-b bg-[#43CD66] shadow-sm md:block"
        onKeyDown={handleKeyDown}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Main navigation"
            className="flex items-center justify-between"
          >
            {megaMenuData.categories.map((category) => {
              const hasDropdown =
                category.subcategories.length > 0 ||
                (category.featured && category.featured.length > 0) ||
                (category.groups && category.groups.length > 0);

              return (
                <div
                  className="relative flex flex-1 justify-center"
                  key={category.id}
                >
                  <button
                    aria-expanded={activeDropdown === category.id}
                    aria-haspopup={hasDropdown}
                    className="flex items-center py-4 font-medium text-gray-700 text-sm transition-colors duration-200 hover:text-white"
                    onBlur={() => {
                      // Small delay to allow for focus to move to dropdown content
                      setTimeout(() => {
                        if (
                          !document.activeElement?.closest('[data-dropdown]')
                        ) {
                          setActiveDropdown(null);
                        }
                      }, 100);
                    }}
                    onFocus={() =>
                      hasDropdown && handleCategoryHover(category.id)
                    }
                    onMouseEnter={() =>
                      hasDropdown && handleCategoryHover(category.id)
                    }
                    role="menuitem"
                    type="button"
                  >
                    {category.name}
                    {hasDropdown && <ChevronDown className="ml-1 h-4 w-4" />}
                  </button>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Dynamic Dropdown Content */}
        {activeDropdown && (
          <div
            aria-label="Submenu"
            className="absolute top-full left-0 z-50 max-h-[65vh] w-full overflow-y-auto border-t bg-white shadow-lg"
            data-dropdown
            onKeyDown={handleKeyDown}
            onMouseEnter={() => setActiveDropdown(activeDropdown)}
            onMouseLeave={handleMouseLeave}
            role="menu"
            tabIndex={-1}
          >
            <DropdownContent
              category={
                megaMenuData.categories.find(
                  (cat) => cat.id === activeDropdown
                ) || megaMenuData.categories[0]
              }
            />
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className='border-gray-200 border-b bg-[#43CD66] md:hidden'>
        <div className="flex items-center justify-between px-4 py-3">
          <button
            aria-label="Toggle mobile menu"
            className='flex items-center text-gray-700 transition-colors hover:text-white'
            onClick={toggleMobileMenu}
            type="button"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
            <span className='ml-2 font-medium text-sm'>Menu</span>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className='fixed inset-0 z-50 overflow-y-auto bg-white'>
            <div className='flex items-center justify-between border-b bg-[#43CD66] px-4 py-3'>
              <span className='font-semibold text-gray-700 text-lg'>Menu</span>
              <button
                aria-label="Close mobile menu"
                className='text-gray-700 transition-colors hover:text-white'
                onClick={toggleMobileMenu}
                type="button"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="px-4 py-2">
              {megaMenuData.categories.map((category) => {
                const hasDropdown =
                  category.subcategories.length > 0 ||
                  (category.featured && category.featured.length > 0) ||
                  (category.groups && category.groups.length > 0);

                return (
                  <div
                    className='border-gray-100 border-b last:border-b-0'
                    key={category.id}
                  >
                    {hasDropdown ? (
                      <button
                        className='flex w-full items-center justify-between py-4 text-left text-gray-700 transition-colors hover:text-red-600'
                        onClick={() => toggleMobileCategory(category.id)}
                      >
                        <span className="font-medium">{category.name}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${expandedMobileCategory === category.id
                            ? 'rotate-180'
                            : ''
                            }`}
                        />
                      </button>
                    ) : (
                      <Link
                        className='flex w-full items-center py-4 font-medium text-gray-700 transition-colors hover:text-red-600'
                        href={category.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    )}

                    {hasDropdown && expandedMobileCategory === category.id && (
                      <div className="pb-4">
                        <MobileDropdownContent
                          category={category}
                          onLinkClick={() => setIsMobileMenuOpen(false)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Mobile dropdown content component
const MobileDropdownContent = ({
  category,
  onLinkClick,
}: {
  category: MegaMenuCategory;
  onLinkClick: () => void;
}) => {
  // Groups layout (like All Categories)
  if (category.groups && category.groups.length > 0) {
    return (
      <div className="space-y-6">
        {category.groups.map((group: MegaMenuGroup) => (
          <div className="space-y-2" key={group.id}>
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
              <Link
                className="transition-colors duration-200 hover:text-red-600"
                href={group.href}
                onClick={onLinkClick}
              >
                {group.name}
              </Link>
            </h3>
            <ul className="space-y-1 pl-3">
              {group.subcategories.map((subcategory: MegaMenuSubcategory) => (
                <li key={subcategory.id}>
                  <Link
                    className='block py-1 text-gray-600 text-sm transition-colors hover:text-red-600'
                    href={subcategory.href}
                    onClick={onLinkClick}
                  >
                    {subcategory.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  // Regional layout (for categories with many subcategories)
  if (category.subcategories.length > 20) {
    return (
      <div className="space-y-6">
        {groupSubcategories(category.subcategories).map(
          (group: { title: string; items: MegaMenuSubcategory[] }) => (
            <div className="space-y-2" key={group.title}>
              <h3 className='rounded bg-gray-50 p-2 font-bold text-gray-900 text-sm uppercase tracking-wide'>
                {group.title}
              </h3>
              <ul className="space-y-1 pl-3">
                {group.items.map((subcategory: MegaMenuSubcategory) => (
                  <li key={subcategory.id}>
                    <Link
                      className='block py-1 text-gray-600 text-sm transition-colors hover:text-red-600'
                      href={subcategory.href}
                      onClick={onLinkClick}
                    >
                      {subcategory.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>
    );
  }

  // Simple layout
  return (
    <div className="space-y-2">
      <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
        <Link
          className="transition-colors duration-200 hover:text-red-600"
          href={category.href}
          onClick={onLinkClick}
        >
          {category.name}
        </Link>
      </h3>
      <ul className="space-y-1 pl-3">
        {category.subcategories.map((subcategory: MegaMenuSubcategory) => (
          <li key={subcategory.id}>
            <Link
              className='block py-1 text-gray-600 text-sm transition-colors hover:text-red-600'
              href={subcategory.href}
              onClick={onLinkClick}
            >
              {subcategory.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Dynamic dropdown content component
const DropdownContent = ({ category }: { category: MegaMenuCategory }) => {
  // Groups layout (like All Categories) - responsive grid
  if (category.groups && category.groups.length > 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 pb-16 sm:px-6 lg:px-8">
        <div className='grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8 xl:grid-cols-5'>
          {category.groups.map((group: MegaMenuGroup) => (
            <div className="space-y-3" key={group.id}>
              <h3 className="mb-4 font-bold text-gray-900 text-sm uppercase tracking-wide">
                <Link
                  className="transition-colors duration-200 hover:text-red-600"
                  href={group.href}
                  role="menuitem"
                >
                  {group.name}
                </Link>
              </h3>
              <ul className="space-y-2">
                {group.subcategories.map((subcategory: MegaMenuSubcategory) => (
                  <li key={subcategory.id}>
                    <Link
                      className="block text-gray-600 text-sm transition-colors hover:text-red-600"
                      href={subcategory.href}
                      role="menuitem"
                    >
                      {subcategory.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Regional layout (for categories with many subcategories that need grouping) - responsive grid
  if (category.subcategories.length > 20) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {groupSubcategories(category.subcategories).map(
            (group: { title: string; items: MegaMenuSubcategory[] }) => (
              <div className="space-y-3" key={group.title}>
                <h3 className="mb-4 rounded bg-gray-50 p-2 font-bold text-gray-900 text-sm uppercase tracking-wide">
                  {group.title}
                </h3>
                <ul className="space-y-2 pl-2">
                  {group.items.map((subcategory: MegaMenuSubcategory) => (
                    <li key={subcategory.id}>
                      <Link
                        className="block text-gray-600 text-sm transition-colors hover:text-red-600"
                        href={subcategory.href}
                        role="menuitem"
                      >
                        {subcategory.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  // Simple grid layout (for categories with fewer subcategories) - responsive
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 pb-16 sm:px-6 lg:px-8">
      <div className='grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8 xl:grid-cols-5'>
        <div className="space-y-3">
          <h3 className="mb-4 font-bold text-gray-900 text-sm uppercase tracking-wide">
            <Link
              className="transition-colors duration-200 hover:text-red-600"
              href={category.href}
              role="menuitem"
            >
              {category.name}
            </Link>
          </h3>
          <ul className="space-y-2">
            {category.subcategories.map((subcategory: MegaMenuSubcategory) => (
              <li key={subcategory.id}>
                <Link
                  className="block text-gray-600 text-sm transition-colors hover:text-red-600"
                  href={subcategory.href}
                  role="menuitem"
                >
                  {subcategory.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Fill remaining columns with empty divs to maintain grid structure on larger screens */}
        <div className="hidden xl:block" />
        <div className="hidden lg:block" />
        <div className="hidden md:block" />
        <div className="hidden xl:block" />
      </div>
    </div>
  );
};

// Helper function to group subcategories for regional layouts
const groupSubcategories = (subcategories: MegaMenuSubcategory[]) => {
  const groups: { title: string; items: MegaMenuSubcategory[] }[] = [];
  let currentGroup: { title: string; items: MegaMenuSubcategory[] } | null =
    null;

  for (const item of subcategories) {
    // Detect group headers (all caps items)
    if (item.name === item.name.toUpperCase() && item.name.length > 3) {
      if (currentGroup) {
        groups.push(currentGroup);
      }
      currentGroup = { title: item.name, items: [] };
    } else if (currentGroup) {
      currentGroup.items.push(item);
    } else if (groups.length === 0) {
      // If no group found, create a default group
      currentGroup = { title: 'All Items', items: [item] };
    } else {
      groups.at(-1)?.items.push(item);
    }
  }

  if (currentGroup) {
    groups.push(currentGroup);
  }

  return groups;
};

export default MegaMenu;
