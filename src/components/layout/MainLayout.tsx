import Footer from '@/src/features/website/components/layout/Footer';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout component - Server Component by default
 */
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen max-w-full">
      <Header />
      <main id="main-content" className="grow" tabIndex={-1}>
        <div>{children}</div>
      </main>
      <Footer />
    </div>
  );
}

