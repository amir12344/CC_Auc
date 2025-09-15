"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Search } from "lucide-react";

/**
 * Search Bar Component
 * Used in both desktop and mobile layouts with form submission and autocomplete support
 */
const SearchBar = () => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  // Removed custom suggestion overlay; rely on native browser history/autocomplete

  return (
    <div className="relative">
      {/* Enable native browser autocomplete/history */}
      <form onSubmit={handleSubmit} className="relative" autoComplete="on">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-neutral-400" />
        </div>
        <input
          type="search"
          value={query}
          onChange={handleInputChange}
          name="q"
          placeholder="Search brands or products"
          className="w-full rounded-full border border-neutral-300 bg-white py-2 pr-4 pl-10 text-black placeholder-neutral-400 focus:ring-2 focus:ring-black focus:outline-hidden"
          spellCheck={false}
          autoComplete="on"
          enterKeyHint="search"
        />
      </form>
    </div>
  );
};

export default SearchBar;
