export default function BuyerLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="h-16 w-16 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-1/2 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-6 w-2/3 mx-auto"></div>
        <div className="flex justify-center space-x-4">
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-50 p-6 rounded-lg">
            <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
} 