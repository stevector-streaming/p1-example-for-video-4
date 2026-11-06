import { Icon } from "@/lib/icons";
import { safeUrl } from "@/lib/safe-url";

export interface ShareIconProps {
  href?: string;
  name: "link" | "mail" | "external";
  label: string;
  className: string;
  iconClassName?: string;
}

const MAIL = /^(?:mailto:)?([^\s@<>"?#]+@[^\s@<>"?#]+\.[^\s@<>"?#]+)(\?[^\s<>"]*)?$/i;

/**
 * The address a share icon links to, or "" when it has none. Every icon takes an https or local address;
 * the email icon also takes `mailto:` or a bare `name@example.com`. Anything else stays unset.
 */
export function shareHref(name: ShareIconProps["name"], href: unknown): string {
  const url = safeUrl(href);
  if (url || name !== "mail") return url;
  const m = MAIL.exec((typeof href === "string" ? href : "").replace(/[\t\n\r]/g, "").trim());
  return m ? `mailto:${m[1]}${m[2] ?? ""}` : "";
}

// A set address makes the icon a named link; an unset one stays an inert marker (the same span a link
// block shows without an address), which the library preview explains when clicked.
export function ShareIcon({ href, name, label, className, iconClassName }: ShareIconProps) {
  const url = shareHref(name, href);
  const classes = `p1-textlink ${className}`;
  const icon = <Icon name={name} className={iconClassName} />;
  return url ? (
    <a className={classes} href={url} aria-label={label}>{icon}</a>
  ) : (
    <span className={classes} aria-hidden="true">{icon}</span>
  );
}
