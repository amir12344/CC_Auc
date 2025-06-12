export interface MegaMenuCategory {
  id: string;
  name: string;
  href: string;
  subcategories: MegaMenuSubcategory[];
  featured?: MegaMenuFeatured[];
}

export interface MegaMenuSubcategory {
  id: string;
  name: string;
  href: string;
  description?: string;
}

export interface MegaMenuFeatured {
  id: string;
  title: string;
  href: string;
  image: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
}

export interface MegaMenuData {
  categories: MegaMenuCategory[];
} 