import { createElement, Fragment, type ReactNode } from "react";

/**
 * The text of an inline-editable value. A published page passes a string; the editor passes a
 * wrapper element that carries the text in props.resolved or props.editable.props.value.
 */
export function textOf(v: unknown): string {
  if (typeof v === "string") return v;
  const p = (v as { props?: { resolved?: unknown; editable?: { props?: { value?: unknown } }; value?: unknown } } | null)?.props;
  return String(p?.resolved ?? p?.editable?.props?.value ?? p?.value ?? "");
}

/**
 * Pieces of a line joined with a dot. Empty parts are skipped; an editor element is kept as is,
 * so the text stays editable. An emptied editor field is still an element, so the editor can
 * show a trailing dot that the published page does not.
 */
export function dotJoin(parts: ReactNode[]): ReactNode {
  return parts
    .filter((p) => p != null && p !== false && p !== "")
    .map((p, i) => createElement(Fragment, { key: i }, i > 0 ? " · " : null, p));
}

/** True when the query is blank or any field's text contains it, ignoring case. Plain text, not a pattern. */
export const matchesQuery = (query: string, ...fields: unknown[]): boolean => {
  const q = query.trim().toLowerCase();
  return !q || fields.some((f) => textOf(f).toLowerCase().includes(q));
};

/** The distinct non-empty texts of a list of inline-editable values, in first-seen order. */
export const distinct = (values: unknown[]): string[] => [...new Set(values.map((v) => textOf(v).trim()).filter(Boolean))];

/** Adds `value` to the chosen list, or removes it when already there, and hands the result to `set`. */
export const toggle = (chosen: string[], set: (next: string[]) => void, value: string): void =>
  set(chosen.includes(value) ? chosen.filter((c) => c !== value) : [...chosen, value]);
