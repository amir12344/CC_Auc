import Logo from '@/src/features/website/components/ui/Logo';
import Image from 'next/image';
import { motion } from 'framer-motion';

export const DashboardPreview = () => (
  <motion.div
    className="max-w-5xl mx-auto"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, delay: 0.2 }}
  >
    {/* Dashboard display with sidebar - matching the design reference */}
    <div className="relative mx-auto  overflow-hidden " style={{borderRadius: '10px 10px 0px 0px'}}>
      <div className="flex bg-white overflow-hidden" >
        
        <div className="w-24 md:w-32 bg-[#102D21] flex flex-col items-center py-6 ">
          {/* Logo - using Logo component */}
          <div className="mb-8">
            <Logo variant="light" size={50} minWidth={100} />
          </div>

          {/* Navigation Icons */}
          <div className="flex flex-col items-center space-y-6">
            {/* Dashboard Icon - Active */}
            <div className="w-8 h-8 rounded-md bg-[#43CD66] flex items-center justify-center text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Offers Icon */}
            <div className="w-8 h-8 rounded-md bg-[#102D21] flex items-center justify-center text-gray-300 hover:bg-[#43CD66]/20 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4H8a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11v4M12 7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Inventory Icon */}
            <div className="w-8 h-8 rounded-md bg-[#102D21] flex items-center justify-center text-gray-300 hover:bg-[#43CD66]/20 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 overflow-hidden" style={{ maxHeight: '336px' }}>
          {/* Dashboard Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <span className="font-medium text-[#1C1E21] font-[700]">Dashboard</span>
            <button className="px-3 py-1 bg-gray-900 text-white rounded-md text-xs flex items-center space-x-1 hover:bg-gray-800 transition-colors">
              <span>+ Upload Inventory</span>
            </button>
          </div>
          {/* Dashboard Content - Restored multi-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
            {/* Left Column - Performance Summary */}
            <div className="col-span-2">
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Performance Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  {/* Total Views */}
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-xs text-[#1C1E21] text-[500] mb-1">Total Views</div>
                    <div className="text-2xl text-[#43CD66] font-bold">2,207</div>
                  </div>
                  {/* Buyers Interested */}
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-xs text-[#1C1E21] text-[500] mb-1">Buyers Interested</div>
                    <div className="text-2xl text-[#43CD66] font-bold">112</div>
                  </div>
                  {/* Total Offers */}
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-xs text-[#1C1E21] mb-1">Total Offers</div>
                    <div className="text-2xl text-[#43CD66] font-bold">6</div>
                  </div>
                </div>
              </div>
              {/* Traffic Section - Showing graph as in reference */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Traffic</h3>
                <div className="bg-white rounded-md">
                  {/* Graph visualization - Only showing top half */}
                  <div className="h-32 w-full relative overflow-hidden">
                    {/* Line chart */}
                    <svg width="100%" height="200%" viewBox="0 0 600 320" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="40" x2="600" y2="40" stroke="#f1f1f1" strokeWidth="1" />
                      <line x1="0" y1="80" x2="600" y2="80" stroke="#f1f1f1" strokeWidth="1" />
                      <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f1f1" strokeWidth="1" />
                      {/* Purple line */}
                      <path d="M0,120 C50,100 100,40 150,60 C200,80 250,100 300,40 C350,20 400,60 450,80 C500,100 550,60 600,40" fill="none" stroke="#8B5CF6" strokeWidth="2" />
                      {/* Pink line with lower opacity */}
                      <path d="M0,140 C50,120 100,100 150,120 C200,140 250,120 300,80 C350,60 400,100 450,120 C500,140 550,120 600,100" fill="none" stroke="#EC4899" strokeWidth="2" strokeOpacity="0.5" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            {/* Right Column - Activity */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Activity</h3>
              {/* Activity Item */}
              <div className="bg-white rounded-md p-4 mb-3">
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-gray-200 shrink-0 mr-3 overflow-hidden">
                    <Image src="https://randomuser.me/api/portraits/women/44.jpg" width={32} height={32} alt="User" quality={75} loading="lazy" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-900 font-medium">3 bids • Today 1:35 PM</div>
                    <div className="h-2 my-2 bg-gray-200 rounded-full w-full"></div>
                    <div className="h-2 my-2 bg-gray-200 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
              {/* Add More Inventory Button */}
              <div className="bg-white rounded-md p-4 mb-3">
                <button className="flex items-center justify-center w-full text-xs text-gray-600 font-medium">
                  <span>Add more inventory +</span>
                </button>
              </div>
              {/* More Activity Items - Placeholder */}
              <div className="bg-white rounded-md p-4 mb-3">
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-gray-200 shrink-0 mr-3"></div>
                  <div className="w-full">
                    <div className="h-2 my-2 bg-gray-200 rounded-full w-full"></div>
                    <div className="h-2 my-2 bg-gray-200 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
              {/* Order ID */}
              <div className="bg-white rounded-md p-4 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">GHST-100 • $90,000</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* UI Tags Overlay - Animated */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-8 right-16 bg-linear-to-r from-[#102D21]/90 to-[#102D21]/80 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg backdrop-blur-xs">
        Purchase Order Sent
      </motion.div>
    </div>
  </motion.div>
);
