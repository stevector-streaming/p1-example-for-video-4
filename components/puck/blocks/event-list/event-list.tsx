"use client";

import { useState } from "react";
import { Btn, TextLink } from "@/lib/btn";
import { Section, SectionHead, type SectionTone, type SectionWidth } from "@/lib/section";
import { wireframe } from "@/lib/define-meta";
import { FallbackImg } from "@/lib/img";
import { distinct, dotJoin, matchesQuery, textOf } from "@/lib/text";
import "./event-list.css";

export interface EventItem {
  title: string;
  date: string;
  day: string;
  mon: string;
  time: string;
  format: string;
  where: string;
  speakers: string;
  left: string;
  image?: string;
  rsvpHref?: string;
}

export interface EventListProps {
  eyebrow: string;
  heading: string;
  events: EventItem[];
  layout: "stacked rows" | "card grid" | "featured + queue" | "filter + list";
  dateBlock: "block" | "inline";
  format: "off" | "on";
  speakers: "off" | "on";
  capacity: "off" | "on";
  rsvp: "button" | "link";
  tone: SectionTone;
  width: SectionWidth;
}


const slug = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function EventListRender({
  eyebrow,
  heading,
  events,
  layout = "stacked rows",
  dateBlock = "block",
  format = "on",
  speakers = "on",
  capacity = "on",
  rsvp = "button",
  tone = "light",
  width = "contained",
}: EventListProps) {
  const list = events || [];
  const filterOn = layout === "filter + list";
  const [query, setQuery] = useState("");
  const [formatPick, setFormatPick] = useState("All");
  const [wherePick, setWherePick] = useState("Anywhere");

  // Plain functions, not components: a component declared here is a new type on every render, so React would remount (and drop focus in) the inline-editable text inside.
  const rsvpButton = (e: EventItem) =>
    rsvp === "link" ? (
      <TextLink href={e.rsvpHref} className="p1-event-list__rsvp-link">RSVP</TextLink>
    ) : (
      <Btn variant="primary" href={e.rsvpHref}>RSVP</Btn>
    );

  const dateCell = ({ e }: { e: EventItem }) => (
    <div className="p1-event-list__date">
      <div className="p1-event-list__date-mon">{e.mon}</div>
      <div className="p1-event-list__date-day">{e.day}</div>
    </div>
  );

  const meta = (e: EventItem) =>
    dotJoin([dateBlock === "inline" ? e.date : "", e.time, e.where, speakers === "on" ? e.speakers : ""]);

  const tag = ({ e }: { e: EventItem }) =>
    format === "on" && e.format ? <span className="p1-sec-pill">{e.format}</span> : null;

  const left = ({ e }: { e: EventItem }) =>
    capacity === "on" && e.left ? <span className="p1-event-list__left">{e.left}</span> : null;

  const row = (e: EventItem, i: number) => (
    <li key={i} className="p1-event-list__row">
      {dateBlock === "block" && dateCell({ e })}
      <div className="p1-event-list__main">
        <div className="p1-event-list__titleline">
          <h3 className="p1-event-list__title">{e.title}</h3>
          {tag({ e })}
        </div>
        <p className="p1-event-list__meta">{meta(e)}</p>
      </div>
      {left({ e })}
      {rsvpButton(e)}
    </li>
  );

  const card = (e: EventItem, i: number) => (
    <li key={i} className="p1-sec-card p1-event-list__card">
      <div className="p1-event-list__card-top">
        {dateBlock === "block" ? dateCell({ e }) : <span className="p1-event-list__date-inline">{e.date}</span>}
        {tag({ e })}
      </div>
      <h3 className="p1-event-list__title">{e.title}</h3>
      <p className="p1-event-list__meta">{meta(e)}</p>
      <div className="p1-event-list__card-foot">
        {left({ e })}
        {rsvpButton(e)}
      </div>
    </li>
  );

  const featured = list[0];
  const formatOptions = ["All", ...distinct(list.map((e) => e.format)).filter((o) => o !== "All")];
  const whereOptions = ["Anywhere", ...distinct(list.map((e) => e.where)).filter((o) => o !== "Anywhere")];
  // The filters only apply in the filter layout; a choice that was edited away falls back to the first option.
  const formatChoice = filterOn && formatOptions.includes(formatPick) ? formatPick : "All";
  const placeChoice = filterOn && whereOptions.includes(wherePick) ? wherePick : "Anywhere";
  const q = filterOn ? query : "";
  const shown = list.filter(
    (e) =>
      matchesQuery(q, e.title, e.where, e.format) &&
      (formatChoice === "All" || textOf(e.format).trim() === formatChoice) &&
      (placeChoice === "Anywhere" || textOf(e.where).trim() === placeChoice),
  );
  const filters: [string, string[], string, (v: string) => void][] = [
    ["Format", formatOptions, formatChoice, setFormatPick],
    ["Location", whereOptions, placeChoice, setWherePick],
  ];

  return (
    <Section tone={tone} width={width} className="p1-event-list p1-block">
      <div className="p1-event-list__root" data-layout={slug(layout)}>
        <SectionHead eyebrow={eyebrow} heading={heading} align="left" />
        {layout === "card grid" ? (
          <ul className="p1-event-list__grid">{list.map(card)}</ul>
        ) : layout === "featured + queue" ? (
          <div className="p1-event-list__split">
            {featured && (
              <div className="p1-sec-card p1-event-list__featured">
                <FallbackImg className="p1-event-list__art" src={featured.image} fallback={wireframe(640, 360)} alt="" />
                <div className="p1-event-list__featured-body">
                  <span className="p1-sec-pill p1-event-list__badge">Featured</span>
                  <h3 className="p1-event-list__title p1-event-list__title--lg">{featured.title}</h3>
                  <p className="p1-event-list__meta">{meta(featured)}</p>
                  <div className="p1-event-list__featured-cta">
                    {rsvpButton(featured)}
                  </div>
                </div>
              </div>
            )}
            <ul className="p1-event-list__rows">
              {list.slice(1).map((e, i) => (
                <li key={i} className="p1-event-list__queue">
                  <div className="p1-event-list__title p1-event-list__title--sm">{e.title}</div>
                  <p className="p1-event-list__meta">{dotJoin([e.date, e.where])}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : layout === "filter + list" ? (
          <div className="p1-event-list__split p1-event-list__split--filter">
            <aside className="p1-event-list__filters" aria-label="Event filters">
              <input
                className="p1-event-list__search"
                type="search"
                aria-label="Search events"
                placeholder="Search events"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {filters.map(([group, options, chosen, choose]) => (
                <div key={group}>
                  <p className="p1-event-list__filter-head">{group}</p>
                  <ul className="p1-event-list__filter-list">
                    {options.map((o) => (
                      <li key={o}>
                        <button
                          type="button"
                          className="p1-event-list__filter-item"
                          aria-pressed={o === chosen}
                          data-active={o === chosen ? "true" : undefined}
                          onClick={() => choose(o)}
                        >
                          {o}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </aside>
            {shown.length === 0 && list.length > 0 ? (
              <p className="p1-event-list__empty">No matches</p>
            ) : (
              <ul className="p1-event-list__rows">{shown.map(row)}</ul>
            )}
          </div>
        ) : (
          <ul className="p1-event-list__rows">{list.map(row)}</ul>
        )}
      </div>
    </Section>
  );
}
