import { BrandMark } from "./BrandMark";
import { Icon } from "./icons";
import { describeStatus, type Locale } from "./services";
import { resolveShellStatus, type CapabilityFacts } from "./capabilities";
import { NAV_GROUPS, navGroupLabel, navItemLabel, type PanelId } from "./panels";

/*
 * Sidebar.
 *
 * Navigation is the real surface list, grouped by the domain each surface belongs to.
 * The footer is never a hardcoded "Ready": it is resolved from recorder state, storage
 * measurements, real recovery sessions and the real local media runtime.
 */

type SidebarProps = {
  locale: Locale;
  active: PanelId;
  facts: CapabilityFacts;
  onNavigate: (target: PanelId) => void;
};

export default function Sidebar({ locale, active, facts, onNavigate }: SidebarProps) {
  const status = describeStatus(resolveShellStatus(facts), locale);

  return (
    <aside className="app-sidebar" aria-label={locale === "ar" ? "تنقل KNOuX REC" : "KNOuX REC navigation"}>
      <div className="sidebar-brand">
        <BrandMark size={40} />
        <span className="brand-wordmark">
          <strong>KNOuX</strong>
          <span className="brand-rec">REC</span>
        </span>
      </div>

      <nav className="sidebar-nav">
        {NAV_GROUPS.map((group) => (
          <div key={group.id} className="nav-group">
            <p className="nav-group-label">{navGroupLabel(group.id, locale)}</p>
            <ul>
              {group.items.map((item) => {
                const current = item.id === active;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`nav-item${current ? " active" : ""}`}
                      onClick={() => onNavigate(item.id)}
                      aria-current={current ? "page" : undefined}
                    >
                      <span className="nav-item-icon">
                        <Icon name={item.icon} size={17} />
                      </span>
                      <span className="nav-item-label">{navItemLabel(item, locale)}</span>
                      {item.id === "capture" && facts.recorderState === "recording" ? <span className="nav-item-live" aria-hidden="true" /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={`sidebar-status tone-${status.tone}`} role="status" aria-live="polite">
        <span className="sidebar-status-head">
          <span className="status-dot" aria-hidden="true" />
          <strong>{status.label}</strong>
        </span>
        <p>{status.detail}</p>
      </div>
    </aside>
  );
}
