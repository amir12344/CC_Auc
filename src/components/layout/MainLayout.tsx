import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout component - Server Component by default
 */
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main id="main-content" className="grow" tabIndex={-1}>
        <div>{children}</div>
      </main>
      <Footer />
    </div>
  );
}

