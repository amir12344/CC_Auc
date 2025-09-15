import fs from "fs";
import path from "path";
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PodcastDetailContent } from '@/src/features/website/components/podcast/PodcastDetailContent';
import { podcastEpisodesIndex } from '@/src/features/website/podcast/podcastEpisodes';
import { generatePageBreadcrumbItems } from '@/src/utils/metadata';
import { extractYouTubeVideoId, buildYouTubeEmbedUrl, getBestYouTubeThumbnailUrl } from '@/src/features/website/podcast/utils/youtube';
import { normalizeToISO8601Duration } from '@/src/features/website/podcast/utils/duration';

// Define the podcast episode type
type PodcastEpisode = {
  id: number;
  title: string;
  description: string;
  duration: string;
  date: string;
  image: string;
  number: string;
  guest: string;
  audioUrl: string;
  spotifyUrl?: string;
  transcript?: string;
  fetchedTranscript?: string;
  showNotes?: string[];
};

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const episode = await getPodcastBySlug(decodedSlug);

  if (!episode) {
    return {
      title: "Episode Not Found | The ReCommerce Show",
      description:
        "The podcast episode you're looking for doesn't exist or has been removed.",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  return {
    title: `${episode.title} | The ReCommerce Show`,
    description: episode.description,
    alternates: {
      canonical: `https://www.commercecentral.io/website/podcast/${decodedSlug}`,
    },
    openGraph: {
      title: `${episode.title} | The ReCommerce Show`,
      description: episode.description,
      url: `https://www.commercecentral.io/website/podcast/${decodedSlug}`,
      type: "article",
      publishedTime: new Date(episode.date).toISOString(),
      authors: [episode.guest],
      images: [
        {
          url: episode.image,
          width: 1200,
          height: 630,
          alt: episode.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${episode.title} | The ReCommerce Show`,
      description: episode.description,
      images: [episode.image],
    },
  };
}

// Generate VideoObject JSON-LD schema for Google Video indexing
function generateVideoObjectSchema(episode: PodcastEpisode, decodedSlug: string) {
  const videoId = extractYouTubeVideoId(episode.audioUrl);
  if (!videoId) {
    console.warn(`Could not extract YouTube video ID from: ${episode.audioUrl}`);
    return null;
  }

  const embedUrl = buildYouTubeEmbedUrl(videoId);
  const thumbnailUrl = getBestYouTubeThumbnailUrl(videoId);
  const isoDuration = normalizeToISO8601Duration(episode.duration);
  const canonicalUrl = `https://www.commercecentral.io/website/podcast/${decodedSlug}`;
  const uploadDate = new Date(episode.date).toISOString();

  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: episode.title,
    description: episode.description,
    thumbnailUrl: thumbnailUrl,
    uploadDate: uploadDate,
    duration: isoDuration,
    embedUrl: embedUrl,
    url: canonicalUrl,
    publisher: {
      '@type': 'Organization',
      name: 'Commerce Central',
      url: 'https://www.commercecentral.io',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.commercecentral.io/images/logo.png',
        width: 512,
        height: 512
      }
    },
    potentialAction: {
      '@type': 'SeekToAction',
      target: `${embedUrl}?t={seek_to_second_number}`,
      'startOffset-input': 'required name=seek_to_second_number'
    }
  };
}

// Generate PodcastEpisode JSON-LD schema (keeping existing for podcast features)
function generatePodcastEpisodeSchema(episode: PodcastEpisode, decodedSlug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'PodcastEpisode',
    name: episode.title,
    description: episode.description,
    datePublished: new Date(episode.date).toISOString(),
    image: episode.image,
    duration: normalizeToISO8601Duration(episode.duration),
    episodeNumber: episode.number,
    partOfSeries: {
      '@type': 'PodcastSeries',
      name: 'The ReCommerce Show',
      url: 'https://www.commercecentral.io/website/podcast'
    },
    url: `https://www.commercecentral.io/website/podcast/${decodedSlug}`,
    associatedMedia: {
      '@type': 'MediaObject',
      contentUrl: episode.audioUrl
    }
  };
}

// Mock function to get podcast data by slug
async function getPodcastBySlug(
  slug: string
): Promise<PodcastEpisode | undefined> {
  const episodesData: Omit<PodcastEpisode, "fetchedTranscript">[] = [
    {
      id: 1,
      title: "What is ReCommerce?",
      description:
        "In the inaugural episode of the ReCommerce Show, hosts Shivang Maheshwari and Cat La introduce the concept of ReCommerce, which focuses on resale and reverse commerce in the retail industry. They discuss the significant waste problem in retail, highlighting the financial and environmental impacts of aging and returned inventory. The conversation highlights the significance of the ReCommerce industry in finding new homes for products and minimizing waste. The hosts outline the mission of their show to spotlight professionals in the ReCommerce space and share insights from future episodes featuring industry leaders.",
      date: "2025-05-29",
      image: "/images/podcast/Episode_1.webp",
      number: "01",
      duration: "18:35",
      guest: "Shivang Maheshwari & Cat La",
      audioUrl: "https://www.youtube.com/watch?v=VU5-RJDx9TQ",
      spotifyUrl: "https://open.spotify.com/episode/6V6JQPbwq4S1zCPZL6kXuN",
      showNotes: [
        "Introduction to ReCommerce",
        "Market opportunities in liquidation",
        "How businesses can benefit from ReCommerce",
        "Future trends in the industry",
        "Getting started with ReCommerce platforms",
      ],
    },
    {
      id: 2,
      title:
        "Sourcing Secrets: How to Tap Brand Surplus – Jarett Antoque (JD.com, ex-Amazon, SHEIN, Macy's)",
      description:
        "In this episode of The ReCommerce Show, we sit down with Jarett Antoque, a retail veteran whose experience spans iconic names like Amazon Style, SHEIN, Zappos, Nordstrom, Macy's, and JD.com. Jarett shares hard-earned insights from decades in the industry, diving into the challenges brands face with excess inventory, sourcing under tariff pressures, and the delicate balance between profitability and sustainability.",
      date: "2025-06-11",
      image: "/images/podcast/Podcast_Ep2--Jarret.webp",
      number: "02",
      duration: "51:07",
      guest: "Shivang Maheshwari & Jarett Antoque",
      audioUrl: "https://www.youtube.com/watch?v=rBPdRaYUbgs",
      spotifyUrl:
        "https://open.spotify.com/episode/4QuWaEFqfi269tNBfXTCzN?si=bqn2g5lNTSmlB8rOD20Rag",
      showNotes: [
        "Insights on excess inventory challenges",
        "Sourcing strategies under tariff pressures",
        "Balancing profitability and sustainability in retail",
      ],
    },
    {
      id: 3,
      title:
        "Turning Excess Into Opportunity - Katie Feodoroff (KRF Merchant Service, Ex-Hilco Global, TJX)",
      description:
        "In this episode of The ReCOMMERCE Show, Shivang sits down with Katie Feodoroff, President of KRF Merchant Services and one of the most trusted voices in off-price retail and liquidation. With over 25 years of experience at industry giants like TJX and Hilco Global, Katie shares powerful lessons from the front lines of buying, inventory strategy, and managing excess.",
      date: "2025-06-23",
      image: "/images/podcast/Podcast_Turning Excess Into Opportunity.png",
      number: "03",
      duration: "57:08",
      guest: "Shivang Maheshwari & Katie Feodoroff",
      audioUrl: "https://www.youtube.com/watch?v=0I-9W-ep_bk",
      spotifyUrl: "https://open.spotify.com/episode/3jDE2XDtSXp08bUhKg2kPG",
      showNotes: [],
    },
    {
      id: 4,
      title:
        "Inside The World Of Off-Price Fashion Sourcing  - Kanchan Bharwani",
      description: `Hosted by Shivang Maheshwari, cofounder and CEO of Commerce Central, who’s passionate about spotlighting leaders shaping the future of retail supply chains, reverse logistics, ReCommerce, and circular operations.

Discover how Kanchan Bharwani helps brands turn surplus returns and overproduction into real growth in the off-price and recommerce world.
Whether you’re in reverse logistics, off-price retail, recommerce, or wholesale buying, you’ll gain practical insights on how to move inventory profitably while building trust in the ecosystem.`,
      date: "2025-07-11",
      image:
        "/images/podcast/Inside The World Of Off-Price Fashion Sourcing.png",
      number: "04",
      duration: "1 hr 3 min",
      guest: "Shivang Maheshwari & Kanchan Bharwani",
      audioUrl: "https://www.youtube.com/watch?v=1aUDyUYpVAs",
      spotifyUrl: "https://open.spotify.com/episode/6njxTsaBp5ZjJB8C7CfwYo",
      showNotes: [],
    },
    {
      id: 5,
      title:
        "ASD Market Week: The Premier Event of Retail & Sourcing - Stephanie Beringhele",
      description: `On this episode of The ReCommerce Show, we sit down with Stephanie Beringhele, the force behind ASD Market Week, to unpack why ASD isn’t just another trade show; it’s the backbone of retail sourcing in the U.S.

Whether you're sourcing closeouts, launching a storefront, or just trying to navigate today’s volatile supply chain, ASD is where the real work gets done.`,
      date: "2025-07-16",
      image: "/images/podcast/The Premier Event of Retail & Sourcing.png",
      number: "05",
      duration: "50:58",
      guest: "Shivang Maheshwari & Stephanie Beringhele",
      audioUrl: "https://www.youtube.com/watch?v=woauMCkKTxs",
      spotifyUrl:
        "https://open.spotify.com/episode/4mWu4M7bv6EnP78bf1F8nk?si=9aebd93f32ee4c1b&nd=1&dlsi=85b419acd0684560",
      showNotes: [],
    },
    {
      id: 6,
      title:
        "Good Supply Chains Go Unnoticed – Vidula Shetye (VP Supply Chain at ecobee)",
      description: `On this episode of The ReCommerce Show, we sit down with Vidula Shetye, one of the most respected operators in the consumer hardware industry, to explore what it truly takes to build supply chains that scale without compromising margin, mission, or control.

From Canadian Tire to New Balance to ecobee, Vidula has led supply chain transformations across various industries, helping brands build more innovative processes, recover value from returns, and leverage circularity as a competitive edge.`,
      date: "2025-07-22",
      image: "/images/podcast/Good Supply Chains Go Unnoticed.png",
      number: "06",
      duration: "1 hr 1 min",
      guest: "Shivang Maheshwari & Vidula Shetye",
      audioUrl: "https://www.youtube.com/watch?v=zB3zmShq6-4",
      spotifyUrl:
        "https://open.spotify.com/episode/6MjjUFbwGgYlY0Ooy71PAi?si=0714a61340234d83&nd=1&dlsi=708316e00fa84d18",
      showNotes: [],
    },
    {
      id: 7,
      title: "Shaping Retail Through Sustainability Leadership - Desta Raines",
      description: `On this episode of The ReCommerce Show, we’re joined by Desta Raines, a trailblazing sustainability leader who helped shape circular retail at Sephora, Apple, and Fairtrade USA.

Desta shares her journey from launching the Beauty (Re)Purposed program at Sephora, which has collected over 68,000 pounds of hard-to-recycle packaging, to navigating ethical sourcing at Apple and championing labor rights globally. We dive deep into the challenges of circularity in beauty, why resale isn't a one-size-fits-all solution, and how upstream decisions impact downstream recovery.`,
      date: "2025-08-04",
      image:
        "/images/podcast/Shaping Retail Through Sustainability Leadership.png",
      number: "07",
      duration: "52 min 56 sec",
      guest: "Shivang Maheshwari & Desta Raines",
      audioUrl: "https://www.youtube.com/watch?v=ZSQHv49WmaU",
      spotifyUrl:
        "https://open.spotify.com/episode/18uvwhaPXwRtz5FuKl8Bo2?si=ece5418352f545d5&nd=1&dlsi=b6f7efdfca6e4788",
      showNotes: [],
    },
  ];

  const episodeData = episodesData.find(
    (ep) =>
      ep.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-") === slug
  );

  if (!episodeData) {
    return undefined;
  }

  // Fetch transcript content if it's the target episode
  let fetchedTranscript: string | undefined = undefined;
  let transcriptFileName = "";
  if (episodeData.id === 1) {
    transcriptFileName = "episode1_transcript.txt";
  } else if (episodeData.id === 2) {
    transcriptFileName = "episode2_transcript.txt";
  } else if (episodeData.id === 3) {
    transcriptFileName = "Podcast_Turning Excess Into Opportunity.txt";
  } else if (episodeData.id === 4) {
    transcriptFileName = "Inside The World Of Off-Price Fashion Sourcing.txt";
  } else if (episodeData.id === 5) {
    transcriptFileName = "The Premier Event of Retail & Sourcing.txt";
  } else if (episodeData.id === 6) {
    transcriptFileName = "Good Supply Chains Go Unnoticed.txt";
  } else if (episodeData.id === 7) {
    transcriptFileName = "Shaping Retail Through Sustainability Leadership.txt";
  }

  if (transcriptFileName) {
    try {
      const transcriptFilePath = path.join(
        process.cwd(),
        "public",
        "transcript",
        transcriptFileName
      );
      fetchedTranscript = fs.readFileSync(transcriptFilePath, "utf-8");
    } catch (error) {
      fetchedTranscript = "Transcript not available.";
    }
  }

  return {
    ...episodeData,
    fetchedTranscript,
  };
}

// This function runs at build time to generate all possible podcast episode paths
export async function generateStaticParams() {
  // Get slugs from centralized podcast episodes index
  const slugs = podcastEpisodesIndex.map((e) => e.slug);

  return slugs.map((slug) => ({
    slug,
  }));
}

export default async function PodcastDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const episode = await getPodcastBySlug(decodedSlug);

  if (!episode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#102D21] text-white">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">Episode Not Found</h1>
          <p className="text-xl">
            The podcast episode you&apos;re looking for doesn&apos;t exist or
            has been removed.
          </p>
          {/* Use Next Link to avoid full reloads */}
          <Link
            href="/website/podcast"
            className="mt-6 inline-block text-[#43CD66] hover:underline"
          >
            ← Back to all episodes
          </Link>
        </div>
      </div>
    );
  }

  // Generate structured data schemas
  const videoObjectSchema = generateVideoObjectSchema(episode, decodedSlug);
  const podcastEpisodeSchema = generatePodcastEpisodeSchema(episode, decodedSlug);
  const breadcrumbSchema = generatePageBreadcrumbItems(`/website/podcast/${decodedSlug}`, episode.title);

  return (
    <>
      {/* VideoObject JSON-LD for Google Video indexing */}
      {videoObjectSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(videoObjectSchema)
          }}
        />
      )}
      
      {/* PodcastEpisode JSON-LD for podcast features */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(podcastEpisodeSchema)
        }}
      />
      
      {/* Breadcrumb JSON-LD for navigation */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      
      <PodcastDetailContent initialEpisode={episode} />
    </>
  );
}
