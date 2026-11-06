"use client";

import { Fragment, useState, type ReactNode } from "react";
import { Section } from "@/lib/section";
import { Btn } from "@/lib/btn";
import { Icon } from "@/lib/icons";
import { distinct, matchesQuery, textOf, toggle } from "@/lib/text";
import { SAMPLE_FILTERS } from "./topic-rail.data";
import "./topic-rail.css";

export interface Topic {
  label: string;
  count: string;
  /** Comma-separated names of the extra filters this topic belongs to, e.g. "Guide, Developers". */
  tags?: string;
}

export interface TopicFilter {
  group: string;
  label: string;
  count: string;
}

export interface TopicRailProps {
  topics: Topic[];
  filters?: TopicFilter[];
  layout: "chip row" | "sidebar list" | "tag cloud" | "mega filter";
  counts: "off" | "on";
  search: "off" | "on";
  sort: "Newest" | "Popular" | "A–Z";
  tone: "light" | "gray";
  width: "contained" | "full bleed";
  puck?: { isEditing?: boolean };
}

// A topic called "All" resets the selection instead of being one more topic.
const isAll = (label: string) => label.toLowerCase() === "all";

const SORTS = ["Newest", "Popular", "A–Z"] as const;
// Only whole numbers count; "1.2k" or an empty string add nothing rather than guessing.
const countOf = (c: unknown) => (/^\d+$/.test(textOf(c).trim()) ? Number(textOf(c).trim()) : 0);

