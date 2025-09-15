export default function Loading() {
  // This loading component will be shown while website section pages are loading
  return (
    <div className="bg-primary-light/20 fixed top-0 right-0 left-0 z-50 h-1 overflow-hidden">
      <div className="bg-primary animate-progress-bar h-full w-1/3"></div>
    </div>
  );
}
