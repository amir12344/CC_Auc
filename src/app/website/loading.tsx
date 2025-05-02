
export default function Loading() {
  // This loading component will be shown while website section pages are loading
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-primary-light/20 z-50 overflow-hidden">
      <div className="h-full bg-primary w-1/3 animate-progress-bar"></div>
    </div>
  );
}
