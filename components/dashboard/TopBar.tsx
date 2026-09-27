import { BrandMark } from "./BrandMark";
import { Icon, type IconName } from "./icons";
import type { Locale } from "./services";
import { navLabel, type PanelId } from "./panels";

/*
 * Top bar.
 *
 * The packaged window keeps the native Windows title bar, so this bar deliberately
 * draws no window chrome of its own. The right side only carries state that really
 * exists: an outstanding message count, the runtime pill and the language switch.
 */

type TopBarProps = {
  locale: Locale;
  active: PanelId;
  context: string | null;
  isDesktop: boolean;
  pendingMessages: number;
  onNavigate: (target: PanelId) => void;
  onClearMessages: () => void;
  onToggleLocale: () => void;
};

const WORKFLOW_LINKS: { id: PanelId; label: string; icon: IconName }[] = [
  { id: "capture", label: "Record", icon: "record" },
  { id: "editor", label: "Edit", icon: "scissors" },
  { id: "camera", label: "Present", icon: "sparkles" },
  { id: "export", label: "Deliver", icon: "exports" },
];

export default function TopBar({ locale, active, context, isDesktop, pendingMessages, onNavigate, onClearMessages, onToggleLocale }: TopBarProps) {
  return (
    <header className="app-topbar">
      <div className="topbar-brand">
        <BrandMark size={22} />
        <span className="topbar-wordmark">KNOuX <span className="brand-rec">REC</span></span>
        <span className="topbar-workflow" aria-hidden="true">
          {WORKFLOW_LINKS.map((link, index) => (
            <span key={link.id} className="topbar-workflow-item">
              {index > 0 ? <span className="topbar-separator">·</span> : null}
              <button type="button" onClick={() => onNavigate(link.id)} tabIndex={-1}>
                {link.label}
              </button>
            </span>
          ))}
        </span>
      </div>

      <div className="topbar-context">
        <span className="topbar-panel">{navLabel(active, locale)}</span>
        {context ? <span className="topbar-context-value">{context}</span> : null}
      </div>

      <div className="topbar-actions">
        {pendingMessages > 0 ? (
          <button type="button" className="topbar-messages" onClick={onClearMessages} aria-label={`${pendingMessages} pending message${pendingMessages === 1 ? "" : "s"}`}>
            <Icon name="alert" size={15} />
            <span className="topbar-messages-count">{pendingMessages}</span>
          </button>
        ) : null}
        <span className={`runtime-pill ${isDesktop ? "connected" : "disconnected"}`}>
          <span className="runtime-dot" aria-hidden="true" />
          {isDesktop ? (locale === "ar" ? "سطح المكتب" : "Desktop") : (locale === "ar" ? "المتصفح" : "Browser")}
        </span>
        <button type="button" className="language-button" onClick={onToggleLocale}>
          {locale === "en" ? "العربية" : "English"}
        </button>
      </div>
    </header>
  );
}
