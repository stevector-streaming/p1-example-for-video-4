import type { ComponentConfig } from "@puckeditor/core";
import { defineMeta } from '@/lib/define-meta';
import { TopicRailRender, type TopicRailProps, type Topic, type TopicFilter } from "./topic-rail";
import { SAMPLE_FILTERS } from "./topic-rail.data";
export type { TopicRailProps, Topic, TopicFilter };

const toggle = {
  type: "radio" as const,
  options: [
    { label: "Off", value: "off" },
    { label: "On", value: "on" },
  ],
};

export const TopicRailBlock: ComponentConfig<TopicRailProps> = {
  fields: {
    topics: {
      type: "array" as const,
      arrayFields: {
        label: {
          type: "text" as const,
          contentEditable: true,
          visible: false,
          ai: { instructions: "Topic name. 1–3 words. E.g. Engineering." },
        },
        count: {
          type: "text" as const,
          contentEditable: true,
          visible: false,
          ai: { instructions: "Number of posts under the topic. Digits only. E.g. 42." },
        },
        tags: {
          type: "text" as const,
          label: "Extra filter tags (comma-separated, mega filter layout)",
          ai: { instructions: "Names of the extra filters this topic belongs to, comma-separated, matching the filter labels. E.g. Guide, Developers." },
        },
      },
      defaultItemProps: { label: "Topic", count: "0", tags: "" },
      getItemSummary: (item: Topic) => item.label || "Topic",
    },
    filters: {
      type: "array" as const,
      label: "Extra filters (mega filter layout)",
      arrayFields: {
        group: {
          type: "text" as const,
          contentEditable: true,
          visible: false,
          ai: { instructions: "Column heading the filter sits under. 1–2 words. E.g. Format." },
        },
        label: {
          type: "text" as const,
          contentEditable: true,
          visible: false,
          ai: { instructions: "Filter name. 1–3 words. E.g. Case study." },
        },
        count: {
          type: "text" as const,
          contentEditable: true,
          visible: false,
          ai: { instructions: "Number of posts matching the filter. Digits only. E.g. 28." },
        },
      },
      defaultItemProps: { group: "Format", label: "Filter", count: "0" },
      getItemSummary: (item: TopicFilter) => `${item.group || "Group"}: ${item.label || "Filter"}`,
    },
    layout: {
      type: "select" as const,
      options: [
        { label: "Chip row", value: "chip row" },
        { label: "Sidebar list", value: "sidebar list" },
        { label: "Tag cloud", value: "tag cloud" },
        { label: "Mega filter", value: "mega filter" },
      ],
    },
    counts: toggle,
    search: toggle,
    sort: {
      type: "select" as const,
      options: [
        { label: "Newest", value: "Newest" },
        { label: "Popular", value: "Popular" },
        { label: "A–Z", value: "A–Z" },
      ],
    },
    tone: {
      type: "select" as const,
      options: [
        { label: "Light", value: "light" },
        { label: "Gray", value: "gray" },
      ],
    },
    width: {
      type: "select" as const,
      options: [
        { label: "Contained", value: "contained" },
        { label: "Full bleed", value: "full bleed" },
      ],
    },
  },
  defaultProps: {
    topics: [
      { label: "All", count: "128", tags: "" },
      { label: "Engineering", count: "42", tags: "Article, Guide, Developers" },
      { label: "Workflow", count: "31", tags: "Guide, Developers, Agencies" },
      { label: "Performance", count: "24", tags: "Article, Developers, Marketers" },
      { label: "Security", count: "18", tags: "Article, Case study, Developers" },
      { label: "Customer stories", count: "13", tags: "Case study, Video, Marketers, Agencies" },
    ],
    filters: SAMPLE_FILTERS,
    layout: "chip row",
    counts: "on",
    search: "on",
    sort: "Newest",
    tone: "light",
    width: "contained",
  },
  render: TopicRailRender,
};

export const meta = defineMeta({
  title: 'Topic rail',
  description: 'Topic filter for a blog or resource index as a chip row, sidebar list, tag cloud or mega filter panel, with optional counts, search box and sort menu; topics can be searched, selected and sorted on the page.',
  categories: ["listings"],
  published: true,
  registryDependencies: ["@p1/tokens","@p1/internal-section","@p1/internal-btn","@p1/internal-icons","@p1/internal-text"],
});
