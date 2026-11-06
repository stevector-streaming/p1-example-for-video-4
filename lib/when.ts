import { textOf } from "./text";

const WHEN = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/;

/** A local-time timestamp, or null when the text is not a real date; a bare date is the start or end of that day. */
export function parseWhen(text: unknown, edge: "start" | "end"): number | null {
  const m = WHEN.exec(textOf(text).trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const timed = m[4] !== undefined;
  const [h, mi, s] = timed ? [Number(m[4]), Number(m[5]), Number(m[6] ?? 0)] : edge === "end" ? [23, 59, 59] : [0, 0, 0];
  // The browser reads a bare "2026-11-20" as UTC, which can be the wrong local day, so build it from parts.
  const date = new Date(y, mo - 1, d, h, mi, s, !timed && edge === "end" ? 999 : 0);
  // new Date rolls 2026-02-30 over to March; a real date comes back with the same parts.
  const same = date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d && date.getHours() === h && date.getMinutes() === mi;
  return same ? date.getTime() : null;
}

/** Where `now` sits against an optional start and end, both edges inclusive. A missing edge is open. */
export function windowState(now: number, from: number | null, until: number | null): "before" | "inside" | "after" {
  if (from !== null && until !== null && until < from) return "after";
  if (from !== null && now < from) return "before";
  if (until !== null && now > until) return "after";
  return "inside";
}
