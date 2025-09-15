/**
 * Auth pages loading state
 */
export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="border-t-primary absolute inset-0 animate-spin rounded-full border-4 border-r-transparent border-b-transparent border-l-transparent"></div>
      </div>
    </div>
  );
}
