'use client';

import { motion } from 'framer-motion';
import {
  DollarSign,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CreateListingDialog } from '@/src/components/seller/CreateListingDialog';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { Input } from '@/src/components/ui/input';

// Mock data for listings - replace with actual API call
const mockListings = [
  {
    id: '1',
    title: 'Premium Electronics Bundle',
    category: 'Electronics',
    status: 'active',
    price: 2500,
    views: 45,
    created: '2024-01-15',
    image: '/images/products/electronics-1.jpg',
  },
  {
    id: '2',
    title: 'Fashion Apparel Lot',
    category: 'Fashion',
    status: 'draft',
    price: 1200,
    views: 0,
    created: '2024-01-14',
    image: '/images/products/fashion-1.jpg',
  },
  {
    id: '3',
    title: 'Home & Garden Collection',
    category: 'Home & Garden',
    status: 'active',
    price: 800,
    views: 23,
    created: '2024-01-13',
    image: '/images/products/home-1.jpg',
  },
];

const SellerListingsPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [listings] = useState(mockListings);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Filter listings based on search term
  const filteredListings = listings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: listings.length,
    active: listings.filter((l) => l.status === 'active').length,
    draft: listings.filter((l) => l.status === 'draft').length,
    totalValue: listings.reduce((sum, l) => sum + l.price, 0),
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-[#43CD66] border-t-2 border-b-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <CreateListingDialog onOpenChange={setIsDialogOpen} open={isDialogOpen} />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-2 font-bold text-3xl text-gray-900">
              My Listings
            </h1>
            <p className="text-gray-600">
              Manage your product listings and inventory
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              className="bg-[#43CD66] text-white hover:bg-[#3ab859]"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Listing
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Total Listings
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl text-green-600">
                {stats.active}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Draft</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl text-yellow-600">
                {stats.draft}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">
                ${stats.totalValue.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
            <Input
              className="pl-10"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search listings..."
              value={searchTerm}
            />
          </div>
          <Button
            className="flex items-center gap-2"
            type="button"
            variant="outline"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              key={listing.id}
              transition={{ duration: 0.3 }}
            >
              <Card className="transition-shadow hover:shadow-lg">
                <div className="relative">
                  <div className="flex h-48 items-center justify-center rounded-t-lg bg-gray-200">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={
                        listing.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {listing.status}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="line-clamp-2 font-semibold text-gray-900">
                      {listing.title}
                    </h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="h-8 w-8 p-0"
                          size="sm"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/seller/listing/${listing.id}`)
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/seller/listing/${listing.id}/edit`)
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="mb-2 text-gray-500 text-sm">
                    {listing.category}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#43CD66] text-lg">
                      ${listing.price.toLocaleString()}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Eye className="mr-1 h-4 w-4" />
                      {listing.views}
                    </div>
                  </div>

                  <div className="mt-3 text-gray-400 text-xs">
                    Created: {new Date(listing.created).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredListings.length === 0 && searchTerm && (
          <div className="py-12 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 font-medium text-gray-900 text-lg">
              No listings found
            </h3>
            <p className="text-gray-500">Try adjusting your search terms</p>
          </div>
        )}

        {/* Empty State - No listings at all */}
        {listings.length === 0 && (
          <div className="py-12 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 font-medium text-gray-900 text-lg">
              No listings yet
            </h3>
            <p className="mb-4 text-gray-500">
              Create your first listing to get started selling
            </p>
            <Button
              className="bg-[#43CD66] text-white hover:bg-[#3ab859]"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Listing
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerListingsPage;
