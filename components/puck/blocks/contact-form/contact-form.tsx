import { useId } from "react";
import { Section, SectionHead, type SectionTone, type SectionWidth } from "@/lib/section";
import { formAttrs } from "@/lib/safe-url";
import "./contact-form.css";

export interface ContactFormLabel {
  label: string;
}
export interface ContactFormProps {
  eyebrow: string;
  heading: string;
  subtitle: string;
  fields: ContactFormLabel[];
  reasons: ContactFormLabel[];
  reason: "off" | "on";
  reasonLabel: string;
  consent: "off" | "on";
  consentText: string;
  step1: string;
  step2: string;
  btn: string;
  layout: "stacked" | "2-col + textarea" | "inline single" | "stepper";
  tone: SectionTone;
  width: SectionWidth;
  actionHref?: string;
  puck?: { isEditing?: boolean };
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const labels = (a?: ContactFormLabel[]) => (a || []).map((x) => x?.label?.trim()).filter(Boolean) as string[];

function Field({ id, name, label, kind }: { id: string; name: string; label: string; kind: "text" | "email" | "area" }) {
  return (
    <div className="p1-contact-form__field" data-kind={kind}>
      <label className="p1-contact-form__label" htmlFor={id}>{label}</label>
      {kind === "area" ? (
        <textarea className="p1-contact-form__control" id={id} name={name} rows={4} />
      ) : (
        <input className="p1-contact-form__control" id={id} name={name} type={kind} required={kind === "email"} />
      )}
    </div>
  );
}

export function ContactFormRender({
  eyebrow, heading, subtitle, fields, reasons, reason, reasonLabel, consent, consentText, step1, step2, btn, layout = "2-col + textarea", tone, width, actionHref, puck,
}: ContactFormProps) {
  const uid = useId();
  const all = labels(fields);
  const isMsg = (x: string) => /message/i.test(x);
  // Input names are label slugs. "reason" and "consent" are taken by the fixed
  // fields, and an empty or repeated slug gets a suffix, so names never collide.
  const taken = new Set(["reason", "consent"]);
  const entries = all.map((label, i) => {
    const base = slug(label) || `field-${i}`;
    let name = base;
    for (let n = 2; taken.has(name); n++) name = `${base}-${n}`;
    taken.add(name);
    return { label, name };
  });
  const rest = entries.filter((e) => !isMsg(e.label));
  const msg = entries.filter((e) => isMsg(e.label));
  const reasonList = labels(reasons);
  const showReason = reason === "on" && reasonList.length > 0;
  const kindOf = (x: string) => (/e-?mail/i.test(x) ? "email" : "text");
  const fid = (i: number) => `${uid}-f${i}`;
  const button = btn ? <button type="submit" className="p1-contact-form__btn">{btn}</button> : null;

  const reasonField = showReason && (
    <div className="p1-contact-form__field">
      <label className="p1-contact-form__label" htmlFor={`${uid}-reason`}>{reasonLabel}</label>
      <select className="p1-contact-form__control" id={`${uid}-reason`} name="reason">
        {reasonList.map((r) => <option key={r}>{r}</option>)}
      </select>
    </div>
  );
  const consentField = consent === "on" && (
    <div className="p1-contact-form__consent">
      <input type="checkbox" id={`${uid}-consent`} name="consent" />
      <label htmlFor={`${uid}-consent`}>{consentText}</label>
    </div>
  );
  const restFields = rest.map((x, i) => <Field key={i} id={fid(i)} name={x.name} label={x.label} kind={kindOf(x.label)} />);
  const msgFields = msg.map((x, i) => <Field key={i} id={fid(100 + i)} name={x.name} label={x.label} kind="area" />);

  let body;
  if (layout === "inline single") {
    const email = entries.find((e) => kindOf(e.label) === "email") ?? { label: "Work email", name: "work-email" };
    body = (
      <div className="p1-contact-form__inline">
        <Field id={fid(0)} name={email.name} label={email.label} kind="email" />
        {button}
      </div>
    );
  } else if (layout === "stepper") {
    body = (
      <>
        <fieldset className="p1-contact-form__step">
          <legend className="p1-contact-form__legend"><span className="p1-contact-form__num">1</span>{step1}</legend>
          <div className="p1-contact-form__grid">{restFields}</div>
        </fieldset>
        <fieldset className="p1-contact-form__step">
          <legend className="p1-contact-form__legend"><span className="p1-contact-form__num">2</span>{step2}</legend>
          {reasonField}
          {msgFields}
        </fieldset>
        {consentField}
        <div>{button}</div>
      </>
    );
  } else {
    body = (
      <>
        <div className="p1-contact-form__grid">{restFields}</div>
        {reasonField}
        {msgFields}
        {consentField}
        <div>{button}</div>
      </>
    );
  }

  return (
    <Section tone={tone} width={width}>
      <SectionHead eyebrow={eyebrow} heading={heading} subtitle={subtitle} />
      <div className="p1-contact-form" data-layout={slug(layout)}>
        {/* Posts to the Form action URL when set. To handle it yourself, add an
            onSubmit here (needs "use client"); to show a result, render it from that state. */}
        <form className="p1-contact-form__form" {...formAttrs(actionHref, puck?.isEditing)}>{body}</form>
      </div>
    </Section>
  );
}
