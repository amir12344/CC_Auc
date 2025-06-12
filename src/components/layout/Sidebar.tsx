'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { logout } from '@/src/features/authentication/store/authSlice';
import { X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const handleLogout = () => {
    dispatch(logout());
    onClose();
    router.push('/marketplace');
  };
  
  // If sidebar is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar content */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div className="px-4 flex items-center justify-between">
            <div className="text-xl font-bold text-primary-600">Account Settings</div>
            <button
              onClick={onClose}
              className="ml-4 flex items-center justify-center h-10 w-10 rounded-full focus:outline-hidden focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>
          
          <nav className="mt-5 px-2">
            <Link
              href="/profile"
              className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-primary-600"
              onClick={onClose}
            >
              Profile
            </Link>
            
            <Link
              href="/orders"
              className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-primary-600"
              onClick={onClose}
            >
              Orders
            </Link>
            
            <Link
              href="/preferences"
              className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-primary-600"
              onClick={onClose}
            >
              Preferences
            </Link>
          </nav>
        </div>
        
        {/* Logout button at the bottom */}
        <div className="shrink-0 flex border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-base font-medium rounded-md text-red-600 hover:bg-red-50 w-full"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

