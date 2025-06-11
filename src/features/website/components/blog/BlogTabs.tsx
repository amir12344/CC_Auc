'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { BlogPost } from '@/src/lib/blog-data';

interface BlogTabsProps {
  activeTab: 'buyer' | 'seller';
  onTabChangeAction: (tab: 'buyer' | 'seller') => void;
  buyerPosts: Array<BlogPost>;
  sellerPosts: Array<BlogPost>;
  children: React.ReactNode;
}

export function BlogTabs({
  activeTab,
  onTabChangeAction,
  buyerPosts,
  sellerPosts,
  children,
}: BlogTabsProps) {
  return (
    <Tabs 
      defaultValue="buyer" 
      value={activeTab}
      onValueChange={(value: string) => onTabChangeAction(value as 'buyer' | 'seller')}
      className="w-full"
    >
      <div className="flex justify-center mb-8">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="buyer">Buyer ({buyerPosts.length})</TabsTrigger>
          <TabsTrigger value="seller">Seller ({sellerPosts.length})</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="buyer" className="mt-0">
        {activeTab === 'buyer' && children}
      </TabsContent>
      <TabsContent value="seller" className="mt-0">
        {activeTab === 'seller' && (
          sellerPosts.length > 0 ? (
            children
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-600">No seller blogs available yet</h3>
              <p className="text-gray-500 mt-2">Check back soon for new content!</p>
            </div>
          )
        )}
      </TabsContent>
    </Tabs>
  );
};

export default BlogTabs;
