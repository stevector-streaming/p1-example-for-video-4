"use client";

import { useState } from "react";
import { TextLink } from "@/lib/btn";
import { Section, SectionHead } from "@/lib/section";
import { Icon } from "@/lib/icons";
import { distinct, matchesQuery, textOf } from "@/lib/text";
import "./integrations.css";

export interface IntegrationItem {
  name: string;
  category: string;
  href?: string;
}
export interface IntegrationsProps {
  eyebrow: string;
  heading: string;
  subtitle: string;
  items: IntegrationItem[];
  layout?: "grid" | "with filters" | "logo cluster";
  search?: "off" | "on";
  categories?: "off" | "on";
  cols?: "4" | "5" | "6";
  tone?: "light" | "gray" | "dark";
  width?: "contained" | "full bleed";
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function IntegrationsRender({
  eyebrow,
  heading,
  subtitle,
  items,
  layout = "with filters",
  search = "on",
  categories = "on",
  cols = "5",
  tone = "light",
  width = "contained",
}: IntegrationsProps) {
  const list = items || [];
  const cats = [...new Set(["All", ...distinct(list.map((i) => i.category))])];
  const showSearch = search === "on";
  const showCats = categories === "on";
  const filters = layout === "with filters" && (showSearch || showCats);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState("All");
  // A control only filters while it is on screen; a chip whose category was edited away falls back to All.
  const q = filters && showSearch ? query : "";
  const category = filters && showCats && cats.includes(picked) ? picked : "All";
  const filtering = !!q.trim() || category !== "All";
  const shown = list.filter(
    (it) => matchesQuery(q, it.name, it.category) && (category === "All" || textOf(it.category).trim() === category),
  );
  const empty = filtering && shown.length === 0 ? <p className="p1-integrations__empty">No matches</p> : null;
  return (
    <Section tone={tone} width={width} className="p1-integrations p1-block">
      <div className="p1-integrations__root" data-layout={slug(layout)} style={{ "--cols": Number(cols) || 5 } as React.CSSProperties}>
        <SectionHead eyebrow={eyebrow} heading={heading} subtitle={subtitle} />
        {filters && (
          <div className="p1-integrations__filters">
            {showSearch && (
              <label className="p1-integrations__search">
                <Icon name="search" />
                <input
                  className="p1-integrations__search-input"
                  type="search"
                  aria-label="Search integrations"
                  placeholder="Search integrations"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            )}
            {showCats &&
              cats.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="p1-sec-pill p1-integrations__chip"
                  aria-pressed={c === category}
                  data-active={c === category ? "true" : undefined}
                  onClick={() => setPicked(c)}
                >
                  {c}
                </button>
              ))}
          </div>
        )}
        {empty ? empty : layout === "logo cluster" ? (
          <ul className="p1-integrations__cluster">
            {shown.map((it, i) => (
              <li key={i} className="p1-integrations__logo"><TextLink href={it.href}>{it.name}</TextLink></li>
            ))}
          </ul>
        ) : (
          <ul className="p1-sec-grid p1-integrations__grid">
            {shown.map((it, i) => (
              <li key={i} className="p1-sec-card p1-integrations__card">
                <span className="p1-integrations__mark" aria-hidden="true">{textOf(it.name).charAt(0) || "?"}</span>
                <span className="p1-integrations__name"><TextLink href={it.href}>{it.name}</TextLink></span>
                <span className="p1-integrations__cat">{it.category}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}
