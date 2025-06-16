import type { Metadata } from 'next';
import Image from 'next/image';
import { PodcastDetailContent } from '@/src/features/website/components/podcast/PodcastDetailContent';
import fs from 'fs';
import path from 'path';

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
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const episode = await getPodcastBySlug(decodedSlug);

  if (!episode) {
    return {
      title: 'Episode Not Found | The ReCommerce Show',
      description: 'The podcast episode you\'re looking for doesn\'t exist or has been removed.',
      robots: {
        index: false,
        follow: true
      }
    };
  }

  return {
    title: `${episode.title} | The ReCommerce Show`,
    description: episode.description,
    alternates: {
      canonical: `https://www.commercecentral.io/website/podcast/${decodedSlug}`
    },
    openGraph: {
      title: `${episode.title} | The ReCommerce Show`,
      description: episode.description,
      url: `https://www.commercecentral.io/website/podcast/${decodedSlug}`,
      type: 'article',
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
      card: 'summary_large_image',
      title: `${episode.title} | The ReCommerce Show`,
      description: episode.description,
      images: [episode.image],
    },
  };
}

// Mock function to get podcast data by slug
async function getPodcastBySlug(slug: string): Promise<PodcastEpisode | undefined> {
  const episodesData: Omit<PodcastEpisode, 'fetchedTranscript'>[] = [
    {
      id: 1,
      title: 'What is ReCommerce?',
      description: 'In the inaugural episode of the ReCommerce Show, hosts Shivang Maheshwari and Cat La introduce the concept of ReCommerce, which focuses on resale and reverse commerce in the retail industry. They discuss the significant waste problem in retail, highlighting the financial and environmental impacts of aging and returned inventory. The conversation highlights the significance of the ReCommerce industry in finding new homes for products and minimizing waste. The hosts outline the mission of their show to spotlight professionals in the ReCommerce space and share insights from future episodes featuring industry leaders.',
      date: '2025-05-29',
      image: '/images/podcast/Episode_1.webp',
      number: '01',
      duration: '18:35',
      guest: 'Shivang Maheshwari & Cat La',
      audioUrl: 'https://www.youtube.com/watch?v=VU5-RJDx9TQ',
      spotifyUrl: 'https://open.spotify.com/episode/6V6JQPbwq4S1zCPZL6kXuN',
      showNotes: [
        'Introduction to ReCommerce',
        'Market opportunities in liquidation',
        'How businesses can benefit from ReCommerce',
        'Future trends in the industry',
        'Getting started with ReCommerce platforms'
      ]
    },
    {
      id: 2,
      title: 'Sourcing Secrets: How to Tap Brand Surplus – Jarett Antoque (JD.com, ex-Amazon, SHEIN, Macy\'s)',
      description: 'In this episode of The ReCommerce Show, we sit down with Jarett Antoque, a retail veteran whose experience spans iconic names like Amazon Style, SHEIN, Zappos, Nordstrom, Macy\'s, and JD.com. Jarett shares hard-earned insights from decades in the industry, diving into the challenges brands face with excess inventory, sourcing under tariff pressures, and the delicate balance between profitability and sustainability.',
      date: '2025-06-11',
      image: '/images/podcast/Podcast_Ep2--Jarret.webp',
      number: '02',
      duration: '51:07',
      guest: 'Shivang Maheshwari & Jarett Antoque',
      audioUrl: 'https://www.youtube.com/watch?v=rBPdRaYUbgs',
      spotifyUrl: 'https://open.spotify.com/episode/4QuWaEFqfi269tNBfXTCzN?si=bqn2g5lNTSmlB8rOD20Rag',
      showNotes: [
        'Insights on excess inventory challenges',
        'Sourcing strategies under tariff pressures',
        'Balancing profitability and sustainability in retail'
      ]
    }
  ];

  const episodeData = episodesData.find(
    ep =>
      ep.title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-') === slug
  );

  if (!episodeData) {
    return undefined;
  }

  // Fetch transcript content if it's the target episode
  let fetchedTranscript: string | undefined = undefined;
  let transcriptFileName = '';
  if (episodeData.id === 1) {
    transcriptFileName = 'episode1_transcript.txt';
  } else if (episodeData.id === 2) {
    transcriptFileName = 'episode2_transcript.txt';
  }

  if (transcriptFileName) {
    try {
      const transcriptFilePath = path.join(process.cwd(), 'public', 'transcript', transcriptFileName);
      fetchedTranscript = fs.readFileSync(transcriptFilePath, 'utf-8');
    } catch (error) {
      console.error(`Error reading transcript file (${transcriptFileName}):`, error);
      fetchedTranscript = 'Transcript not available.';
    }
  }

  return {
    ...episodeData,
    fetchedTranscript,
  };
}

// This function runs at build time to generate all possible podcast episode paths
export async function generateStaticParams() {
  // Get slugs from our actual podcast episodes
  const slugs = [
    'what-is-recommerce',
    'sourcing-secrets-how-to-tap-brand-surplus-jarett-antoque-jdcom-ex-amazon-shein-macys'
  ];

  return slugs.map((slug) => ({
    slug,
  }));
}

export default async function PodcastDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const episode = await getPodcastBySlug(decodedSlug);

  if (!episode) {
    return (
      <div className="min-h-screen bg-[#102D21] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Episode Not Found</h1>
          <p className="text-xl">The podcast episode you're looking for doesn't exist or has been removed.</p>
          <a href="/website/podcast" className="mt-6 inline-block text-[#43CD66] hover:underline">
            ← Back to all episodes
          </a>
        </div>
      </div>
    );
  }

  return <PodcastDetailContent initialEpisode={episode} />;
}
