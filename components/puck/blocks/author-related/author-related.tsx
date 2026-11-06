import { TextLink } from "@/lib/btn";
import { Section, type SectionTone, type SectionWidth } from "@/lib/section";
import { FallbackImg } from "@/lib/img";
import { textOf } from "@/lib/text";
import { formAttrs } from "@/lib/safe-url";
import "./author-related.css";

export interface RelatedPost {
  image: string;
  title: string;
  category: string;
  meta: string;
  href?: string;
}

export interface AuthorRelatedProps {
  author: string;
  bio: string;
  authorBlock: "off" | "on";
  related: "grid" | "list" | "none";
  posts: RelatedPost[];
  newsletter: "off" | "on";
  tone: SectionTone;
  width: SectionWidth;
  actionHref?: string;
  puck?: { isEditing?: boolean };
}

const initials = (name: unknown) =>
  textOf(name).split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("");

export function AuthorRelatedRender({
  author,
  bio,
  authorBlock,
  related,
  posts,
  newsletter,
  tone,
  width,
  actionHref,
  puck,
}: AuthorRelatedProps) {
  const list = posts || [];
  return (
    <Section tone={tone} width={width} className="p1-author-related">
      <div className="p1-author-related__root" data-layout={related}>
        {authorBlock === "on" && (
          <div className="p1-author-related__card">
            <span className="p1-author-related__avatar" aria-hidden="true">{initials(author || "")}</span>
            <div>
              <div className="p1-author-related__name">{author}</div>
              <p className="p1-author-related__bio">{bio}</p>
            </div>
          </div>
        )}
        {related !== "none" && (
          <div className="p1-author-related__related">
            <h3 className="p1-author-related__heading">Keep reading</h3>
            {related === "grid" ? (
              <div className="p1-author-related__grid">
                {list.map((x, i) => (
                  <div key={i} className="p1-author-related__post">
                    <FallbackImg src={x.image} alt="" className="p1-author-related__img" />
                    <div className="p1-author-related__category">{x.category}</div>
                    <h4 className="p1-author-related__title"><TextLink href={x.href}>{x.title}</TextLink></h4>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p1-author-related__list">
                {list.map((x, i) => (
                  <div key={i} className="p1-author-related__row">
                    <span className="p1-author-related__title"><TextLink href={x.href}>{x.title}</TextLink></span>
                    <span className="p1-author-related__meta">{x.meta}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {newsletter === "on" && (
          <div className="p1-author-related__newsletter">
            <div className="p1-author-related__newsletter-title">One good read a week.</div>
            {/* Posts to the form action URL when set. To handle it yourself, add an onSubmit
            (needs "use client"); to show a result, render it from that state. */}
            <form className="p1-author-related__form" {...formAttrs(actionHref, puck?.isEditing)}>
              <input
                className="p1-author-related__input"
                type="email"
                name="email"
                required
                placeholder="you@company.com"
                aria-label="Email address"
              />
              <button type="submit" className="p1-author-related__submit">Subscribe</button>
            </form>
          </div>
        )}
      </div>
    </Section>
  );
}
