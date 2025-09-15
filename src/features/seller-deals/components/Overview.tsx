"use client";

import { Clock, DollarSign, Package, TrendingUp } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

interface DealsMetrics {
  totalDeals: number;
  activeOffers: number;
  completedOrders: number;
  savedItems: number;
}

const mockMetrics: DealsMetrics = {
  totalDeals: 24,
  activeOffers: 8,
  completedOrders: 16,
  savedItems: 32,
};

export default function Overview() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">My Deals</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your buying activity.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.totalDeals}</div>
            <p className="text-muted-foreground text-xs">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.activeOffers}</div>
            <p className="text-muted-foreground text-xs">Pending responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Orders
            </CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockMetrics.completedOrders}
            </div>
            <p className="text-muted-foreground text-xs">+4 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Items</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.savedItems}</div>
            <p className="text-muted-foreground text-xs">In your wishlist</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to help you manage your buying activity
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="default">Browse New Deals</Button>
          <Button variant="outline">View All Offers</Button>
          <Button variant="outline">Check Messages</Button>
          <Button variant="outline">Account Settings</Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest interactions and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm">
                  Offer accepted for &quot;Willing Beauty&quot; deal
                </span>
              </div>
              <Badge variant="secondary">2 hours ago</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-sm">New message from seller</span>
              </div>
              <Badge variant="secondary">5 hours ago</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                <span className="text-sm">
                  Order shipped for &quot;Stokke&quot; items
                </span>
              </div>
              <Badge variant="secondary">1 day ago</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
