"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/src/lib/utils"
import { 
  LayoutDashboard, 
  Package, 
  Heart, 
  ShoppingCart, 
  MessageSquare, 
  User 
} from "lucide-react"

const navigationItems = [
  {
    title: "Overview",
    href: "/buyer/deals",
    icon: LayoutDashboard,
  },
  {
    title: "All Deals",
    href: "/buyer/deals/all-deals",
    icon: Package,
  },
  {
    title: "Offers",
    href: "/buyer/deals/offers", 
    icon: Heart,
  },
  {
    title: "Orders",
    href: "/buyer/deals/orders",
    icon: ShoppingCart,
  },
  {
    title: "Messages",
    href: "/buyer/deals/messages",
    icon: MessageSquare,
  },
]

export function BuyerNavigation() {
  const pathname = usePathname()

  return (
    <div className="p-2 lg:p-3">
      <nav className="flex overflow-x-auto lg:flex-col lg:space-y-1 space-x-2 lg:space-x-0">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== "/buyer/deals" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-gray-100",
                isActive 
                  ? "bg-black text-white hover:bg-gray-800" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Icon className="mr-2 h-4 w-4 shrink-0" />
              <span className="lg:block">{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 