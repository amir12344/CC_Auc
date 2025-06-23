'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from 'aws-amplify/auth';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Package,
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Settings,
  Bell,
  Plus
} from 'lucide-react';
// MainLayout is provided by seller/layout.tsx - no need to import
import { selectUserProfile, selectUserDisplayName } from '@/src/features/authentication/store/authSelectors';
import { CreateListingDialog } from '@/src/components/seller/CreateListingDialog';
import { Button } from '@/src/components/ui/button';

const SellerDashboardPage = () => {
  const router = useRouter();
  const userProfile = useSelector(selectUserProfile);
  const userDisplayName = useSelector(selectUserDisplayName);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');

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
        const fullName = user.signInDetails?.loginId || user.username || 'Seller';
        const displayName = fullName.includes('@') ? fullName.split('@')[0] : fullName;

        setUserName(displayName);
      } catch (error) {
        console.error('Error loading user data:', error);
        setUserName('Seller');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [userProfile, userDisplayName]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#43CD66]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-[#1C1E21] via-[#102d21] to-[#43cd66] rounded-2xl p-8 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-32 h-32 border border-white/20 rounded-lg rotate-12"></div>
              <div className="absolute bottom-4 left-4 w-24 h-24 border border-white/10 rounded-full"></div>
            </div>

            <div className="relative z-10">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold mb-2"
              >
                Welcome to Commerce Central, {userName}!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-white/80 text-lg"
              >
                Your seller dashboard is ready. Start managing your inventory and connecting with buyers.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-6"
              >
                <CreateListingDialog>
                  <Button
                    size="lg"
                    className="bg-white hover:bg-gray-50 text-[#43CD66] font-semibold px-8 py-3 rounded-lg transition-all duration-200 hover:shadow-lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Listing
                  </Button>
                </CreateListingDialog>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">$0</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Buyers</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Getting Started */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Started</h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-[#43CD66] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Complete Your Profile</h3>
                    <p className="text-gray-600 text-sm">Add your business information and upload verification documents.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Add Your First Product</h3>
                    <p className="text-gray-600 text-sm">List your inventory and start connecting with buyers.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Manage Orders</h3>
                    <p className="text-gray-600 text-sm">Process orders and communicate with buyers.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => router.push('/seller/listing')}
                  className="bg-[#43CD66] hover:bg-[#3ab859] text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Manage Listings
                </button>
                <button
                  onClick={() => router.push('/seller/dashboard')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  View Analytics
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <CreateListingDialog>
                  <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Package className="w-5 h-5 text-[#43CD66]" />
                    <span className="text-gray-700 font-medium">Create New Listing</span>
                  </button>
                </CreateListingDialog>

                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">View Analytics</span>
                </button>

                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <Settings className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Account Settings</span>
                </button>

                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Notifications</span>
                </button>
              </div>
            </div>

            {/* Support Card */}
            <div className="mt-6 bg-gradient-to-br from-[#43CD66]/10 to-[#43CD66]/5 rounded-xl p-6 border border-[#43CD66]/20">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Our support team is here to help you get started and succeed on Commerce Central.
              </p>
              <button className="text-[#43CD66] hover:text-[#3ab859] font-medium text-sm transition-colors">
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
