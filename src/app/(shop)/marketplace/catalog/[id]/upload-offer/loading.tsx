import { Loader2 } from "lucide-react";

export default function UploadOfferLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-2 h-8 w-48 animate-pulse rounded-md bg-gray-200" />
          <div className="mx-auto h-4 w-64 animate-pulse rounded-md bg-gray-100" />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex min-h-[300px] flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="mt-4 text-gray-500">Loading upload interface...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
