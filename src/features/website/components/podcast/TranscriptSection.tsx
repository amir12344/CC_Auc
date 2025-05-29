'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface TranscriptSectionProps {
  transcript: string;
  isLoading?: boolean;
  onLoadMore?: () => void;
  canLoadMoreEpisodes?: boolean;
}

export function TranscriptSection({
  transcript,
  isLoading = false,
  onLoadMore,
  canLoadMoreEpisodes = false
}: TranscriptSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Split transcript into lines for better processing
  const transcriptLines = transcript.split('\n').filter(line => line.trim());
  const previewLines = transcriptLines.slice(0, 5); // Show first 10 lines in preview
  const hasMore = transcriptLines.length > 5;

  const displayLines = isExpanded ? transcriptLines : previewLines;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLoadMore = () => {
    if (onLoadMore) {
      onLoadMore();
    }
  };

  // Function to format individual lines with better typography
  const formatTranscriptLine = (line: string, index: number) => {
    // Check if line contains speaker name with timestamp pattern (e.g., "Jared Ward: 0:06")
    const speakerMatch = line.match(/^([^:]+):\s*(\d+:\d+)\s*(.*)$/);

    if (speakerMatch) {
      const [, speaker, timestamp, content] = speakerMatch;
      return (
        <div key={index} className="mb-6">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="font-bold text-lg text-gray-900">{speaker}:</span>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {timestamp}
            </span>
          </div>
          {content && (
            <p className="text-gray-700 leading-relaxed ml-4 text-base">
              {content}
            </p>
          )}
        </div>
      );
    }

    // If it's a continuation line (no speaker), treat as dialogue
    if (line.trim()) {
      return (
        <p key={index} className="text-gray-700 leading-relaxed ml-4 mb-4 text-base">
          {line}
        </p>
      );
    }

    return null;
  };

  return (
    <section className="py-12 bg-[#0A1F17] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Full Transcript</h2>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Read the full conversation between our host and guest.
          </p>
        </div>

        <div className="bg-white backdrop-blur-md rounded-2xl p-8 md:p-12 border border-[#D8F4CC]/20 max-w-5xl mx-auto shadow-2xl">
          <div className="max-w-none">
            <div className="space-y-2">
              {displayLines.map((line, index) => formatTranscriptLine(line, index))}
              {!isExpanded && hasMore && (
                <div className="text-center py-4">
                  <span className="text-gray-400 font-medium">...</span>
                </div>
              )}
            </div>

            {hasMore && (
              <div className="mt-8 text-center border-t border-gray-200 pt-8">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-2 border-[#43CD66] text-[#43CD66] hover:bg-[#43CD66] hover:text-white transition-all duration-300 font-semibold px-8 py-3"
                  onClick={toggleExpand}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <>
                      {isExpanded ? 'Show Less' : 'Read Full Transcript'}
                      {isExpanded ? (
                        <ChevronUp className="ml-2 h-5 w-5" />
                      ) : (
                        <ChevronDown className="ml-2 h-5 w-5" />
                      )}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Load More Episodes Button */}
        {canLoadMoreEpisodes && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent border-2 border-[#D8F4CC] text-[#D8F4CC] hover:bg-[#D8F4CC] hover:text-[#0A1F17] transition-all duration-300 font-semibold px-8 py-3"
              onClick={handleLoadMore}
            >
              Load More Episodes
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default TranscriptSection;
