import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal Documents | Commerce Central',
  description: 'Legal information, terms, privacy policy, and other legal documents for Commerce Central',
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {children}
      </div>
    </div>
  );
}