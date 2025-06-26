import Footer from '@/src/features/website/components/layout/Footer';
import Navbar from '@/src/features/website/components/layout/Navbar';

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
