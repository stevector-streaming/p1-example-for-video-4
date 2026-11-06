import { Icon, type IconName } from "@/lib/icons";
import { TextLink, safeHref } from "@/lib/btn";
import { formAttrs } from "@/lib/safe-url";
import "./footer.css";

export interface FooterColumn {
  title: string;
  links: string;
}
export interface FooterProps {
  logo: string;
  tagline: string;
  columns: FooterColumn[];
  newsletter: "on" | "off";
  newsletterTitle: string;
  newsletterButton: string;
  social: "on" | "off";
  legal: "on" | "off";
  copyright: string;
  legalLinks: string;
  socialLinks?: string;
  tone: "dark" | "accent" | "light" | "gray";
  layout: "multi-column" | "minimal" | "newsletter" | "big brand";
  language: "on" | "off";
  actionHref?: string;
  puck?: { isEditing?: boolean };
}

const splitLines = (s: string) =>
  String(s || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

// "Label | target" is a link only when the link renderer would keep the target. Anything it
// would turn into "#" stays plain text.
const isLink = (target: string) => safeHref(target) !== "#" || target === "#";

function parseLinkLine(line: string): { label: string; href: string } {
  const text = line.trim();
  const bar = text.indexOf("|");
  if (bar < 0) return { label: text, href: "" };
  const label = text.slice(0, bar).trim();
  const target = text.slice(bar + 1).trim();
  return label && isLink(target) ? { label, href: target } : { label: text, href: "" };
}

const renderLine = (line: string, className?: string) => {
  const { label, href } = parseLinkLine(line);
  return <TextLink href={href} className={className}>{label}</TextLink>;
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const SOCIAL_ICONS: IconName[] = ["globe", "mail", "external"];

export function FooterRender({
  logo,
  tagline,
  columns,
  newsletter,
  newsletterTitle,
  newsletterButton,
  social,
  legal,
  copyright,
  legalLinks,
  socialLinks,
  tone,
  layout,
  language,
  actionHref,
  puck,
}: FooterProps) {
  const cols = columns || [];
  const lay = layout || "multi-column";
  const showNewsletter = newsletter === "on" || lay === "newsletter";
  const languagePill = language === "on" && (
    <span className="p1-footer__language">
      <Icon name="globe" className="p1-footer__social-icon" /> English
    </span>
  );

  // No link line keeps the icons; otherwise every line shows, non-links as plain text like the columns.
  const socialLines = splitLines(socialLinks || "");
  const hasSocialLink = socialLines.some((ln) => parseLinkLine(ln).href);
  const socialRow = (
    <div className="p1-footer__social">
      {hasSocialLink
        ? socialLines.map((ln, i) => <span key={i}>{renderLine(ln, "p1-footer__social-link")}</span>)
        : SOCIAL_ICONS.map((nm, i) => (
            <span key={i} className="p1-footer__social-btn">
              <Icon name={nm} className="p1-footer__social-icon" />
            </span>
          ))}
    </div>
  );

  return (
    <footer className="p1-footer" data-tone={tone} data-layout={slug(lay)}>
      <div className="p1-footer__inner">
        {showNewsletter && (
          <div className="p1-footer__newsletter">
            <div className="p1-footer__newsletter-title">{newsletterTitle}</div>
            {/* Posts to the form action URL when set. To handle it yourself, add an onSubmit
            (needs "use client"); to show a result, render it from that state. */}
            <form className="p1-footer__newsletter-form" {...formAttrs(actionHref, puck?.isEditing)}>
              <input
                className="p1-footer__newsletter-field"
                type="email"
                name="email"
                required
                placeholder="you@company.com"
                aria-label="Email address"
              />
              <button type="submit" className="p1-footer__newsletter-btn">
                {newsletterButton}
                <Icon name="arrow-right" className="p1-footer__newsletter-arrow" />
              </button>
            </form>
          </div>
        )}

        {lay === "big brand" && <div className="p1-footer__bigbrand">{logo}</div>}

        {lay === "minimal" ? (
          <div className="p1-footer__minimal">
            <div className="p1-footer__logo">{logo}</div>
            <div className="p1-footer__minimal-links">
              {cols
                .flatMap((c) => splitLines(c.links))
                .slice(0, 6)
                .map((ln, j) => (
                  <span key={j}>{renderLine(ln)}</span>
                ))}
            </div>
          </div>
        ) : (
          <div className="p1-footer__grid">
            <div className="p1-footer__brand">
              {lay !== "big brand" && <div className="p1-footer__logo">{logo}</div>}
              <p className="p1-footer__tagline">{tagline}</p>
            </div>
            {cols.map((c, i) => (
              <div key={i} className="p1-footer__col">
                <h5 className="p1-footer__col-head">{c.title}</h5>
                <ul className="p1-footer__col-list">
                  {splitLines(c.links).map((ln, j) => (
                    <li key={j} className="p1-footer__col-item">
                      {renderLine(ln)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {legal === "on" && (
          <div className="p1-footer__legal">
            <span className="p1-footer__copyright">{copyright}</span>
            <div className="p1-footer__legal-links">
              {splitLines(legalLinks).map((ln, i) => (
                <span key={i} className="p1-footer__legal-item">
                  {renderLine(ln)}
                </span>
              ))}
            </div>
            <span className="p1-footer__legal-spacer" />
            {languagePill}
            {social === "on" && socialRow}
          </div>
        )}

        {legal !== "on" && (social === "on" || language === "on") && (
          <div className="p1-footer__social-standalone p1-footer__legal-end">
            {languagePill}
            {social === "on" && socialRow}
          </div>
        )}
      </div>
    </footer>
  );
}
