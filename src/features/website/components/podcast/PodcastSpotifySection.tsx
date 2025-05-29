'use client';

interface PodcastSpotifySectionProps {
 spotifyUrl?: string;
 episodeTitle?: string;
}

export const PodcastSpotifySection = ({ spotifyUrl, episodeTitle }: PodcastSpotifySectionProps) => {
 if (!spotifyUrl) {
  return null; // Don't render anything if the URL isn't provided
 }

 // Convert standard Spotify episode URL to embed URL
 const embedUrl = spotifyUrl.replace('/episode/', '/embed/episode/') + '?utm_source=generator&theme=0'; // Dark theme

 return (
  <section className="py-12 bg-[#43CD66] shadow-none"> {/* Distinct background color */}
   <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-2xl md:text-3xl font-bold text-[#0A1F17] text-center mb-8">
     Listen on Spotify
    </h2>
    <div className="rounded-xl overflow-hidden">
     <iframe
      style={{ borderRadius: '12px' }}
      src={embedUrl}
      width="100%"
      height="300"
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      title={`Spotify Embed: ${episodeTitle || 'Podcast Episode'}`}
     ></iframe>
    </div>
   </div>
  </section>
 );
};

export default PodcastSpotifySection;
