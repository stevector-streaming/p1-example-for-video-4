import { Btn, type BtnVariant } from "@/lib/btn";
import { formAttrs } from "@/lib/safe-url";
import "./lead-capture.css";

export interface LeadCaptureProps {
  heading: string;
  subtitle: string;
  placeholder: string;
  buttonLabel: string;
  note: string;
  tone: "light" | "accent" | "dark" | "yellow";
  layout: "inline" | "stacked";
  actionHref?: string;
  puck?: { isEditing?: boolean };
}

const BTN_BY_TONE: Record<LeadCaptureProps["tone"], BtnVariant> = {
  light: "primary",
  accent: "yellow",
  dark: "yellow",
  yellow: "dark",
};

export function LeadCaptureRender({
  heading,
  subtitle,
  placeholder,
  buttonLabel,
  note,
  tone,
  layout,
  actionHref,
  puck,
}: LeadCaptureProps) {
  return (
    <div className="p1-lead-capture p1-block">
      <div className="p1-lead-capture__card" data-tone={tone} data-layout={layout}>
        <h2 className="p1-lead-capture__heading">{heading}</h2>
        {subtitle && <p className="p1-lead-capture__subtitle">{subtitle}</p>}
        {/* Posts to the form action URL when set. To handle it yourself, add an onSubmit
          (needs "use client"); to show a result, render it from that state. */}
        <form className="p1-lead-capture__form" {...formAttrs(actionHref, puck?.isEditing)}>
          <input
            className="p1-lead-capture__field"
            type="email"
            name="email"
            required
            placeholder={placeholder}
            aria-label="Email address"
          />
          <Btn submit variant={BTN_BY_TONE[tone]}>{buttonLabel}</Btn>
        </form>
        {note && <div className="p1-lead-capture__note">{note}</div>}
      </div>
    </div>
  );
}
