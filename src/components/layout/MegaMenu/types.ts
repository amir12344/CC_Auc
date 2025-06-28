export interface MegaMenuCategory {
  id: string
  name: string
  href: string
  subcategories: MegaMenuSubcategory[]
  featured?: MegaMenuFeatured[]
  groups?: MegaMenuGroup[]
}

export interface MegaMenuSubcategory {
  id: string
  name: string
  href: string
  description?: string
}

export interface MegaMenuFeatured {
  id: string
  title: string
  href: string
  image: string
  price?: number
  originalPrice?: number
  discount?: number
}

export interface MegaMenuGroup {
  id: string
  name: string
  href: string
  subcategories: MegaMenuSubcategory[]
}

export interface MegaMenuData {
  categories: MegaMenuCategory[]
}
