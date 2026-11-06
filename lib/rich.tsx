import * as React from "react";
import "./rich.css";
import { sanitizeRichtextHtml } from "@pantheon-systems/puck-css/sanitize-richtext";

/**
 * Renders the value of a Puck `richtext` field.
 *
 * A `richtext` field's value reaches `render` in one of two shapes:
 *   1. A stored **HTML string** — when the page is published or first mounts.
 *   2. A live **ReactNode** — while being edited inline on the Puck canvas.
 *
 * Strings are sanitized before rendering; ReactNodes pass through unchanged.
 */
export interface RichValueProps {
  value: unknown;
  className?: string;
  /** The result of `richHeadings` for this same value. Render it as-is instead of sanitizing again. */
  headings?: RichHeadings | null;
}

/** Sanitized HTML with heading ids added, and the ids that were added. */
type RichHeadings = { html: string; ids: string[] };

/** Removes tags until none are left, so a tag split by another one (`<scr<b>ipt>`) cannot reassemble. */
function stripTags(html: string): string {
  let text = html;
  for (let prev = ""; prev !== text; ) {
    prev = text;
    text = text.replace(/<[^>]*>/g, "");
  }
  return text.replace(/[<>]/g, "");
}

/** The part of a heading's text an anchor id is made from: letters, digits and single dashes. */
export function tocSlug(text: string): string {
  return text.toLowerCase().replace(/&[a-z0-9#]+;/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Adds `id="<prefix>-<slug>"` to each `<h2>` and `<h3>` of already-sanitized HTML. The sanitizer drops every
 * authored id, so ids are added here, after it, and only from the heading's own text. A repeated
 * heading gets -2, -3, and a heading with no letters or digits gets none.
 */
function addHeadingIds(safeHtml: string, prefix: string, reserved: string[] = []): RichHeadings {
  const taken = new Set(reserved);
  const ids: string[] = [];
  const out = safeHtml.replace(/<(h[23])>([\s\S]*?)<\/\1>/g, (whole, tag: string, inner: string) => {
    const headingText =
      typeof DOMParser !== "undefined"
        ? new DOMParser().parseFromString(inner, "text/html").body.textContent ?? ""
        : stripTags(inner);
    const slug = tocSlug(headingText);
    if (!slug) return whole;
    let id = `${prefix}-${slug}`;
    for (let n = 2; taken.has(id); n++) id = `${prefix}-${slug}-${n}`;
    taken.add(id);
    ids.push(id);
    return `<${tag} id="${id}">${inner}</${tag}>`;
  });
  return { html: out, ids };
}

/** @deprecated Use `p1-rich` className directly. Removed when accordion/rich-text/tabs convert. */
export const RICH_PROSE = "p1-rich";

/**
 * Sanitizes a string value and gives its h2 and h3 headings ids (`<prefix>-<slug>`), once. Pass the result to
 * `RichValue` as `headings` and read `ids` for the links that can work. `reserved` lists ids already used
 * elsewhere in the block, so a repeated heading gets a different one. Anything but a string gives null.
 */
export function richHeadings(value: unknown, prefix: string, reserved: string[] = []) {
  return typeof value === "string" ? addHeadingIds(sanitizeRichtextHtml(value), prefix, reserved) : null;
}

export function RichValue({ value, className, headings }: RichValueProps) {
  const cls = ["p1-rich", className].filter(Boolean).join(" ");
  if (value == null || value === "") return null;
  if (typeof value === "string") {
    return <div className={cls} dangerouslySetInnerHTML={{ __html: headings ? headings.html : sanitizeRichtextHtml(value) }} />;
  }
  return <div className={cls}>{value as React.ReactNode}</div>;
}
