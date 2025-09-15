export default function WebsiteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Minimal server-only wrapper to isolate marketing pages from app providers
  return children;
}
