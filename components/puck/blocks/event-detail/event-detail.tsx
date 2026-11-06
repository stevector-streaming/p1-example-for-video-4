"use client";

import { useEffect, useState } from "react";
import { P1_FALLBACKS } from "@/lib/assets";
import { FallbackImg } from "@/lib/img";
import { Btn, TextLink } from "@/lib/btn";
import { Icon } from "@/lib/icons";
import { formAttrs, safeUrl } from "@/lib/safe-url";
import { textOf } from "@/lib/text";
import { parseWhen } from "@/lib/when";
import "./event-detail.css";

export interface EventDetailProps {
  image: string;
  format: string;
  title: string;
  subtitle: string;
  date: string;
  where: string;
  btn: string;
  btnHref?: string;
  replayHref?: string;
  chapters: { label: string }[];
  layout: "split + form" | "countdown hero" | "cover bleed" | "inline replay";
  state: "upcoming" | "live" | "ended";
  countdown: "off" | "on";
  countdownTo?: string;
  addCal: "off" | "on";
  calendarHref?: string;
  tone: "light" | "dark";
  actionHref?: string;
  videoSrc?: string;
  puck?: { isEditing?: boolean };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Days, hours, minutes and seconds in a span of milliseconds, never negative. */
function unitsLeft(ms: number): [string, string][] {
  const total = Math.max(0, Math.floor(ms / 1000));
  return [
    [pad(Math.floor(total / 86400)), "days"],
    [pad(Math.floor(total / 3600) % 24), "hrs"],
    [pad(Math.floor(total / 60) % 60), "min"],
    [pad(total % 60), "sec"],
  ];
}

const FORM_FIELDS = [
  { label: "Full name", name: "full-name", email: false },
  { label: "Work email", name: "work-email", email: true },
];

export function EventDetailRender({
  image,
  format,
  title,
  subtitle,
  date,
  where,
  btn,
  btnHref,
  replayHref,
  chapters,
  layout = "split + form",
  state = "upcoming",
  countdown = "off",
  countdownTo,
  addCal = "on",
  calendarHref,
  tone = "light",
  actionHref,
  videoSrc,
  puck,
}: EventDetailProps) {
  const cover = layout === "cover bleed";
  const split = layout === "split + form";
  const replay = layout === "inline replay";
  const st = replay ? "ended" : state;
  const to = parseWhen(countdownTo, "start");
  // The visitor's clock is read after mount, so a cached page never shows a stale count and the server
  // renders placeholders. With no readable date nothing is drawn; a past date disappears once the clock is known.
  const [now, setNow] = useState<number | null>(null);
  const counting = countdown === "on" && st === "upcoming" && to !== null;
  useEffect(() => {
    // Only a visible countdown needs the clock, so every other event-detail renders once.
    if (countdown !== "on" || st !== "upcoming") {
      // Forget the last reading so turning the countdown back on starts from placeholders.
      setNow(null);
      return;
    }
    setNow(Date.now());
    if (!counting || to === null || to <= Date.now()) return;
    const timer = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= to) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, st, counting, to]);
  const left: [string, string][] =
    now === null || to === null ? [["--", "days"], ["--", "hrs"], ["--", "min"], ["--", "sec"]] : unitsLeft(to - now);
  const showCount = countdown === "on" && st === "upcoming" && to !== null && (now === null || to > now);
  const effectiveTone = cover ? "dark" : tone;
  const btnVariant = effectiveTone === "dark" ? "yellow" : "primary";
  const chapterList = (chapters || []).filter((c) => c.label);
  const video = safeUrl(videoSrc);
  const btnLabel = st === "ended" ? "Watch replay" : btn;
  // An ended event points at the replay, never back at the registration page.
  const linkHref = st === "ended" ? replayHref : btnHref;
  // The register button submits only when an action is set or no link is saved; an ended event never submits.
  const submits = st !== "ended" && (Boolean(safeUrl(actionHref)) || !linkHref);

  const text = (
    <div className="p1-event-detail__text">
      <div className="p1-event-detail__tags">
        {format && <span className="p1-event-detail__pill" data-solid="">{format}</span>}
        {st === "live" && (
          <span className="p1-event-detail__pill">
            <span className="p1-event-detail__dot" />
            Live now
          </span>
        )}
        {st === "ended" && <span className="p1-event-detail__pill">Ended</span>}
      </div>
      <h1 className="p1-event-detail__title">{title}</h1>
      {subtitle && <p className="p1-event-detail__sub">{subtitle}</p>}
      <div className="p1-event-detail__meta">
        {date && (
          <span>
            <Icon name="calendar" />
            {date}
          </span>
        )}
        {where && (
          <span>
            <Icon name="globe" />
            {where}
          </span>
        )}
      </div>
      {puck?.isEditing && countdown === "on" && textOf(countdownTo).trim() && to === null && (
        <p className="p1-event-detail__note">Can&apos;t read Countdown to. Use 2026-11-20 or 2026-11-20T09:00.</p>
      )}
      {showCount && (
        <div className="p1-event-detail__count">
          {left.map(([n, l]) => (
            <div key={l} className="p1-event-detail__unit">
              <div className="p1-event-detail__num">{n}</div>
              <div className="p1-event-detail__unit-label">{l}</div>
            </div>
          ))}
        </div>
      )}
      {!split && !replay && (
        <div className="p1-event-detail__actions">
          <Btn variant={btnVariant} href={linkHref}>{btnLabel}</Btn>
          {addCal === "on" && st !== "ended" && (
            <TextLink href={calendarHref} className="p1-event-detail__link">Add to calendar</TextLink>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section
      className="p1-event-detail"
      data-tone={effectiveTone}
      data-layout={layout.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}
    >
      {cover && (
        <FallbackImg
          className="p1-event-detail__bg"
          src={image}
          loading="eager"
          fallback={P1_FALLBACKS.LANDSCAPE}
          alt=""
        />
      )}
      <div className="p1-event-detail__inner">
        {split ? (
          <div className="p1-event-detail__split">
            {text}
            {/* Posts to the form action URL when set. A saved register link keeps working when
                no action is set. To handle submit yourself, add an onSubmit. */}
            <form className="p1-event-detail__form" {...formAttrs(submits ? actionHref : "", puck?.isEditing)}>
              <h2 className="p1-event-detail__form-title">Register</h2>
              {FORM_FIELDS.map((f) => (
                <input
                  key={f.name}
                  className="p1-event-detail__field"
                  type={f.email ? "email" : "text"}
                  name={f.name}
                  required={f.email}
                  disabled={st === "ended"}
                  placeholder={f.label}
                  aria-label={f.label}
                />
              ))}
              {submits ? (
                <Btn submit variant={btnVariant}>{btnLabel}</Btn>
              ) : (
                <Btn variant={btnVariant} href={linkHref}>{btnLabel}</Btn>
              )}
            </form>
          </div>
        ) : (
          text
        )}
        {replay && (
          <>
            {video ? (
              <video
                className="p1-event-detail__video"
                controls
                preload="metadata"
                src={video}
                aria-label={textOf(title) || "Replay"}
              />
            ) : (
              <div className="p1-event-detail__player" aria-hidden="true">
                <span className="p1-event-detail__play" />
              </div>
            )}
            {chapterList.length > 0 && (
              <ul className="p1-event-detail__chapters">
                {chapterList.map((c, i) => (
                  <li key={i} className="p1-event-detail__pill" data-solid={i === 0 ? "" : undefined}>{c.label}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </section>
  );
}
