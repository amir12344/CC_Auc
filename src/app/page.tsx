import WebsiteLayout from './website/layout';
import HomeClient from './website/page-client';

/**
 * Home Page - Server Component
 * Clean root URL; content is served via rewrite to /website
 */
export default function Home() {
  return (
    <WebsiteLayout>
      <HomeClient />
    </WebsiteLayout>
  );
}

