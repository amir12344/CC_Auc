import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { PreferenceSectionData } from "../services/preferenceSectionService";

interface CacheEntry {
  sections: PreferenceSectionData[];
  fetchedAt: number;
}

interface SectionsCacheState {
  entries: Record<string, CacheEntry>;
  ttlMs: number;
}

const initialState: SectionsCacheState = {
  entries: {},
  ttlMs: 10 * 60 * 1000,
};

const sectionsCacheSlice = createSlice({
  name: "sectionsCache",
  initialState,
  reducers: {
    setSectionsCacheEntry(
      state,
      action: PayloadAction<{
        key: string;
        sections: PreferenceSectionData[];
        fetchedAt?: number;
      }>
    ) {
      const { key, sections, fetchedAt } = action.payload;
      state.entries[key] = { sections, fetchedAt: fetchedAt ?? Date.now() };
    },
    clearSectionsCache(state) {
      state.entries = {};
    },
  },
});

export const { setSectionsCacheEntry, clearSectionsCache } =
  sectionsCacheSlice.actions;
export default sectionsCacheSlice.reducer;
