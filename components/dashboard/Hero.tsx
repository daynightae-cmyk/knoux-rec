import HeroWorkspace from "./HeroWorkspace";
import { Icon, type IconName } from "./icons";
import type { CapabilityFacts } from "./capabilities";
import type { Locale } from "./services";
import type { PanelId } from "./panels";

/*
 * Dashboard hero.
 *
 * The four workflow chips and the four benefit lines are the only editorial claims on
 * this screen, and each one is bound either to a real surface or to a capability this
 * build actually implements. There is no "Enhance" chip, because no such surface exists;
 * the presentation chip opens the real camera and canvas compositor.
 */

type HeroProps = {
  locale: Locale;
  facts: CapabilityFacts;
  onNavigate: (target: PanelId) => void;
};

type Workflow = {
  id: PanelId;
  icon: IconName;
  accent: "record" | "blue" | "violet";
  title: Record<Locale, string>;
  caption: Record<Locale, string>;
};

const WORKFLOWS: Workflow[] = [
  { id: "capture", icon: "record", accent: "record", title: { en: "Record", ar: "سجّل" }, caption: { en: "Capture anything", ar: "التقط أي شيء" } },
  { id: "editor", icon: "scissors", accent: "violet", title: { en: "Edit", ar: "حرّر" }, caption: { en: "Trim and refine", ar: "قص وحسّن" } },
  { id: "camera", icon: "sparkles", accent: "violet", title: { en: "Present", ar: "اعرض" }, caption: { en: "Camera and canvas", ar: "الكاميرا واللوحة" } },
  { id: "export", icon: "exports", accent: "blue", title: { en: "Deliver", ar: "سلّم" }, caption: { en: "Export and verify", ar: "صدّر وتحقق" } },
];

const BENEFITS: { icon: IconName; title: Record<Locale, string> }[] = [
  { icon: "camera", title: { en: "Local Screen Capture", ar: "التقاط شاشة محلي" } },
  { icon: "database", title: { en: "Incremental Recording", ar: "تسجيل تدريجي" } },
  { icon: "trim", title: { en: "Project Editing", ar: "تحرير المشاريع" } },
  { icon: "verified", title: { en: "Verified Export", ar: "تصدير موثّق" } },
];

const COPY = {
  en: { label: "KNOuX REC", subtitle: "A local recording workstation for creators, educators and professionals." },
  ar: { label: "KNOuX REC", subtitle: "محطة تسجيل محلية للمبدعين والمعلمين والمهنيين." },
} as const;

export function formatElapsed(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export default function Hero({ locale, facts, onNavigate }: HeroProps) {
  const copy = COPY[locale];
  const recording = facts.recorderState === "recording";
  const sessionLive = recording || facts.recorderState === "paused" || facts.recorderState === "finalizing";
  const elapsed = recording ? formatElapsed(facts.elapsedSeconds) : null;

  return (
    <section className={`dash-hero${sessionLive ? " is-recording" : ""}`} aria-label={copy.label}>
      <div className="hero-copy">
        <p className="hero-eyebrow">{locale === "ar" ? "مرحباً بك في" : "Welcome to"}</p>
        <h1 className="hero-title">
          <span className="hero-wordmark">KNOuX</span>
          <span className="hero-rec-capsule">REC</span>
        </h1>
        <p className="hero-subtitle">{copy.subtitle}</p>
        <nav className="hero-workflows" aria-label={locale === "ar" ? "سير العمل" : "Workflow"}>
          {WORKFLOWS.map((workflow) => (
            <button key={workflow.id} type="button" className="hero-chip" onClick={() => onNavigate(workflow.id)}>
              <span className={`hero-chip-icon accent-${workflow.accent}`}>
                <Icon name={workflow.icon} size={15} />
              </span>
              <span className="hero-chip-text">
                <b>{workflow.title[locale]}</b>
                <small>{workflow.caption[locale]}</small>
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="hero-visual">
        <HeroWorkspace active={sessionLive} elapsed={elapsed} sourceLabel={sessionLive ? facts.selectedSourceLabel : null} />
      </div>

      <ul className="hero-benefits" aria-label={locale === "ar" ? "ما يقدمه KNOuX REC" : "What KNOuX REC provides"}>
        {BENEFITS.map((benefit) => (
          <li key={benefit.icon}>
            <span className="benefit-icon">
              <Icon name={benefit.icon} size={15} />
            </span>
            <span>{benefit.title[locale]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
