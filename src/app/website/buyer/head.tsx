export default function Head() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: "Buyer FAQs",
    mainEntity: [
      {
        "@type": "Question",
        name: "Who can buy on Commerce Central?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Our platform is built for verified resale businesses, including bin stores, Amazon sellers, off-price retailers, and wholesale buyers. We do not support consumer purchases or personal use.",
        },
      },
      {
        "@type": "Question",
        name: "What kind of inventory do you offer?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "We source excess and returned inventory directly from brands, distributors, and 3PLs. Every lot includes documentation, manifests, and pricing transparency. We cover a range of categories, including those commonly found in online liquidation auctions.",
        },
      },
      {
        "@type": "Question",
        name: "Is there a minimum purchase requirement?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "No. You can purchase a single pallet or multiple truckloads. Whether you are scaling up or just starting. we support various buyer sizes. Learn more about pallet liquidation for resale.",
        },
      },
      {
        "@type": "Question",
        name: "How is pricing determined?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Sellers set their own pricing, and we ensure it's aligned with market expectations. Each lot includes condition, MSRP, and resale guidance where available.",
        },
      },
      {
        "@type": "Question",
        name: "Do you charge any fees to buyers?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "No monthly fees, subscriptions, or hidden charges. You pay only for the inventory and applicable shipping.",
        },
      },
      {
        "@type": "Question",
        name: "How do I get approved to buy?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Every buyer is verified before gaining access to listings. This protects our seller network and keeps the platform trusted. You can learn more about how our liquidation platform operates.",
        },
      },
      {
        "@type": "Question",
        name: "Where does inventory ship from?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "All inventory ships directly from the seller's facility — typically a brand, distributor, or 3PL — which reduces cost and handling delays.",
        },
      },
      {
        "@type": "Question",
        name: "Do you offer returns or guarantees?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "No returns. Because this is liquidation, all sales are final. However, we provide detailed manifests and product info so you can buy with clarity.",
        },
      },
    ],
  } as const;

  return (
    <>
      <script
        type="application/ld+json"
        // We stringify on the server to avoid client hydration mismatches
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
