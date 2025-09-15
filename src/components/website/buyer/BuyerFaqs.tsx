"use client";

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

export default function BuyerFaqs() {
  const faqItems: FAQItem[] = [
    {
      id: "item-1",
      question: "Who can buy on Commerce Central?",
      answer:
        "Our platform is built for verified resale businesses, including bin stores, Amazon sellers, off-price retailers, and wholesale buyers. We do not support consumer purchases or personal use.",
    },
    {
      id: "item-2",
      question: "What kind of inventory do you offer?",
      answer:
        'We source excess and returned inventory directly from brands, distributors, and 3PLs. Every lot includes documentation, manifests, and pricing transparency. We cover a range of categories, including those commonly found in <a href="https://www.commercecentral.io/online-liquidation-auctions">online liquidation auctions</a>.',
    },
    {
      id: "item-3",
      question: "Is there a minimum purchase requirement?",
      answer:
        'No. You can purchase a single pallet or multiple truckloads. Whether you are scaling up or just starting. we support various buyer sizes. Learn more about<a href="https://www.commercecentral.io/wholesale-pallet-liquidation"> pallet liquidation for resale</a>.',
    },
    {
      id: "item-4",
      question: "How is pricing determined?",
      answer:
        "Sellers set their own pricing, and we ensure it's aligned with market expectations. Each lot includes condition, MSRP, and resale guidance where available.",
    },
    {
      id: "item-5",
      question: "Do you charge any fees to buyers?",
      answer:
        "No monthly fees, subscriptions, or hidden charges. You pay only for the inventory and applicable shipping.",
    },
    {
      id: "item-6",
      question: "How do I get approved to buy?",
      answer:
        'Every buyer is verified before gaining access to listings. This protects our seller network and keeps the platform trusted. You can learn more about how our <a href="https://www.commercecentral.io/wholesale-liquidation-platform">liquidation platform operates</a>.',
    },
    {
      id: "item-7",
      question: "Where does inventory ship from?",
      answer:
        "All inventory ships directly from the seller's facility — typically a brand, distributor, or 3PL — which reduces cost and handling delays.",
    },
    {
      id: "item-8",
      question: "Do you offer returns or guarantees?",
      answer:
        "No returns. Because this is liquidation, all sales are final. However, we provide detailed manifests and product info so you can buy with clarity.",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">FAQ</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {faqItems.map((item) => (
          <div
            key={item.id}
            className="h-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold leading-6 text-gray-900">
              {item.question}
            </h3>
            <div className="mt-2 border-t border-gray-100 pt-4">
              <div
                className="prose max-w-none text-[15px] leading-7 text-gray-600 prose-a:font-medium prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-a:underline"
                dangerouslySetInnerHTML={{
                  __html: item.answer
                    // ensure target/rel
                    .replace(
                      /<a(?![^>]*\btarget=)([^>]*?)>/g,
                      '<a$1 target="_blank" rel="noopener noreferrer">'
                    )
                    // add class if missing
                    .replace(
                      /<a(?![^>]*\bclass=)([^>]*?)>/g,
                      '<a$1 class="text-blue-600 hover:text-blue-800 underline font-medium">'
                    )
                    // append our classes if class exists
                    .replace(
                      /<a([^>]*?)class="([^"]*)"([^>]*)>/g,
                      (_m, pre, cls, post) => {
                        const add =
                          "text-blue-600 hover:text-blue-800 underline font-medium";
                        // avoid duplicating classes
                        const needed = add
                          .split(" ")
                          .filter(
                            (c) =>
                              !new RegExp("(?:^|\\s)" + c + "(?:$|\\s)").test(
                                cls
                              )
                          )
                          .join(" ");
                        const newCls = needed ? cls + " " + needed : cls;
                        return `<a${pre}class="${newCls}"${post}>`;
                      }
                    ),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
