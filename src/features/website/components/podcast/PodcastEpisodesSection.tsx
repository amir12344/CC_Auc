'use client';

import Link from 'next/link';
import { Download, Forward, Play, Rewind, Share2 } from 'lucide-react';

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
      title: 'What is ReCommerce?',
      date: 'May 29 2025',
      image:
        '/images/podcast/Episode_1.webp',
      number: '01',
      duration: '18:35',
      guest: 'Shivang Maheshwari & Cat La',
    },
  ]

  return (
    <section className='py-24 bg-[#102D21]' id='episodes'>
      <div className='max-w-7xl mx-auto px-4'>
        <h2 className='text-center text-4xl font-bold text-white mb-16'>
          Start Listening Today
        </h2>
        <div className='flex flex-wrap justify-center gap-8'>
          {episodes.map((episode) => {
            const slug = episode.title
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/--+/g, '-');

            return (
              <Link
                href={`/website/podcast/${slug}`}
                key={episode.id}
                className='block group'
              >
                <article
                  className='bg-black rounded-xl overflow-hidden transition-all duration-300 relative hover:-translate-y-1 hover:translate-x-1 hover:shadow-[10px_10px_0px_0px_rgba(67,205,102,0.8)] w-80'
                  style={{
                    borderRadius: '13.632px',
                    border: '1px solid #D8F4CC',
                  }}
                >
                  {/* Episode Image */}
                  <div className='relative'>
                    <img
                      src={episode.image}
                      alt={episode.title}
                      className='w-full h-full object-cover p-6 duration-300'
                      style={{
                        borderRadius: '35px',
                      }}
                    />
                  </div>

                  {/* Episode Details */}
                  <div className='p-6'>
                    <h3 className='text-lg font-[500] text-white mb-2 line-clamp-2'>
                      {episode.title}
                    </h3>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  )
};

export default PodcastEpisodesSection;