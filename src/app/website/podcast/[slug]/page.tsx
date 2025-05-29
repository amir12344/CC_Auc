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
  relatedEpisodes?: Omit<PodcastEpisode, 'relatedEpisodes'>[];
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
      title: 'Episode Not Found | Commerce Central Podcast',
      description: 'The podcast episode you\'re looking for doesn\'t exist or has been removed.'
    };
  }

  return {
    title: `${episode.title} | Commerce Central Podcast`,
    description: episode.description,
    alternates: {
      canonical: `https://www.commercecentral.io/website/podcast/${decodedSlug}`
    },
    openGraph: {
      title: `${episode.title} | Commerce Central Podcast`,
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
      title: `${episode.title} | Commerce Central Podcast`,
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
  if (episodeData.id === 1) { // Assuming episode ID 1 has this transcript
    try {
      const transcriptFilePath = path.join(process.cwd(), 'public', 'transcript', 'episode1_transcript.txt');
      fetchedTranscript = fs.readFileSync(transcriptFilePath, 'utf-8');
    } catch (error) {
      console.error('Error reading transcript file:', error);
      // Optionally, set a default message or leave undefined
      fetchedTranscript = 'Transcript not available.';
    }
  }

  return {
    ...episodeData,
    fetchedTranscript,
  };
}

// Get related episodes (excluding the current one)
async function getRelatedEpisodes(currentId: number): Promise<PodcastEpisode[]> {
  // In a real app, this would fetch related episodes from an API
  const allEpisodes = await Promise.all([1, 2, 3]
    .filter(id => id !== currentId)
    .map(id => getPodcastBySlug(
      [
        'world-retail-congress-what-did-we-learn',
        'delivering-the-future-amazon-leaders-on-ai-robotics-last-mile-and-same-day-delivery',
        'aisle-to-algorithm-davids-bridals-new-ceo-on-retail-transformation'
      ][id - 1]
    ))
  );
  return allEpisodes.filter(Boolean) as PodcastEpisode[];
}

// This function runs at build time to generate all possible slugs
export async function generateStaticParams() {
  // In a real app, you would fetch these from your data source
  const slugs = [
    'world-retail-congress-what-did-we-learn',
    'delivering-the-future-amazon-leaders-on-ai-robotics-last-mile-and-same-day-delivery',
    'aisle-to-algorithm-davids-bridals-new-ceo-on-retail-transformation'
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

  const relatedEpisodes = await getRelatedEpisodes(episode.id);

  return <PodcastDetailContent initialEpisode={episode} relatedEpisodes={relatedEpisodes} />;
}
