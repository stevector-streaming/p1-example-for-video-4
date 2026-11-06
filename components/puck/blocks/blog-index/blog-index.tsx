"use client";

import { useState } from "react";
import { TextLink } from "@/lib/btn";
import { Section, SectionHead } from "@/lib/section";
import { FallbackImg } from "@/lib/img";
import { P1_FALLBACKS } from "@/lib/assets";
import "./blog-index.css";

type Toggle = "off" | "on";
export interface BlogIndexPost {
  image: string;
  title: string;
  category: string;
  excerpt: string;
  meta: string;
  href?: string;
}
export interface BlogIndexProps {
  eyebrow: string;
  heading: string;
  posts: BlogIndexPost[];
  layout?: "card grid" | "editorial list" | "featured + grid" | "magazine";
  cover?: Toggle;
  excerpt?: Toggle;
  category?: Toggle;
  meta?: Toggle;
  pagination?: "numbered" | "load more" | "none";
  pageSize?: number;
  tone?: "light" | "gray";
  width?: "contained" | "full bleed";
  puck?: { isEditing?: boolean };
}

const DEFAULT_PAGE_SIZE = 3;

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function BlogIndexRender({
  eyebrow,
  heading,
  posts,
  layout = "card grid",
  cover = "on",
  excerpt = "on",
  category = "on",
  meta = "on",
  pagination = "numbered",
  pageSize,
  tone = "light",
  width = "contained",
  puck,
}: BlogIndexProps) {
  const list = posts || [];
  const [page, setPage] = useState(1);
  // Pages saved before this field existed have no size and keep showing every post. A size that is
  // set but unusable (zero, negative, not a number) falls back to the default rather than showing nothing.
  const unset = pageSize === undefined || pageSize === null || String(pageSize).trim() === "";
  const size = unset ? Math.max(1, list.length) : Number(pageSize) >= 1 ? Math.floor(Number(pageSize)) : DEFAULT_PAGE_SIZE;
  // The Load more count belongs to the size and mode it was made for. Changing either starts again from one
  // page, even if the old values come back later, so it is reset while rendering rather than only ignored.
  const loadKey = `${size}|${pagination}`;
  const [loaded, setLoaded] = useState({ key: loadKey, clicks: 0 });
  if (loaded.key !== loadKey) setLoaded({ key: loadKey, clicks: 0 });
  const clicks = loaded.key === loadKey ? loaded.clicks : 0;
  const pageCount = Math.max(1, Math.ceil(list.length / size));
  // Derived, so removing posts in the editor can never leave an empty page behind.
  const current = Math.min(page, pageCount);
  const editing = Boolean(puck?.isEditing);
  const paged = pagination !== "none" && !editing;
  const first = pagination === "load more" ? 0 : (current - 1) * size;
  const last = pagination === "load more" ? size * (1 + clicks) : current * size;
  const hasMore = pagination === "load more" ? last < list.length : false;
  const showPager = pagination === "numbered" ? pageCount > 1 : hasMore;
  return (
    <Section tone={tone} width={width} className="p1-blog-index p1-block">
      <div className="p1-blog-index__root" data-layout={slug(layout)}>
        <SectionHead eyebrow={eyebrow} heading={heading} align="left" />
        <div className="p1-blog-index__posts">
          {/* Every post is rendered so crawlers and no-JS visitors get all links; off-page ones are hidden. */}
          {list.map((post, i) => (
            <article
              key={i}
              className="p1-blog-index__post"
              data-lead={(i === 0 && first === 0) || undefined}
              hidden={(paged && (i < first || i >= last)) || undefined}
            >
              {cover === "on" && (
                <div className="p1-blog-index__cover">
                  <FallbackImg src={post.image} fallback={P1_FALLBACKS.LANDSCAPE} alt="" className="p1-blog-index__img" />
                </div>
              )}
              <div className="p1-blog-index__body">
                {category === "on" && post.category && <p className="p1-blog-index__category">{post.category}</p>}
                <h3 className="p1-blog-index__title"><TextLink href={post.href}>{post.title}</TextLink></h3>
                {excerpt === "on" && post.excerpt && <p className="p1-blog-index__excerpt">{post.excerpt}</p>}
                {meta === "on" && post.meta && <p className="p1-blog-index__meta">{post.meta}</p>}
              </div>
            </article>
          ))}
        </div>
        {pagination !== "none" && (editing ? list.length > size : showPager) && (
          <nav className="p1-blog-index__pager" aria-label="Pagination">
            {pagination === "numbered" ? (
              Array.from({ length: pageCount }, (_, i) => i + 1).map((n) =>
                editing ? (
                  <span key={n} className="p1-blog-index__page" data-current={n === 1 || undefined}>{n}</span>
                ) : (
                  <button
                    key={n}
                    type="button"
                    className="p1-blog-index__page"
                    aria-label={`Page ${n}`}
                    aria-current={n === current ? "page" : undefined}
                    data-current={n === current || undefined}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ),
              )
            ) : editing ? (
              <span className="p1-blog-index__more">Load more</span>
            ) : (
              <button type="button" className="p1-blog-index__more" onClick={() => setLoaded({ key: loadKey, clicks: clicks + 1 })}>Load more</button>
            )}
          </nav>
        )}
      </div>
    </Section>
  );
}