export function TopicRailRender({ topics, filters = SAMPLE_FILTERS, layout = "chip row", counts, search, sort, tone, width, puck }: TopicRailProps) {
  const list = topics || [];
  const extras = filters || [];
  const groups = distinct(extras.map((f) => f.group));
  const showCounts = counts === "on";
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [extra, setExtra] = useState<string[]>([]);
  const [sortPick, setSortPick] = useState<string | null>(null);

  const labelOf = (t: Topic) => textOf(t.label).trim();
  // Ticked boxes narrow the topics: any box within a column, and every column that has one ticked.
  // Only the mega filter shows the boxes, and an edited-away filter is ignored.
  const tickedIn = (h: string) =>
    extras.filter((f) => textOf(f.group).trim() === h && extra.includes(`${h}:${textOf(f.label).trim()}`)).map((f) => textOf(f.label).trim().toLowerCase());
  const tagsOf = (t: Topic) => textOf(t.tags).split(",").map((s) => s.trim().toLowerCase());
  // Pages saved before topics had tags would otherwise empty on any tick, so the boxes only filter once a topic is tagged.
  const anyTags = list.some((t) => textOf(t.tags).trim());
  const passes = (t: Topic) =>
    layout !== "mega filter" ||
    !anyTags ||
    groups.every((h) => {
      const on = tickedIn(h);
      return !on.length || tagsOf(t).some((g) => on.includes(g));
    });
  // A control only acts while it is on screen, and a selected topic that was edited away is ignored.
  const selected = picked.filter((l) => list.some((t) => labelOf(t) === l));
  const q = search === "on" ? query : "";
  const order = layout === "chip row" && sortPick ? sortPick : sort;
  const visible = list
    .filter((t) => passes(t) && matchesQuery(q, t.label))
    .sort(
      (a, b) =>
        Number(isAll(labelOf(b))) - Number(isAll(labelOf(a))) ||
        (order === "Popular" ? countOf(b.count) - countOf(a.count) : order === "A–Z" ? labelOf(a).localeCompare(labelOf(b)) : 0),
    );
  const total = (selected.length ? list.filter((t) => selected.includes(labelOf(t)) && passes(t)) : visible.filter((t) => !isAll(labelOf(t)))).reduce(
    (sum, t) => sum + countOf(t.count),
    0,
  );
  const flip = (label: string) => (isAll(label) ? setPicked([]) : toggle(picked, setPicked, label));
  const topicOn = (label: string) => (isAll(label) ? selected.length === 0 : selected.includes(label));
  // In the editor the topic text is editable in place, and a button around it would block that,
  // so the topics stay plain elements there and become buttons on the published page.
  const control = (cls: string, on: boolean, onClick: () => void, children: ReactNode, attrs?: object) =>
    puck?.isEditing ? (
      <span className={cls} {...attrs}>{children}</span>
    ) : (
      <button type="button" className={cls} aria-pressed={on} data-active={on ? "true" : undefined} onClick={onClick} {...attrs}>
        {children}
      </button>
    );
  const none = visible.length === 0 && list.length > 0 ? <p className="p1-topic-rail__empty">No matches</p> : null;

  const searchBox =
    search === "on" ? (
      <label className="p1-topic-rail__search">
        <Icon name="search" />
        <input
          className="p1-topic-rail__search-input"
          type="search"
          aria-label="Search topics"
          placeholder="Search topics"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
    ) : null;

  const column = (heading: string, rows: [string, ReactNode, ReactNode][], isOn: (l: string) => boolean, flipRow: (l: string) => void) => (
    <div key={heading} className="p1-topic-rail__col">
      <p className="p1-topic-rail__over">{heading}</p>
      {rows.map(([key, label, count], i) => (
        <label key={i} className="p1-topic-rail__check">
          <input className="p1-topic-rail__box" type="checkbox" checked={isOn(key)} onChange={() => flipRow(key)} />
          <span className="p1-topic-rail__check-label">{label}</span>
          {showCounts && <span className="p1-topic-rail__count">{count}</span>}
        </label>
      ))}
    </div>
  );

  let body;
  if (layout === "mega filter") {
    body = (
      <div className="p1-topic-rail__panel">
        {searchBox}
        <div className="p1-topic-rail__cols">
          {none ? (
            <div key="Topic" className="p1-topic-rail__col">
              <p className="p1-topic-rail__over">Topic</p>
              {none}
            </div>
          ) : (
            column("Topic", visible.map((t) => [labelOf(t), t.label, t.count] as [string, ReactNode, ReactNode]), topicOn, flip)
          )}
          {groups.map((h) =>
            column(
              h,
              extras.filter((f) => textOf(f.group).trim() === h).map((f) => [textOf(f.label).trim(), f.label, f.count] as [string, ReactNode, ReactNode]),
              (l) => extra.includes(`${h}:${l}`),
              (l) => toggle(extra, setExtra, `${h}:${l}`),
            ),
          )}
        </div>
        <div className="p1-topic-rail__actions">
          <button
            type="button"
            className="p1-topic-rail__clear"
            onClick={() => {
              setPicked([]);
              setExtra([]);
              setQuery("");
            }}
          >
            Clear all
          </button>
          <Btn variant="dark">Show {total} results</Btn>
        </div>
      </div>
    );
  } else if (layout === "sidebar list") {
    body = (
      <div className="p1-topic-rail__side">
        {searchBox}
        {none ?? (
          <ul className="p1-topic-rail__list">
            {visible.map((t, i) => (
              <li key={i} className="p1-topic-rail__row">
                {control(
                  "p1-topic-rail__row-btn",
                  topicOn(labelOf(t)),
                  () => flip(labelOf(t)),
                  <>
                    <span>{t.label}</span>
                    {showCounts && <span className="p1-topic-rail__count">{t.count}</span>}
                  </>,
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  } else {
    body = (
      <div className="p1-topic-rail__row-wrap">
        {searchBox}
        {none ??
          visible.map((t, i) => {
            const on = topicOn(labelOf(t));
            return layout === "tag cloud"
              ? <Fragment key={i}>{control("p1-topic-rail__tag", on, () => flip(labelOf(t)), t.label, { "data-step": i % 3 })}</Fragment>
              : <Fragment key={i}>{control("p1-topic-rail__chip", on, () => flip(labelOf(t)), <>{t.label}{showCounts && <span className="p1-topic-rail__chip-count">{t.count}</span>}</>)}</Fragment>;
          })}
        {layout === "chip row" && (
          <label className="p1-topic-rail__sort">
            Sort:{" "}
            <select value={order} onChange={(e) => setSortPick(e.target.value)}>
              {SORTS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    );
  }

  return (
    <Section tone={tone} width={width} className="p1-topic-rail">
      <div data-layout={layout.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}>{body}</div>
    </Section>
  );
}
