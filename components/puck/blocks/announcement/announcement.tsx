"use client";

import { useEffect, useId, useState } from "react";
import { TextLink } from "@/lib/btn";
import { Icon } from "@/lib/icons";
import { textOf } from "@/lib/text";
import { parseWhen, windowState } from "@/lib/when";
import "./announcement.css";

export interface AnnouncementProps {
  text: string;
  linkLabel: string;
  linkHref?: string;
  linkTarget?: "_self" | "_blank";
  tone: "accent" | "yellow" | "dark" | "gradient";
  align: "center" | "left";
  style?: "default" | "quiet" | "bold" | "critical";
  icon?: "off" | "on";
  dismissible?: "off" | "on";
  showFrom?: string;
  showUntil?: string;
  puck?: { isEditing?: boolean };
}

// A longer delay makes setTimeout fire at once, so a far-off date is waited out in steps of this size.
const MAX_WAIT_MS = 2 ** 31 - 1;

export function AnnouncementRender({
  text,
  linkLabel,
  linkHref,
  linkTarget,
  tone,
  align,
  style = "default",
  icon = "off",
  dismissible = "off",
  showFrom,
  showUntil,
  puck,
}: AnnouncementProps) {
  const id = useId();
  const from = parseWhen(showFrom, "start");
  const until = parseWhen(showUntil, "end");
  const scheduled = from !== null || until !== null;
  // The reader's own clock decides, so a cached or statically built page is never stale. It is read after
  // mount, which means a scheduled bar renders nothing on the server and cannot flash for a reader outside it.
  const [now, setNow] = useState<number | null>(null);
  const state = now === null ? null : windowState(now, from, until);
  useEffect(() => {
    // Forget the last reading when unscheduled, so a bar scheduled again starts from an unknown clock.
    setNow(scheduled ? Date.now() : null);
  }, [scheduled, from, until]);
  // Waits for the next edge and reads the clock again. A far-off edge is reached in steps, because each
  // tick changes `now`, which re-arms this effect for what is left.
  useEffect(() => {
    if (!scheduled || now === null) return;
    const edges = [from, until === null ? null : until + 1].filter((e): e is number => e !== null && e > Date.now());
    if (!edges.length) return;
    const wait = Math.min(Math.min(...edges) - Date.now() + 1, MAX_WAIT_MS);
    const reread = () => setNow(Date.now());
    const timer = setTimeout(reread, wait);
    // Timers pause while a device sleeps and slow down in a background tab, so coming back reads the clock too.
    document.addEventListener("visibilitychange", reread);
    window.addEventListener("focus", reread);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", reread);
      window.removeEventListener("focus", reread);
    };
  }, [scheduled, from, until, now]);
  const editing = Boolean(puck?.isEditing);
  if (scheduled && !editing && state !== "inside") return <></>;
  const outside = scheduled && editing && state !== null && state !== "inside";
  // A filled-in date that does not parse is ignored, so the editor says which one.
  const unread = [["Show from", showFrom, from], ["Show until", showUntil, until]]
    .filter(([, v, ms]) => textOf(v).trim() && ms === null)
    .map(([name]) => name);
  const dismiss = dismissible === "on";
  return (
    // One root keeps the checkbox next to the bar, so a host that wraps the block cannot split them.
    <div className="p1-announcement-root">
      {outside && <p className="p1-announcement__note">Not showing to visitors right now: outside its schedule.</p>}
      {editing && unread.length > 0 && (
        <p className="p1-announcement__note">Can&apos;t read {unread.join(" and ")}. Use 2026-11-20 or 2026-11-20 09:00.</p>
      )}
      {dismiss && <input type="checkbox" id={id} className="p1-announcement__toggle" />}
      <div
        className="p1-announcement"
        data-tone={tone}
        data-align={align}
        data-style={style}
      >
        {icon === "on" && (
          <span className="p1-announcement__icon" aria-hidden="true">
            <Icon name="megaphone" />
          </span>
        )}
        <span className="p1-announcement__text">{text}</span>
        {linkLabel && (
          <TextLink className="p1-announcement__link" href={linkHref} target={linkTarget}>
            {linkLabel}
          </TextLink>
        )}
        {dismiss && (
          <label htmlFor={id} className="p1-announcement__dismiss" aria-label="Dismiss">
            <Icon name="x" />
          </label>
        )}
      </div>
    </div>
  );
}
