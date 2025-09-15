import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ChevronDown, Menu, X } from "lucide-react";

import {
  extractMegaMenuFilters,
  generateSearchUrl,
} from "@/src/features/search/services/megaMenuUtils";

import { megaMenuData } from "./megaMenuData";
import type {
  MegaMenuCategory,
  MegaMenuGroup,
  MegaMenuSubcategory,
} from "./types";

const MegaMenu = () => {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<
    string | null
  >(null);

  const handleMegaMenuItemClick = (categoryId: string, itemName: string) => {
    const filters = extractMegaMenuFilters(categoryId, itemName);
    const searchUrl = generateSearchUrl(filters);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    router.push(searchUrl);
  };

  const handleCategoryClick = (categoryId: string): void => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      // Only on tablet+ - toggle dropdown on click
      setActiveDropdown(activeDropdown === categoryId ? null : categoryId);
    }
  };

  const handleClickOutside = (event: MouseEvent): void => {
    const target = event.target as Element;
    if (
      !target.closest("[data-dropdown]") &&
      !target.closest("button[aria-haspopup]")
    ) {
      setActiveDropdown(null);
    }
  };

  // Add click outside listener
  useEffect(() => {
    if (activeDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [activeDropdown]);

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === "Escape") {
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
      <div className="relative hidden border-b border-gray-200 bg-[#43CD66] shadow-sm md:block">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    className="flex items-center py-4 text-[15px] font-medium text-gray-900 transition-colors duration-200 hover:text-white"
                    onClick={() =>
                      hasDropdown
                        ? handleCategoryClick(category.id)
                        : handleMegaMenuItemClick(category.id, category.name)
                    }
                    onBlur={() => {
                      // Use a timeout to allow focus to shift before checking the active element
                      setTimeout(() => {
                        if (
                          !document.activeElement?.closest("[data-dropdown]") &&
                          !document.activeElement?.closest(
                            "button[aria-haspopup]"
                          )
                        ) {
                          setActiveDropdown(null);
                        }
                      }, 100);
                    }}
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
            className={`absolute top-full z-50 border-t border-gray-200 bg-white shadow-lg ${
              megaMenuData.categories.find((cat) => cat.id === activeDropdown)
                ?.id === "by-condition" ||
              megaMenuData.categories.find((cat) => cat.id === activeDropdown)
                ?.id === "by-region"
                ? "left-1/2 min-w-[250px] -translate-x-1/2 transform"
                : "left-0 w-full"
            }`}
            data-dropdown
            onKeyDown={handleKeyDown}
            role="menu"
            tabIndex={-1}
          >
            <DropdownContent
              category={
                megaMenuData.categories.find(
                  (cat) => cat.id === activeDropdown
                ) || megaMenuData.categories[0]
              }
              onItemClick={handleMegaMenuItemClick}
            />
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="border-b border-gray-200 bg-[#43CD66] md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            aria-label="Toggle mobile menu"
            className="flex items-center text-gray-700 transition-colors hover:text-white"
            onClick={toggleMobileMenu}
            type="button"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
            <span className="ml-2 text-sm font-medium">Menu</span>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
            <div className="flex items-center justify-between border-b bg-[#43CD66] px-4 py-3">
              <span className="text-lg font-semibold text-gray-700">Menu</span>
              <button
                aria-label="Close mobile menu"
                className="text-gray-700 transition-colors hover:text-white"
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
                    className="border-b border-gray-100 last:border-b-0"
                    key={category.id}
                  >
                    {hasDropdown ? (
                      <button
                        className="flex w-full items-center justify-between py-4 text-left text-gray-700 transition-colors hover:text-red-600"
                        onClick={() => toggleMobileCategory(category.id)}
                        type="button"
                      >
                        <span className="font-medium">{category.name}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            expandedMobileCategory === category.id
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </button>
                    ) : (
                      <button
                        className="flex w-full items-center py-4 font-medium text-gray-700 transition-colors hover:text-red-600"
                        onClick={() =>
                          handleMegaMenuItemClick(category.id, category.name)
                        }
                        type="button"
                      >
                        {category.name}
                      </button>
                    )}

                    {hasDropdown && expandedMobileCategory === category.id && (
                      <div className="pb-4">
                        <MobileDropdownContent
                          category={category}
                          onLinkClick={() => setIsMobileMenuOpen(false)}
                          onItemClick={handleMegaMenuItemClick}
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
  onItemClick,
}: {
  category: MegaMenuCategory;
  onLinkClick: () => void;
  onItemClick: (categoryId: string, itemName: string) => void;
}) => {
  // Groups layout (like All Categories)
  if (category.groups && category.groups.length > 0) {
    return (
      <div className="space-y-6">
        {category.groups.map((group: MegaMenuGroup) => (
          <div className="space-y-2" key={group.id}>
            <h3 className="text-sm font-bold tracking-wide text-gray-900 uppercase">
              <button
                className="transition-colors duration-200 hover:text-red-600"
                onClick={() => {
                  onItemClick("all-categories", group.name);
                  onLinkClick();
                }}
                type="button"
              >
                {group.name}
              </button>
            </h3>
            <ul className="space-y-1 pl-3">
              {group.subcategories.map((subcategory: MegaMenuSubcategory) => (
                <li key={subcategory.id}>
                  <button
                    className="block w-full py-1 text-left text-sm text-gray-600 transition-colors hover:text-red-600"
                    onClick={() => {
                      onItemClick("all-categories", subcategory.name);
                      onLinkClick();
                    }}
                    type="button"
                  >
                    {subcategory.name}
                  </button>
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
              <h3 className="rounded bg-gray-50 p-2 text-sm font-bold tracking-wide text-gray-900 uppercase">
                <button
                  className="transition-colors duration-200 hover:text-red-600"
                  onClick={() => {
                    onItemClick("shop-by-region", group.title);
                    onLinkClick();
                  }}
                  type="button"
                >
                  {group.title}
                </button>
              </h3>
              <ul className="space-y-1 pl-3">
                {group.items.map((subcategory: MegaMenuSubcategory) => (
                  <li key={subcategory.id}>
                    <button
                      className="block w-full py-1 text-left text-sm text-gray-600 transition-colors hover:text-red-600"
                      onClick={() => {
                        onItemClick("shop-by-region", subcategory.name);
                        onLinkClick();
                      }}
                      type="button"
                    >
                      {subcategory.name}
                    </button>
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
      <h3 className="text-sm font-bold tracking-wide text-gray-900 uppercase">
        <button
          className="transition-colors duration-200 hover:text-red-600"
          onClick={() => {
            onItemClick(category.id, category.name);
            onLinkClick();
          }}
          type="button"
        >
          {category.name}
        </button>
      </h3>
      <ul className="space-y-1 pl-3">
        {category.subcategories.map((subcategory: MegaMenuSubcategory) => (
          <li key={subcategory.id}>
            <button
              className="block w-full py-1 text-left text-sm text-gray-600 transition-colors hover:text-red-600"
              onClick={() => {
                onItemClick(category.id, subcategory.name);
                onLinkClick();
              }}
              type="button"
            >
              {subcategory.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Dynamic dropdown content component
const DropdownContent = ({
  category,
  onItemClick,
}: {
  category: MegaMenuCategory;
  onItemClick: (categoryId: string, itemName: string) => void;
}) => {
  // Special layout for condition and region dropdowns
  if (category.id === "by-condition" || category.id === "shop-by-region") {
    return (
      <div className="w-full bg-white px-6 py-8 shadow-xl">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {category.groups?.map((group: MegaMenuGroup) => (
            <div key={group.id}>
              <button
                className="group flex w-full items-center rounded-lg px-3 py-3 text-left text-[15px] font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:text-red-600"
                onClick={() => onItemClick(category.id, group.name)}
                role="menuitem"
                type="button"
              >
                <div className="mr-3 h-2 w-2 rounded-full bg-gray-300 transition-colors group-hover:bg-red-500" />
                {group.name}
              </button>
            </div>
          )) ||
            category.subcategories.map((subcategory: MegaMenuSubcategory) => (
              <div key={subcategory.id}>
                <button
                  className="group flex w-full items-center rounded-lg px-3 py-3 text-left text-[15px] font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:text-red-600"
                  onClick={() => onItemClick(category.id, subcategory.name)}
                  role="menuitem"
                  type="button"
                >
                  <div className="mr-3 h-2 w-2 rounded-full bg-gray-300 transition-colors group-hover:bg-red-500" />
                  {subcategory.name}
                </button>
              </div>
            ))}
        </div>
      </div>
    );
  }

  // Groups layout (like All Categories) - clean consistent design
  if (category.groups && category.groups.length > 0) {
    return (
      <div className="mx-auto w-full bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto">
          <div className="grid grid-cols-3 gap-x-6 gap-y-3 md:grid-cols-4 lg:grid-cols-5">
            {category.groups.map((group: MegaMenuGroup) => (
              <div key={group.id}>
                <button
                  className="group flex w-full items-center rounded-lg px-3 py-3 text-left text-[15px] font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:text-red-600"
                  onClick={() => onItemClick("all-categories", group.name)}
                  role="menuitem"
                  type="button"
                >
                  <div className="mr-3 h-2 w-2 rounded-full bg-gray-300 transition-colors group-hover:bg-red-500" />
                  {group.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Regional layout (for categories with many subcategories) - clean design
  if (category.subcategories.length > 20) {
    return (
      <div className="mx-auto w-full bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groupSubcategories(category.subcategories).map(
              (group: { title: string; items: MegaMenuSubcategory[] }) => (
                <div className="space-y-2" key={group.title}>
                  <h3 className="text-[15px] font-semibold text-gray-900">
                    {group.title}
                  </h3>
                  <div className="space-y-1">
                    {group.items.map((subcategory: MegaMenuSubcategory) => (
                      <button
                        className="group flex w-full items-center rounded-lg px-3 py-1.5 text-left text-[14px] font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-red-600"
                        onClick={() =>
                          onItemClick("shop-by-region", subcategory.name)
                        }
                        key={subcategory.id}
                        role="menuitem"
                        type="button"
                      >
                        <div className="mr-3 h-1.5 w-1.5 rounded-full bg-gray-300 transition-colors group-hover:bg-red-500" />
                        {subcategory.name}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  // Simple grid layout - clean consistent design
  return (
    <div className="mx-auto w-full bg-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          <div className="space-y-3">
            <h3 className="text-[16px] font-semibold text-gray-900">
              <button
                className="hover:text-red-600"
                onClick={() => onItemClick(category.id, category.name)}
                role="menuitem"
                type="button"
              >
                {category.name}
              </button>
            </h3>
            <div className="space-y-2">
              {category.subcategories.map(
                (subcategory: MegaMenuSubcategory) => (
                  <button
                    className="group flex w-full items-center rounded-lg px-3 py-2 text-left text-[14px] font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-red-600"
                    onClick={() => onItemClick(category.id, subcategory.name)}
                    key={subcategory.id}
                    role="menuitem"
                    type="button"
                  >
                    <div className="mr-3 h-1.5 w-1.5 rounded-full bg-gray-300 transition-colors group-hover:bg-red-500" />
                    {subcategory.name}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
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
      currentGroup = { title: "All Items", items: [item] };
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
