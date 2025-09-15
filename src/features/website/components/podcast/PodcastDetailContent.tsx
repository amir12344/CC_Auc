"use client";

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Mic2 } from 'lucide-react';
import { TranscriptSection } from './TranscriptSection';
import TestimonialsSection from '../sections/OnboardingSection';
import PodcastSpotifySection from './PodcastSpotifySection';
import { convertToYouTubeEmbedUrl } from '@/src/features/website/podcast/utils/youtube';

interface PodcastEpisode {
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
  fetchedTranscript?: string;
  showNotes?: string[];
}

interface PodcastDetailContentProps {
  initialEpisode: PodcastEpisode;
}

export function PodcastDetailContent({
  initialEpisode,
}: PodcastDetailContentProps) {
  const [episode] = useState(initialEpisode);

  // Helper: apply keyword->URL links only once per keyword across the description
  function applyKeywordLinks(
    desc: string,
    rules: { keyword: string; href: string }[],
  ) {
    let nodes: ReactNode[] = [desc];

    for (const { keyword, href } of rules) {
      let linked = false;
      const needle = keyword.toLowerCase();
      nodes = nodes.flatMap((node) => {
        if (typeof node !== 'string' || linked) return [node];
        const hay = node.toLowerCase();
        const idx = hay.indexOf(needle);
        if (idx === -1) return [node];

        const before = node.slice(0, idx);
        const match = node.slice(idx, idx + keyword.length);
        const after = node.slice(idx + keyword.length);
        linked = true;

        return [
          before,
          (
            <a
              key={`${keyword}-${idx}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#43CD66] underline decoration-[#43CD66]"
            >
              {match}
            </a>
          ),
          after,
        ];
      });
    }

    return <>{nodes}</>;
  }

  // Define per-episode keyword linking rules
  function getKeywordRulesForEpisode(ep: PodcastEpisode) {
    switch (ep.id) {
      // what-is-recommerce
      case 1:
        return [
          { keyword: 'returned inventory', href: 'https://www.commercecentral.io/wholesale-pallet-liquidation' },
          { keyword: 'liquidation platforms', href: 'https://www.commercecentral.io/wholesale-liquidation-platform' },
          { keyword: 'closeout', href: 'https://www.commercecentral.io/website/blog/buyer/how-to-spot-real-closeout-deals' },
        ];
      // sourcing-secrets-how-to-tap-brands-surplus-jarrett-antoque-jdcom-ex-amazon-shein-macys
      case 2:
        return [
          { keyword: 'excess inventory', href: 'https://www.commercecentral.io/website/seller' },
          { keyword: 'surplus inventory', href: 'https://www.commercecentral.io/website/buyer' },
          { keyword: 'beauty and home', href: 'https://www.commercecentral.io/website/blog/seller/when-beauty-products-sit-too-long-the-real-cost-of-slow-inventory-in-cosmetics' },
        ];
      // turning-excess-into-opportunity-katie-feoderoff-...
      case 3:
        return [
          { keyword: 'excess inventory', href: 'https://www.commercecentral.io/website/seller' },
          { keyword: 'resale liquidation', href: 'https://www.commercecentral.io/website/buyer' },
          { keyword: 'wholesale channel', href: 'https://www.commercecentral.io/wholesale-liquidation-platform' },
        ];
      // inside-the-world-of-off-price-fashion-sourcing-kanchan-bharwani
      case 4:
        return [
          { keyword: 'surplus returns', href: 'https://www.commercecentral.io/website/buyer' },
          { keyword: 'wholesale channel', href: 'https://www.commercecentral.io/wholesale-liquidation-platform' },
          { keyword: 'surplus inventory', href: 'https://www.commercecentral.io/website/blog/buyer/how-to-buy-liquidation-pallets-for-flea-market-swap-meet-sellers' },
        ];
      // asd-market-week-the-premier-event-of-retail-sourcing-stephanie-beringhele
      case 5:
        return [
          { keyword: 'supply chain', href: 'https://www.commercecentral.io/website/blog/buyer/how-the-liquidation-supply-chain-works-and-whos-involved' },
          { keyword: 'closeouts', href: 'https://www.commercecentral.io/website/blog/buyer/how-to-spot-real-closeout-deals' },
          { keyword: 'surplus inventory', href: 'https://www.commercecentral.io/website/blog/buyer/how-to-buy-liquidation-pallets-for-flea-market-swap-meet-sellers' },
        ];
      // good-supply-chains-go-unnoticed-vidula-shetye
      case 6:
        return [
          { keyword: 'supply chains', href: 'https://www.commercecentral.io/website/blog/buyer/how-the-liquidation-supply-chain-works-and-whos-involved' },
          { keyword: 'resale channel', href: 'https://www.commercecentral.io/website/buyer' },
        ];
      // shaping-retail-through-sustainability-desta-raines
      case 7:
        return [
          { keyword: 'excess inventory', href: 'https://www.commercecentral.io/website/seller' },
          { keyword: 'wholesale deals', href: 'https://www.commercecentral.io/wholesale-liquidation-platform' },
          { keyword: 'beauty products', href: 'https://www.commercecentral.io/website/blog/seller/when-beauty-products-sit-too-long-the-real-cost-of-slow-inventory-in-cosmetics' },
        ];
      default:
        return [] as { keyword: string; href: string }[];
    }
  }

  return (
    <div className="min-h-screen bg-[#0A1F17] pt-24 text-white">
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mx-auto mb-8 max-w-5xl">
          <Link
            href="/website/podcast"
            className="inline-flex items-center text-lg text-[#43CD66] transition-colors hover:text-white"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to all episodes
          </Link>
        </div>

        {/* Episode Header */}
        <div className="mx-auto mb-8 max-w-5xl">
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">
            {episode.title}
          </h1>

          <div className="mb-4 flex items-center">
            <div className="mr-2 rounded-full bg-[#43CD66] p-1.5">
              <Mic2 className="h-4 w-4 text-black" />
            </div>
            <span className="text-base">Featuring {episode.guest}</span>
          </div>
          <div className="mb-2 flex items-center space-x-2 text-xs text-[#43CD66]">
            <span>Episode {episode.number}</span>
            <span>•</span>
            <span>
              {new Date(episode.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span>•</span>
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              <span>{episode.duration}</span>
            </div>
          </div>
        </div>

        {/* Video Player Section */}
        <div className="mb-12">
          <div className="relative w-full max-w-5xl mx-auto bg-black rounded-lg overflow-hidden" style={{ height: '516px' }}>
            <iframe
              src={convertToYouTubeEmbedUrl(episode.audioUrl)}
              title={episode.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        </div>

        {/* Description Section */}
        <div className="prose prose-invert mx-auto mb-16 ml-auto max-w-5xl">
          <h2 className="mb-6 text-2xl font-bold">Episode Description</h2>
          <p className="text-lg leading-relaxed">
            {applyKeywordLinks(episode.description, getKeywordRulesForEpisode(episode))}
          </p>
        </div>
      </div>

      {/* Audio Player -> Changed to Spotify Embed */}
      {/* Spotify Section - Using the new component. This will be full-width based on its internal styling. */}
      <div className="border-none shadow-none">
        {episode.spotifyUrl && (
          <PodcastSpotifySection
            spotifyUrl={episode.spotifyUrl}
            episodeTitle={episode.title}
          />
        )}
      </div>

      {/* Transcript Section */}
      {episode.fetchedTranscript &&
        episode.fetchedTranscript !== "Transcript not available." && (
          <TranscriptSection
            transcript={episode.fetchedTranscript}
            canLoadMoreEpisodes={false}
          />
        )}

      <TestimonialsSection />
    </div>
  );
}
