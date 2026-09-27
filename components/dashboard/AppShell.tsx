import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import type { CapabilityFacts } from "./capabilities";
import type { Locale } from "./services";
import type { PanelId } from "./panels";

/*
 * Canonical application shell.
 *
 * One sidebar, one top bar, one scrolling content region. Every existing surface is
 * rendered inside this shell, so there is never a second navigation system or a second
 * dashboard route layered over the product.
 */

type AppShellProps = {
  locale: Locale;
  direction: "rtl" | "ltr";
  active: PanelId;
  facts: CapabilityFacts;
  context: string | null;
  pendingMessages: number;
  onNavigate: (target: PanelId) => void;
  onClearMessages: () => void;
  onToggleLocale: () => void;
  children: ReactNode;
};

export default function AppShell({ locale, direction, active, facts, context, pendingMessages, onNavigate, onClearMessages, onToggleLocale, children }: AppShellProps) {
  return (
    <div className="app-frame" dir={direction}>
      <Sidebar locale={locale} active={active} facts={facts} onNavigate={onNavigate} />
      <div className="app-main">
        <TopBar
          locale={locale}
          active={active}
          context={context}
          isDesktop={facts.isDesktop}
          pendingMessages={pendingMessages}
          onNavigate={onNavigate}
          onClearMessages={onClearMessages}
          onToggleLocale={onToggleLocale}
        />
        <main className="app-content" id="knoux-main">
          {children}
        </main>
      </div>
    </div>
  );
}
