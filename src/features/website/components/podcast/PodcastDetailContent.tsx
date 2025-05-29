'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Clock, Mic2 } from 'lucide-react';
import { TranscriptSection } from './TranscriptSection';
import TestimonialsSection from '../sections/OnboardingSection';
import PodcastSpotifySection from './PodcastSpotifySection';

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
  relatedEpisodes?: Omit<PodcastEpisode, 'relatedEpisodes'>[];
}

interface PodcastDetailContentProps {
  initialEpisode: PodcastEpisode;
  relatedEpisodes: Omit<PodcastEpisode, 'relatedEpisodes'>[];
}

export function PodcastDetailContent({ initialEpisode, relatedEpisodes }: PodcastDetailContentProps) {
  const [episode] = useState(initialEpisode);
  const [episodes] = useState(relatedEpisodes);

  return (
    <div className="min-h-screen bg-[#0A1F17] text-white pt-24">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8 max-w-5xl mx-auto">
          <a
            href="/website/podcast"
            className="inline-flex items-center text-[#43CD66] hover:text-white transition-colors text-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to all episodes
          </a>
        </div>

        {/* Episode Header */}
        <div className="mb-8 max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{episode.title}</h1>

          <div className="flex items-center mb-4">
            <div className="bg-[#43CD66] rounded-full p-1.5 mr-2">
              <Mic2 className="h-4 w-4 text-black" />
            </div>
            <span className="text-base">Featuring {episode.guest}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-[#43CD66] mb-2">
            <span>Episode {episode.number}</span>
            <span>•</span>
            <span>{new Date(episode.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>•</span>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{episode.duration}</span>
            </div>
          </div>
        </div>

        {/* Video Player Section */}
        <div className="mb-12">
          <div className="relative w-full max-w-5xl mx-auto bg-black rounded-lg overflow-hidden" style={{ height: '516px' }}>
            <iframe
              src={episode.audioUrl.includes('youtube.com/watch?v=')
                ? episode.audioUrl.replace('watch?v=', 'embed/')
                : episode.audioUrl.includes('youtu.be/')
                  ? episode.audioUrl.replace('youtu.be/', 'youtube.com/embed/')
                  : episode.audioUrl
              }
              title={episode.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        </div>

        {/* Description Section */}
        <div className="prose prose-invert max-w-5xl mx-auto mb-16 ml-auto">
          <h2 className="text-2xl font-bold mb-6">Episode Description</h2>
          <p className="text-lg leading-relaxed">{episode.description}</p>

        </div>


      </div>

      {/* Audio Player -> Changed to Spotify Embed */}
      {/* Spotify Section - Using the new component. This will be full-width based on its internal styling. */}
      <div className='shadow-none border-none'>
        {episode.spotifyUrl && (
          <PodcastSpotifySection
            spotifyUrl={episode.spotifyUrl}
            episodeTitle={episode.title}
          />
        )}
      </div>

      {/* Transcript Section */}
      {episode.fetchedTranscript && episode.fetchedTranscript !== 'Transcript not available.' && (
        <TranscriptSection
          transcript={episode.fetchedTranscript}
          canLoadMoreEpisodes={episodes.length > 0}
        />
      )}

      {/* Related Episodes */}
      {episodes.length > 0 && (
        <div className="bg-[#0A1F17] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8">More Episodes You Might Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {episodes.map((relatedEpisode) => (
                <a
                  key={relatedEpisode.id}
                  href={`/website/podcast/${relatedEpisode.title.toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/--+/g, '-')}`}
                  className="block group"
                >
                  <article
                    className="bg-black/30 rounded-xl overflow-hidden transition-all duration-300 relative hover:-translate-y-1 hover:translate-x-1 hover:shadow-[10px_10px_0px_0px_rgba(67,205,102,0.8)]"
                    style={{
                      borderRadius: '13.632px',
                      border: '1px solid #D8F4CC',
                    }}
                  >
                    {/* Episode Image */}
                    <div className="relative h-48">
                      <Image
                        src={relatedEpisode.image}
                        alt={relatedEpisode.title}
                        fill
                        className="object-cover group-hover:opacity-80 transition-opacity duration-300 p-4"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{
                          borderRadius: '25px',
                        }}
                      />
                    </div>

                    {/* Episode Details */}
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-white mb-2 line-clamp-2">
                        {relatedEpisode.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-400">
                        <span>{new Date(relatedEpisode.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        <span className="mx-2">•</span>
                        <span>{relatedEpisode.duration}</span>
                      </div>
                    </div>
                  </article>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <TestimonialsSection />
    </div>
  );
}
