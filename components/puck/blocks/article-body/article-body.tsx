"use client";

import { useEffect, useId, useRef, useState } from "react";
import { RichValue, richHeadings, tocSlug } from "@/lib/rich";
import { textOf } from "@/lib/text";
import { Section } from "@/lib/section";
import { ShareIcon } from "@/lib/share-icon";
import { FallbackImg } from "@/lib/img";
import "./article-body.css";

export interface ArticleBodyProps {
  lead: string;
  heading: string;
  body: string;
  pull: string;
  caption: string;
  image: string;
  code: string;
  width: "narrow" | "wide";
  toc: { label: string }[];
  sidebar: "none" | "TOC" | "share";
  dropCap: "off" | "on";
  font: "sans" | "serif";
  tone: "light" | "gray";
  shareLinkHref?: string;
  shareMailHref?: string;
  shareExternalHref?: string;
  puck?: { isEditing?: boolean };
}

export function ArticleBodyRender({ lead, heading, body, pull, caption, image, code, toc, width, sidebar, dropCap, font, tone, shareLinkHref, shareMailHref, shareExternalHref, puck }: ArticleBodyProps) {
  const withToc = sidebar === "TOC";
  // Per instance, so two articles on one page never share an anchor id.
  const prefix = `toc-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  // The ids a table of contents entry can point at: the block's own heading, then the body headings.
  // An entry links only when its text matches one of them (an author types the same words in both).
  const own = withToc ? tocSlug(textOf(heading)) : "";
  const reserved = own ? [`${prefix}-${own}`] : [];
  const headings = withToc ? richHeadings(body, prefix, reserved) : null;
  // A published page hands the body over as rendered content, not a string, so its headings are read
  // from the page after it mounts and given ids there.
  const isEditing = puck?.isEditing;
  const bodyRef = useRef<HTMLDivElement>(null);
  const [domIds, setDomIds] = useState<string[]>([]);
  useEffect(() => {
    if (!withToc || typeof body === "string" || isEditing) return setDomIds((prev) => (prev.length ? [] : prev));
    const taken = new Set(own ? [`${prefix}-${own}`] : []);
    const ids: string[] = [];
    bodyRef.current?.querySelectorAll("h2, h3").forEach((el) => {
      const slug = tocSlug(el.textContent ?? "");
      if (!slug) return;
      let id = `${prefix}-${slug}`;
      for (let n = 2; taken.has(id); n++) id = `${prefix}-${slug}-${n}`;
      taken.add(id);
      el.id = id;
      ids.push(id);
    });
    setDomIds((prev) => (prev.join() === ids.join() ? prev : ids));
  }, [body, withToc, isEditing, own, prefix]);
  const anchors = new Set([...reserved, ...(headings?.ids ?? domIds)]);
  return (
    <Section tone={tone}>
      <div className="p1-article-body" data-width={width} data-sidebar={sidebar} data-font={font} data-dropcap={dropCap}>
        <div className="p1-article-body__main">
          <div className="p1-article-body__lead">
            <RichValue value={lead} />
          </div>
          {heading && <h2 className="p1-article-body__heading" id={own ? `${prefix}-${own}` : undefined}>{heading}</h2>}
          <div ref={bodyRef} className="p1-article-body__body">
            <RichValue value={body} headings={headings} />
          </div>
          {image || caption ? (
            <figure className="p1-article-body__figure">
              {image ? (
                <FallbackImg src={image} alt="" className="p1-article-body__figure-art" />
              ) : (
                <div className="p1-article-body__figure-art" aria-hidden="true" />
              )}
              {caption ? <figcaption className="p1-article-body__caption">{caption}</figcaption> : null}
            </figure>
          ) : null}
          {pull ? <blockquote className="p1-article-body__pull">{pull}</blockquote> : null}
          {code ? (
            <pre className="p1-article-body__code">
              <code>{code}</code>
            </pre>
          ) : null}
        </div>
        {sidebar !== "none" ? (
          <aside className="p1-article-body__side">
            <p className="p1-article-body__side-title">{sidebar === "TOC" ? "On this page" : "Share"}</p>
            {sidebar === "TOC" ? (
              <ul className="p1-article-body__toc">
                {(toc || []).filter((t) => t.label).map((t, i) => {
                  const id = `${prefix}-${tocSlug(textOf(t.label))}`;
                  // In the editor the label is edited in place, and a link around it would get in the way.
                  return <li key={i}>{!puck?.isEditing && anchors.has(id) ? <a href={`#${id}`}>{t.label}</a> : t.label}</li>;
                })}
              </ul>
            ) : (
              <div className="p1-article-body__share">
                <ShareIcon name="link" href={shareLinkHref} label="Share link" className="p1-article-body__share-link" />
                <ShareIcon name="mail" href={shareMailHref} label="Share by email" className="p1-article-body__share-link" />
                <ShareIcon name="external" href={shareExternalHref} label="Share elsewhere" className="p1-article-body__share-link" />
              </div>
            )}
          </aside>
        ) : null}
      </div>
    </Section>
  );
}
