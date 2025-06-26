import Footer from '@/src/features/website/components/layout/Footer';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**src\app\marketplace\layout.tsx
 * Main layout component for app sections
 * Note: ClientProviders should be provided by parent layouts (buyer, seller, marketplace)
 */
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className='flex min-h-screen max-w-full flex-col'>
      <Header />
      <main className="grow" id="main-content" tabIndex={-1}>
        <div>{children}</div>
      </main>
      <Footer />
    </div>
  );
}
