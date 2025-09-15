"use client";

import { useState } from "react";

import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

import { Button } from "@/src/components/ui/button";

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
  canLoadMoreEpisodes = false,
}: TranscriptSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Split transcript into lines for better processing
  const transcriptLines = transcript.split("\n").filter((line) => line.trim());
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
          <div className="mb-2 flex items-baseline gap-3">
            <span className="text-lg font-bold text-gray-900">{speaker}:</span>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-sm font-medium text-gray-500">
              {timestamp}
            </span>
          </div>
          {content && (
            <p className="ml-4 text-base leading-relaxed text-gray-700">
              {content}
            </p>
          )}
        </div>
      );
    }

    // If it's a continuation line (no speaker), treat as dialogue
    if (line.trim()) {
      return (
        <p
          key={index}
          className="mb-4 ml-4 text-base leading-relaxed text-gray-700"
        >
          {line}
        </p>
      );
    }

    return null;
  };

  return (
    <section className="relative overflow-hidden bg-[#0A1F17] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Full Transcript
          </h2>
          <p className="mx-auto max-w-3xl text-gray-300">
            Read the full conversation between our host and guest.
          </p>
        </div>

        <div className="mx-auto max-w-5xl rounded-2xl border border-[#D8F4CC]/20 bg-white p-8 shadow-2xl backdrop-blur-md md:p-12">
          <div className="max-w-none">
            <div className="space-y-2">
              {displayLines.map((line, index) =>
                formatTranscriptLine(line, index)
              )}
              {!isExpanded && hasMore && (
                <div className="py-4 text-center">
                  <span className="font-medium text-gray-400">...</span>
                </div>
              )}
            </div>

            {hasMore && (
              <div className="mt-8 border-t border-gray-200 pt-8 text-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-[#43CD66] bg-transparent px-8 py-3 font-semibold text-[#43CD66] transition-all duration-300 hover:bg-[#43CD66] hover:text-white"
                  onClick={toggleExpand}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {isExpanded ? "Show Less" : "Read Full Transcript"}
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
          <div className="mt-12 text-center">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-[#D8F4CC] bg-transparent px-8 py-3 font-semibold text-[#D8F4CC] transition-all duration-300 hover:bg-[#D8F4CC] hover:text-[#0A1F17]"
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
