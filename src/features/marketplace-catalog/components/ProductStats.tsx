import { Product } from "@/src/types";

// This is a server component for displaying product statistics
// It doesn't require client-side interactivity

interface ProductStatsProps {
  products: Product[];
}

const ProductStats = ({ products }: ProductStatsProps) => {
  // Calculate statistics on the server
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + product.price, 0);
  const averageDiscount =
    products
      .filter((p) => p.discount)
      .reduce((sum, p) => sum + (p.discount || 0), 0) /
      products.filter((p) => p.discount).length || 0;

  const refurbishedCount = products.filter((p) => p.isRefurbished).length;
  const auctionCount = products.filter((p) => p.bids !== undefined).length;

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-xs">
      <h3 className="mb-3 text-lg font-medium">Marketplace Stats</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-md bg-gray-50 p-3">
          <div className="mb-1 text-sm text-gray-500">Total Products</div>
          <div className="text-xl font-bold text-gray-900">{totalProducts}</div>
        </div>

        <div className="rounded-md bg-gray-50 p-3">
          <div className="mb-1 text-sm text-gray-500">Total Value</div>
          <div className="text-xl font-bold text-gray-900">
            ${totalValue.toLocaleString()}
          </div>
        </div>

        <div className="rounded-md bg-gray-50 p-3">
          <div className="mb-1 text-sm text-gray-500">Avg. Discount</div>
          <div className="text-xl font-bold text-gray-900">
            {averageDiscount ? `${Math.round(averageDiscount)}%` : "N/A"}
          </div>
        </div>

        <div className="rounded-md bg-gray-50 p-3">
          <div className="mb-1 text-sm text-gray-500">Refurbished</div>
          <div className="text-xl font-bold text-gray-900">
            {refurbishedCount}
          </div>
        </div>

        <div className="col-span-2 rounded-md bg-gray-50 p-3">
          <div className="mb-1 text-sm text-gray-500">Active Auctions</div>
          <div className="text-xl font-bold text-gray-900">{auctionCount}</div>
        </div>
      </div>
    </div>
  );
};

export default ProductStats;
