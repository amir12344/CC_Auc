export default function BuyerLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="mb-2 h-8 animate-pulse rounded bg-gray-200"></div>
        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200"></div>
      </div>

      <div className="rounded-lg bg-white p-12 text-center shadow-md">
        <div className="mx-auto mb-4 h-16 w-16 animate-pulse rounded bg-gray-200"></div>
        <div className="mx-auto mb-2 h-6 w-1/2 animate-pulse rounded bg-gray-200"></div>
        <div className="mx-auto mb-6 h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
        <div className="flex justify-center space-x-4">
          <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
          <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg bg-gray-50 p-6">
            <div className="mb-2 h-5 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
