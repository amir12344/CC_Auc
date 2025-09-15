"use client";

import Image from "next/image";
import Link from "next/link";

interface Episode {
  id: number;
  title: string;
  description?: string;
  duration: string;
  date: string;
  image?: string;
  number?: string;
  guest?: string;
}

const PodcastEpisodesSection = () => {
  const episodes: Episode[] = [
    {
      id: 1,
      title: "What is ReCommerce?",
      date: "May 29 2025",
      image: "/images/podcast/Episode_1.png",
      number: "01",
      duration: "18:35",
      guest: "Shivang Maheshwari & Cat La",
    },
    {
      id: 2,
      title:
        "Sourcing Secrets: How to Tap Brand Surplus – Jarett Antoque (JD.com, ex-Amazon, SHEIN, Macy’s)",
      date: "June 11 2025",
      image: "/images/podcast/Thumbnail_Podcast_Ep2--Jarret.png",
      number: "02",
      duration: "51:07",
      guest: "Shivang Maheshwari & Jarett Antoque",
    },
    {
      id: 3,
      title:
        "Turning Excess Into Opportunity - Katie Feodoroff (KRF Merchant Service, Ex-Hilco Global, TJX)",
      date: "June 23 2025",
      image: "/images/podcast/Podcast_Turning Excess Into Opportunity.png",
      number: "03",
      duration: "57:08",
      guest: "Shivang Maheshwari & Katie Feodoroff",
    },
    {
      id: 4,
      title:
        "Inside The World Of Off-Price Fashion Sourcing  - Kanchan Bharwani",
      date: "July 11 2025",
      image:
        "/images/podcast/Inside The World Of Off-Price Fashion Sourcing.png",
      number: "04",
      duration: "1 hr 3 min",
      guest: "Shivang Maheshwari & Kanchan Bharwani",
    },
    {
      id: 5,
      title:
        "ASD Market Week: The Premier Event of Retail & Sourcing - Stephanie Beringhele",
      date: "July 16 2025",
      image: "/images/podcast/The Premier Event of Retail & Sourcing.png",
      number: "05",
      duration: "50:58",
      guest: "Shivang Maheshwari & Stephanie Beringhele",
    },
    {
      id: 6,
      title:
        "Good Supply Chains Go Unnoticed – Vidula Shetye (VP Supply Chain at ecobee)",
      date: "July 22 2025",
      image: "/images/podcast/Good Supply Chains Go Unnoticed.png",
      number: "06",
      duration: "1 hr 1 min",
      guest: "Shivang Maheshwari & Vidula Shetye",
    },
    {
      id: 7,
      title: "Shaping Retail Through Sustainability Leadership - Desta Raines",
      date: "August 4 2025",
      image:
        "/images/podcast/Shaping Retail Through Sustainability Leadership.png",
      number: "07",
      duration: "52 min 56 sec",
      guest: "Shivang Maheshwari & Desta Raines",
    },
  ];

  return (
    <section className="bg-[#102D21] py-24" id="episodes">
      <div className="max-w-8xl mx-auto px-4">
        <h2 className="mb-16 text-center text-4xl font-bold text-white">
          Start Listening Today
        </h2>
        <div className="flex flex-wrap justify-center gap-12">
          {episodes.map((episode) => {
            const slug = episode.title
              .toLowerCase()
              .replace(/[^\w\s-]/g, "")
              .replace(/\s+/g, "-")
              .replace(/--+/g, "-");

            return (
              <Link
                href={`/website/podcast/${slug}`}
                key={episode.id}
                className="group block"
              >
                <article
                  className="relative w-80 overflow-hidden rounded-xl bg-black transition-all duration-300 hover:translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(67,205,102,0.8)]"
                  style={{
                    borderRadius: "13.632px",
                    border: "1px solid #D8F4CC",
                  }}
                >
                  {/* Episode Image */}
                  <div className="relative aspect-square p-4">
                    <Image
                      src={
                        episode.image || "/images/podcast/default-episode.png"
                      }
                      alt={episode.title}
                      fill
                      className="rounded-md object-cover duration-300"
                    />
                  </div>

                  {/* Episode Details */}
                  {/* <div className='p-6 h-28 flex flex-col justify-center'>
                    <h3 className='text-lg font-[500] text-white mb-2 line-clamp-2'>
                      {episode.title}
                    </h3>
                  </div> */}
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PodcastEpisodesSection;
