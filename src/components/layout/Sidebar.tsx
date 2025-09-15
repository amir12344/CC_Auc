"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import { X } from "lucide-react";

import { logout } from "@/src/features/authentication/store/authSlice";

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
    router.push("/marketplace");
  };

  // If sidebar is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="bg-opacity-50 fixed inset-0 bg-black transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar content */}
      <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white shadow-xl">
        <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
          <div className="flex items-center justify-between px-4">
            <div className="text-primary-600 text-xl font-bold">
              Account Settings
            </div>
            <button
              onClick={onClose}
              className="focus:ring-primary-500 ml-4 flex h-10 w-10 items-center justify-center rounded-full focus:ring-2 focus:outline-hidden focus:ring-inset"
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          <nav className="mt-5 px-2">
            <Link
              href="/profile"
              className="group hover:text-primary-600 flex items-center rounded-md px-2 py-2 text-base font-medium text-gray-600 hover:bg-gray-50"
              onClick={onClose}
            >
              Profile
            </Link>

            <Link
              href="/orders"
              className="group hover:text-primary-600 flex items-center rounded-md px-2 py-2 text-base font-medium text-gray-600 hover:bg-gray-50"
              onClick={onClose}
            >
              Orders
            </Link>

            <Link
              href="/preferences"
              className="group hover:text-primary-600 flex items-center rounded-md px-2 py-2 text-base font-medium text-gray-600 hover:bg-gray-50"
              onClick={onClose}
            >
              Preferences
            </Link>
          </nav>
        </div>

        {/* Logout button at the bottom */}
        <div className="flex shrink-0 border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center rounded-md px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
