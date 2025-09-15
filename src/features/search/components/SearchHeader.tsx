"use client";

import { Search } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";

interface SearchHeaderProps {
  query: string;
  resultCount?: number;
}

export const SearchHeader = ({ query, resultCount }: SearchHeaderProps) => {
  if (!query) {
    return (
      <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Search Products
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Search through thousands of surplus inventory products. Find
              electronics, furniture, home goods, and more at unbeatable prices.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Search Results
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm text-gray-600">Results for:</span>
                <Badge variant="secondary" className="font-medium">
                  {query}
                </Badge>
              </div>
            </div>
          </div>

          {resultCount !== undefined && (
            <Card className="w-fit">
              <CardContent className="px-4 py-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {resultCount.toLocaleString()}
                  </div>
                  <div className="text-xs tracking-wide text-gray-500 uppercase">
                    {resultCount === 1 ? "Product" : "Products"} Found
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
