import type { Metadata } from "next";
import Link from "next/link";

// SEO metadata for the legal hub page
export const metadata: Metadata = {
  title: "Legal Information - Commerce Central",
  description:
    "Access Commerce Central's legal documents including privacy policy, terms of service, and data processing agreements.",
  alternates: {
    canonical: "https://www.commercecentral.io/website/legal",
  },
  openGraph: {
    url: "https://www.commercecentral.io/website/legal",
    title: "Legal Information - Commerce Central",
    description:
      "Access Commerce Central's legal documents including privacy policy, terms of service, and data processing agreements.",
    images: [
      {
        url: "/CC_opengraph.png",
        width: 500,
        height: 500,
        alt: "Commerce Central Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Legal Information - Commerce Central",
    description:
      "Access Commerce Central's legal documents including privacy policy, terms of service, and data processing agreements.",
    images: ["/CC_opengraph.png"],
  },
};

const legalPages = [
  {
    title: "Privacy Policy",
    description:
      "Learn how we collect, use, and protect your personal information.",
    href: "/website/legal/privacy-policy",
    icon: "🔒",
  },
  {
    title: "Terms & Conditions",
    description:
      "Review the terms governing your use of Commerce Central services.",
    href: "/website/legal/terms",
    icon: "📄",
  },
  {
    title: "Data Processing Agreement",
    description: "Understand our data processing practices and your rights.",
    href: "/website/legal/data-processing",
    icon: "🔧",
  },
];

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Legal Information
        </h1>
        <p className="text-lg text-gray-600">
          Access our legal documents and policies governing the use of Commerce
          Central
        </p>
      </div>

      {/* Legal Documents Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {legalPages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="group hover:border-primary block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="text-center">
              <div className="mb-4 text-4xl">{page.icon}</div>
              <h2 className="group-hover:text-primary mb-3 text-xl font-semibold text-gray-900">
                {page.title}
              </h2>
              <p className="text-gray-600">{page.description}</p>
            </div>
            <div className="text-primary mt-4 flex items-center justify-center">
              <span className="text-sm font-medium">Read More</span>
              <svg
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Additional Information */}
      <div className="mt-12 rounded-lg bg-gray-50 p-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">Need Help?</h3>
        <p className="text-gray-600">
          If you have questions about our legal policies or need additional
          information, please contact us at{" "}
          <a
            href="mailto:team@commercecentral.io"
            className="text-primary hover:underline"
          >
            team@commercecentral.io
          </a>
        </p>
      </div>
    </div>
  );
}
