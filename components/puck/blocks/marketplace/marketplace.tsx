"use client";

import { useState } from "react";
import { TextLink } from "@/lib/btn";
import { Section, SectionHead } from "@/lib/section";
import { Icon } from "@/lib/icons";
import { distinct, matchesQuery, textOf, toggle } from "@/lib/text";
import "./marketplace.css";

export interface MarketplacePartner {
  name: string;
  tier: string;
  type: string;
  text: string;
  rating: string;
  solution: string;
  href?: string;
}

export interface MarketplaceProps {
  eyebrow: string;
  heading: string;
  partners: MarketplacePartner[];
  viewAllHref?: string;
  layout: "tile grid" | "sidebar filter + grid" | "featured + grid" | "by solution";
  density: "comfortable" | "compact";
  search: "off" | "on";
  tiers: "off" | "on";
  reviews: "off" | "on";
  tone: "light" | "gray";
  width: "contained" | "full bleed";
}

// In the editor an inline-editable value arrives as an element, not a string.
const slug = (v: unknown) =>
  typeof v === "string" ? v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "";

function Tier({ tier }: { tier: string }) {
  return (
    <span className="p1-marketplace__tier" data-tier={slug(textOf(tier))}>
      {tier}
    </span>
  );
}

function Search({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="p1-marketplace__search">
      <Icon name="search" />
      <input
        className="p1-marketplace__search-input"
        type="search"
        aria-label="Search partners"
        placeholder="Search partners"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function MarketplaceRender({
  eyebrow,
  heading,
  partners,
  viewAllHref,
  layout = "sidebar filter + grid",
  density = "comfortable",
  search = "on",
  tiers = "on",
  reviews = "on",
  tone = "light",
  width = "contained",
}: MarketplaceProps) {
  const list = partners || [];
  const [query, setQuery] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [tiersPicked, setTiersPicked] = useState<string[]>([]);
  const typeOptions = distinct(list.map((x) => x.type));
  const tierOptions = distinct(list.map((x) => x.tier));
  const sidebar = layout === "sidebar filter + grid";
  // A control only filters while it is on screen; a stale choice from another layout is ignored.
  const q = search === "on" && (sidebar || layout === "tile grid") ? query : "";
  const activeTypes = sidebar ? types.filter((t) => typeOptions.includes(t)) : [];
  const activeTiers = sidebar ? tiersPicked.filter((t) => tierOptions.includes(t)) : [];
  const filtering = !!q.trim() || activeTypes.length > 0 || activeTiers.length > 0;
  const pick = (chosen: string[], v: unknown) => !chosen.length || chosen.includes(textOf(v).trim());

  const tile = (x: MarketplacePartner, i: number) => (
    <li key={i} className="p1-marketplace__tile">
      <div className="p1-marketplace__tile-top">
        <span className="p1-marketplace__logo" aria-hidden="true">{textOf(x.name).charAt(0) || "?"}</span>
        {tiers === "on" && x.tier && <Tier tier={x.tier} />}
      </div>
      <h3 className="p1-marketplace__name"><TextLink href={x.href}>{x.name}</TextLink></h3>
      {density !== "compact" && x.text && <p className="p1-marketplace__text">{x.text}</p>}
      <div className="p1-marketplace__foot">
        <span>{x.type}</span>
        {reviews === "on" && x.rating && <span className="p1-marketplace__rating">★ {x.rating}</span>}
      </div>
    </li>
  );
  const grid = (items: [MarketplacePartner, number][]) =>
    filtering && items.length === 0 ? (
      <p className="p1-marketplace__empty">No matches</p>
    ) : (
      <ul className="p1-marketplace__grid">{items.map(([x, i]) => tile(x, i))}</ul>
    );
  const all = list.map((x, i) => [x, i] as [MarketplacePartner, number]);
  const shown = all.filter(
    ([x]) => matchesQuery(q, x.name, x.text, x.type, x.tier) && pick(activeTypes, x.type) && pick(activeTiers, x.tier),
  );

  let body;
  if (layout === "by solution") {
    const solutions = [...new Set(list.map((x) => textOf(x.solution) || "Other"))];
    body = (
      <div className="p1-marketplace__groups">
        {solutions.map((sol) => {
          const items = all.filter(([x]) => (textOf(x.solution) || "Other") === sol);
          return (
            <div key={sol}>
              <div className="p1-marketplace__group-head">
                <h3 className="p1-marketplace__group-title">
                  {sol} <span className="p1-marketplace__count">{items.length}</span>
                </h3>
                <TextLink href={viewAllHref} className="p1-marketplace__link">View all</TextLink>
              </div>
              {grid(items)}
            </div>
          );
        })}
      </div>
    );
  } else if (layout === "sidebar filter + grid") {
    body = (
      <div className="p1-marketplace__split">
        <div className="p1-marketplace__filters">
          {search === "on" && <Search value={query} onChange={setQuery} />}
          {(
            [
              ["Type", typeOptions, activeTypes, types, setTypes],
              ["Tier", tierOptions, activeTiers, tiersPicked, setTiersPicked],
            ] as [string, string[], string[], string[], (v: string[]) => void][]
          ).map(([h, opts, active, stored, set]) => (
            <div key={h}>
              <p className="p1-marketplace__filter-title">{h}</p>
              {opts.map((o) => (
                <label key={o} className="p1-marketplace__check">
                  <input
                    className="p1-marketplace__box"
                    type="checkbox"
                    checked={active.includes(o)}
                    onChange={() => toggle(stored, set, o)}
                  />
                  {o}
                </label>
              ))}
            </div>
          ))}
        </div>
        {grid(shown)}
      </div>
    );
  } else {
    const featured = layout === "featured + grid" ? list[0] : undefined;
    body = (
      <>
        {layout === "tile grid" && search === "on" && (
          <div className="p1-marketplace__bar">
            <Search value={query} onChange={setQuery} />
          </div>
        )}
        {featured && (
          <div className="p1-marketplace__featured">
            <div className="p1-marketplace__featured-art" aria-hidden="true">{textOf(featured.name).charAt(0) || "?"}</div>
            <div className="p1-marketplace__featured-body">
              {tiers === "on" && featured.tier && <Tier tier={featured.tier} />}
              <h3 className="p1-marketplace__featured-title"><TextLink href={featured.href}>{featured.name}</TextLink></h3>
              <p className="p1-marketplace__text">{featured.text}</p>
            </div>
          </div>
        )}
        {grid(featured ? all.slice(1) : shown)}
      </>
    );
  }

  return (
    <Section tone={tone} width={width} className="p1-marketplace">
      <div className="p1-marketplace__root" data-layout={slug(layout)} data-density={density}>
        <SectionHead eyebrow={eyebrow} heading={heading} align="left" />
        {body}
      </div>
    </Section>
  );
}
