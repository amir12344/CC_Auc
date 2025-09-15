"use client";

import Link from "next/link";
import React from "react";

import { Clock, Mail, MessageSquare, ShoppingBag } from "lucide-react";

import { DynamicBreadcrumb } from "@/src/components/ui/DynamicBreadcrumb";

/**
 * Inbox client component displaying page under development message
 */
export function InboxClient() {
  return (
    <div className="bg-gray-50/50">
      <div className="max-w-8xl container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <DynamicBreadcrumb className="mb-6" />

        {/* Page Under Development Content */}
        <div className="flex min-h-[600px] flex-col items-center justify-center">
          <div className="mx-auto max-w-md text-center">
            {/* Icon */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="rounded-full bg-blue-100 p-6">
                  <Mail className="h-12 w-12 text-blue-600" />
                </div>
                <div className="absolute -top-1 -right-1 rounded-full bg-green-100 p-2">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                </div>
                <div className="absolute -bottom-1 -left-1 rounded-full bg-orange-100 p-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Heading */}
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900">
              Page Under Development
            </h1>

            {/* Description */}
            <p className="mb-6 text-lg leading-relaxed text-gray-600">
              This page is under development and will be live soon.
            </p>

            <Link
              className="inline-flex cursor-pointer items-center justify-center space-x-2 rounded-full border border-black bg-black px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-white hover:text-black focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
              href="/marketplace"
            >
              <span>Go to Marketplace</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
