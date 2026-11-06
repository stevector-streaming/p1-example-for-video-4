import { P1_FALLBACKS } from '@/lib/assets';
import { FallbackImg } from '@/lib/img';
import { ShareIcon, shareHref } from '@/lib/share-icon';
import { textOf } from "@/lib/text";
import "./article-header.css";


export interface ArticleHeaderProps {
  category: string;
  title: string;
  standfirst: string;
  authorName: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  align: "left" | "center";
  rule: "on" | "off";
  layout?: "stacked center" | "left rail" | "cover hero" | "minimal";
  image?: string;
  tags?: { text: string }[];
  byline?: "off" | "on";
  share?: "off" | "on";
  shareLinkHref?: string;
  shareMailHref?: string;
  shareExternalHref?: string;
}

const slug = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function ArticleHeaderRender({
  category,
  title,
  standfirst,
  authorName,
  authorAvatar,
  date,
  readTime,
  align,
  rule,
  layout = "stacked center",
  image = "",
  tags = [],
  byline = "on",
  share = "off",
  shareLinkHref,
  shareMailHref,
  shareExternalHref,
}: ArticleHeaderProps) {
  const minimal = layout === "minimal";
  // Stacked and hero only show a cover when one is set; the rail always reserves the slot.
  const cover = image || layout === "left rail" ? (
    <div className="p1-article-header__cover">
      <FallbackImg src={image} loading="eager" alt="" className="p1-article-header__cover-img" />
    </div>
  ) : null;
  // Puck sends null for an emptied list, which a destructuring default does not catch.
  const tagList = (tags || []).filter((t) => t.text);
  return (
    <div className="p1-article-header p1-block" data-align={align} data-layout={slug(layout)}>
      <div className="p1-article-header__layout">
      <div className="p1-article-header__inner">
        {category && <div className="p1-article-header__category">{category}</div>}
        <h1 className="p1-article-header__title">{title}</h1>
        {standfirst && !minimal && <p className="p1-article-header__standfirst">{standfirst}</p>}
        {byline === "on" && (
        <div className="p1-article-header__byline">
          <div className="p1-article-header__avatar">
            {authorAvatar && <FallbackImg src={authorAvatar} fallback={P1_FALLBACKS.AVATAR} alt={textOf(authorName)} className="p1-article-header__avatar-img" />}
          </div>
          <div className="p1-article-header__author-info">
            <div className="p1-article-header__author-name">{authorName}</div>
            {(date || readTime) && (
              <div className="p1-article-header__meta">
                {date}
                {date && readTime && <span className="p1-article-header__sep">·</span>}
                {readTime}
              </div>
            )}
          </div>
        </div>
        )}
        {!minimal && tagList.length > 0 && (
          <ul className="p1-article-header__tags">
            {tagList.map((t, i) => <li key={i} className="p1-article-header__tag">{t.text}</li>)}
          </ul>
        )}
        {share === "on" && (
          <div className="p1-article-header__share" aria-hidden={[shareHref("link", shareLinkHref), shareHref("mail", shareMailHref), shareHref("external", shareExternalHref)].some(Boolean) ? undefined : true}>
            Share
            <ShareIcon name="link" href={shareLinkHref} label="Share link" className="p1-article-header__share-link" iconClassName="p1-article-header__share-icon" />
            <ShareIcon name="mail" href={shareMailHref} label="Share by email" className="p1-article-header__share-link" iconClassName="p1-article-header__share-icon" />
            <ShareIcon name="external" href={shareExternalHref} label="Share elsewhere" className="p1-article-header__share-link" iconClassName="p1-article-header__share-icon" />
          </div>
        )}
        {rule !== "off" && <hr className="p1-article-header__rule" />}
      </div>
      {cover && !minimal && cover}
      </div>
    </div>
  );
}
