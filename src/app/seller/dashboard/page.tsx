'use client';

import { getCurrentUser } from 'aws-amplify/auth';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Bell,
  DollarSign,
  Package,
  Plus,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CreateListingDialog } from '@/src/components/seller/CreateListingDialog';
import { Button } from '@/src/components/ui/button';
// MainLayout is provided by seller/layout.tsx - no need to import
import {
  selectUserDisplayName,
  selectUserProfile,
} from '@/src/features/authentication/store/authSelectors';

const SellerDashboardPage = () => {
  const router = useRouter();
  const userProfile = useSelector(selectUserProfile);
  const userDisplayName = useSelector(selectUserDisplayName);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get user name from Redux store first
        if (userDisplayName) {
          setUserName(userDisplayName);
          setIsLoading(false);
          return;
        }

        if (userProfile?.fullName) {
          setUserName(userProfile.fullName);
          setIsLoading(false);
          return;
        }

        // Fallback to direct Amplify call if Redux doesn't have the data
        const user = await getCurrentUser();

        // Extract name from user attributes
        const fullName =
          user.signInDetails?.loginId || user.username || 'Seller';
        const displayName = fullName.includes('@')
          ? fullName.split('@')[0]
          : fullName;

        setUserName(displayName);
      } catch (_error) {
        setUserName('Seller');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [userProfile, userDisplayName]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-[#43CD66] border-t-2 border-b-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30">
      <CreateListingDialog onOpenChange={setIsDialogOpen} open={isDialogOpen} />
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1C1E21] via-[#102d21] to-[#43cd66] p-8 text-white">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 h-32 w-32 rotate-12 rounded-lg border border-white/20" />
              <div className="absolute bottom-4 left-4 h-24 w-24 rounded-full border border-white/10" />
            </div>

            <div className="relative z-10">
              <motion.h1
                animate={{ opacity: 1, x: 0 }}
                className="mb-2 font-bold text-3xl md:text-4xl"
                initial={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Welcome to Commerce Central, {userName}!
              </motion.h1>
              <motion.p
                animate={{ opacity: 1, x: 0 }}
                className="text-lg text-white/80"
                initial={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Your seller dashboard is ready. Start managing your inventory
                and connecting with buyers.
              </motion.p>

              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button
                  className="rounded-lg bg-white px-8 py-3 font-semibold text-[#43CD66] transition-all duration-200 hover:bg-gray-50 hover:shadow-lg"
                  onClick={() => setIsDialogOpen(true)}
                  size="lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Listing
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-600 text-sm">
                  Total Products
                </p>
                <p className="font-bold text-2xl text-gray-900">0</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-600 text-sm">
                  Active Orders
                </p>
                <p className="font-bold text-2xl text-gray-900">0</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-600 text-sm">
                  Total Revenue
                </p>
                <p className="font-bold text-2xl text-gray-900">$0</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-50">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-600 text-sm">
                  Active Buyers
                </p>
                <p className="font-bold text-2xl text-gray-900">0</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Getting Started */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="mb-6 font-bold text-2xl text-gray-900">
                Getting Started
              </h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-4 rounded-lg bg-gray-50 p-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#43CD66]">
                    <span className="font-bold text-sm text-white">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Complete Your Profile
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Add your business information and upload verification
                      documents.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 rounded-lg bg-gray-50 p-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-300">
                    <span className="font-bold text-sm text-white">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Add Your First Product
                    </h3>
                    <p className="text-gray-600 text-sm">
                      List your inventory and start connecting with buyers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 rounded-lg bg-gray-50 p-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-300">
                    <span className="font-bold text-sm text-white">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Manage Orders
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Process orders and communicate with buyers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  className="rounded-lg bg-[#43CD66] px-6 py-3 font-medium text-white transition-colors hover:bg-[#3ab859]"
                  onClick={() => router.push('/seller/listing')}
                  type="button"
                >
                  Manage Listings
                </button>
                <button
                  className="rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
                  onClick={() => router.push('/seller/dashboard')}
                  type="button"
                >
                  View Analytics
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-gray-900 text-lg">
                Quick Actions
              </h3>

              <div className="space-y-3">
                <button
                  className="flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-50"
                  onClick={() => setIsDialogOpen(true)}
                  type="button"
                >
                  <Package className="h-5 w-5 text-[#43CD66]" />
                  <span className="font-medium text-gray-700">
                    Create New Listing
                  </span>
                </button>

                <button
                  className="flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-50"
                  type="button"
                >
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">View Analytics</span>
                </button>

                <button
                  className="flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-50"
                  type="button"
                >
                  <Settings className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Account Settings</span>
                </button>

                <button
                  className="flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-50"
                  type="button"
                >
                  <Bell className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Notifications</span>
                </button>
              </div>
            </div>

            {/* Support Card */}
            <div className="mt-6 rounded-xl border border-[#43CD66]/20 bg-gradient-to-br from-[#43CD66]/10 to-[#43CD66]/5 p-6">
              <h3 className="mb-2 font-bold text-gray-900 text-lg">
                Need Help?
              </h3>
              <p className="mb-4 text-gray-600 text-sm">
                Our support team is here to help you get started and succeed on
                Commerce Central.
              </p>
              <button
                className="font-medium text-[#43CD66] text-sm transition-colors hover:text-[#3ab859]"
                type="button"
              >
                Contact Support →
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardPage;
