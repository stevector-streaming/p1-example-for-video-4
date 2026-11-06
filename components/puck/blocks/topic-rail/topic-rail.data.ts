import type { TopicFilter } from "./topic-rail";

// Plain data, kept out of the "use client" render file so the server block config gets the real array.
// Starter columns for the mega filter; also what a page saved before `filters` existed shows.
export const SAMPLE_FILTERS: TopicFilter[] = [
  { group: "Format", label: "Article", count: "64" },
  { group: "Format", label: "Guide", count: "28" },
  { group: "Format", label: "Case study", count: "13" },
  { group: "Format", label: "Video", count: "23" },
  { group: "Audience", label: "Developers", count: "71" },
  { group: "Audience", label: "Marketers", count: "34" },
  { group: "Audience", label: "Agencies", count: "23" },
];
