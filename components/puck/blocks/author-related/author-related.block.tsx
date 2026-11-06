import type { ComponentConfig } from "@puckeditor/core";
import { defineMeta } from "@/lib/define-meta";
import { P1_ASSETS } from "@/lib/assets";
import { AuthorRelatedRender, type AuthorRelatedProps, type RelatedPost } from "./author-related";
export type { AuthorRelatedProps, RelatedPost };

const post = (title: string, category: string, meta: string, image: string): RelatedPost => ({ image, title, category, meta });

export const AuthorRelatedBlock: ComponentConfig<AuthorRelatedProps> = {
  fields: {
    author: {
      type: "text" as const,
      contentEditable: true,
      visible: false,
      ai: { instructions: "Author full name. E.g. Dana Whitfield." },
    },
    bio: {
      type: "text" as const,
      contentEditable: true,
      visible: false,
      ai: { instructions: "One or two sentences about the author." },
    },
    authorBlock: {
      type: "radio" as const,
      options: [
        { label: "Off", value: "off" },
        { label: "On", value: "on" },
      ],
    },
    related: {
      type: "select" as const,
      options: [
        { label: "Grid", value: "grid" },
        { label: "List", value: "list" },
        { label: "None", value: "none" },
      ],
    },
    posts: {
      type: "array" as const,
      arrayFields: {
        image: { type: "text" as const, ai: { exclude: true } },
        title: {
          type: "text" as const,
          contentEditable: true,
          visible: false,
          ai: { instructions: "Post title. Under 12 words." },
        },
        category: {
          type: "text" as const,
          contentEditable: true,
          visible: false,
          ai: { instructions: "Short category label. E.g. Engineering." },
        },
        meta: {
          type: "text" as const,
          contentEditable: true,
          visible: false,
          ai: { instructions: "Date and read time. E.g. Sep 4, 2026 · 5 min read." },
        },
        href: { type: "text" as const, label: "Post link", ai: { exclude: true } },
      },
      defaultItemProps: { image: "", title: "Post title", category: "Category", meta: "", href: "" },
      getItemSummary: (item: RelatedPost) => item.title || "Post",
    },
    newsletter: {
      type: "radio" as const,
      options: [
        { label: "Off", value: "off" },
        { label: "On", value: "on" },
      ],
    },
    actionHref: {
      type: "text" as const,
      label: "Newsletter form action URL (set this to send)",
      ai: { exclude: true },
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
    author: "Dana Whitfield",
    bio: "Dana leads digital at Northwind and writes about decoupled architecture and editorial workflow.",
    authorBlock: "on",
    related: "grid",
    posts: [
      post("Why every branch deserves its own environment", "Workflow", "Sep 4, 2026 · 5 min read", P1_ASSETS.PHOTO_TABLE),
      post("Cache invalidation without the dread", "Performance", "Aug 27, 2026 · 6 min read", P1_ASSETS.PHOTO_SKYLINE),
      post("Audit logs your security team will actually read", "Security", "Aug 19, 2026 · 7 min read", P1_ASSETS.PHOTO_FOOD),
    ],
    newsletter: "on",
    actionHref: "",
    tone: "light",
    width: "contained",
  },
  render: AuthorRelatedRender,
};

export const meta = defineMeta({
  title: "Author and Related Posts",
  description: "Author card, a grid or list of related posts, and a newsletter sign-up form that posts to its Form action URL when one is set; use at the end of an article.",
  categories: ["editorial"],
  published: true,
  registryDependencies: ["@p1/tokens", "@p1/internal-section", "@p1/internal-btn", "@p1/internal-img", "@p1/internal-text", "@p1/internal-safe-url"],
});
