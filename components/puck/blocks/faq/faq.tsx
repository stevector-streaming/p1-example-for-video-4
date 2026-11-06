"use client";

import { useState } from "react";
import { Btn } from "@/lib/btn";
import { Icon } from "@/lib/icons";
import { matchesQuery } from "@/lib/text";
import "./faq.css";

export interface FaqItem {
  q: string;
  a: string;
  category?: string;
}
export interface FaqProps {
  heading: string;
  items: FaqItem[];
  layout?: "accordion" | "2-col" | "with search";
  categories?: "off" | "on";
  first?: "off" | "on";
  contact?: "off" | "on";
  contactTitle?: string;
  contactText?: string;
  contactLabel?: string;
  contactHref?: string;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function FaqRender({ heading, items, layout = "accordion", categories = "off", first = "off", contact = "off", contactTitle = "Still have questions?", contactText = "", contactLabel = "Contact us", contactHref }: FaqProps) {
  const list = items || [];
  const cats = [...new Set(list.map((i) => (i.category ?? "").trim()).filter(Boolean))];
  const chips = [...new Set(["All", ...cats])];
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState("All");
  // A control only filters while it is on screen; a chip whose category was edited away falls back to All.
  const q = layout === "with search" ? query : "";
  const category = categories === "on" && chips.includes(picked) ? picked : "All";
  const shown = list
    .map((item, i) => [item, i] as const)
    .filter(([item]) => matchesQuery(q, item.q, item.a) && (category === "All" || (item.category ?? "").trim() === category));
  const empty = (!!q.trim() || category !== "All") && shown.length === 0 && list.length > 0;
  // Every answer shows by default; "first" collapses the rest so only the first one on screen is open.
  const isOpen = (pos: number) => layout === "2-col" || first !== "on" || pos === 0;
  return (
    <div className="p1-faq p1-block" data-layout={slug(layout)} data-collapsing={layout !== "2-col" && first === "on" ? "true" : undefined}>
      <div className="p1-faq__inner">
        {heading && <h2 className="p1-faq__heading">{heading}</h2>}
        {layout === "with search" && (
          <label className="p1-faq__search">
            <Icon name="search" className="p1-faq__search-icon" />
            <input
              className="p1-faq__search-input"
              type="search"
              aria-label="Search questions"
              placeholder="Search questions"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        )}
        {categories === "on" && (
          <div className="p1-faq__chips">
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                className="p1-faq__chip"
                aria-pressed={c === category}
                data-active={c === category ? "true" : undefined}
                onClick={() => setPicked(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <div className="p1-faq__list">
          {empty && <p className="p1-faq__empty">No matches</p>}
          {shown.map(([item, i], pos) => (
            <details key={i} className="p1-faq__item" open={isOpen(pos)}>
              <summary className="p1-faq__question-row">
                <h3 className="p1-faq__question">{item.q}</h3>
                <Icon name="plus" className="p1-faq__icon" />
              </summary>
              <p className="p1-faq__answer">{item.a}</p>
            </details>
          ))}
        </div>
        {contact === "on" && (
          <div className="p1-faq__contact">
            <div>
              {contactTitle && <h3 className="p1-faq__contact-title">{contactTitle}</h3>}
              {contactText && <p className="p1-faq__contact-text">{contactText}</p>}
            </div>
            {contactLabel && contactHref && <Btn href={contactHref}>{contactLabel}</Btn>}
          </div>
        )}
      </div>
    </div>
  );
}
