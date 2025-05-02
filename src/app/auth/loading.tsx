/**
 * Auth pages loading state
 */
export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
    </div>
  );
} 