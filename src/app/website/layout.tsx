import WebsiteLayoutClient from "./layout-client";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server wrapper renders a small client island for Navbar/Footer
  return <WebsiteLayoutClient>{children}</WebsiteLayoutClient>;
}
