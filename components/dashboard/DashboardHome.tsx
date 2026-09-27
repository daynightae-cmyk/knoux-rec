import DashboardSection from "./DashboardSection";
import Hero from "./Hero";
import ServiceCard from "./ServiceCard";
import type { CapabilityFacts } from "./capabilities";
import { SERVICE_SECTIONS, type Locale } from "./services";
import type { PanelId } from "./panels";

/*
 * Dashboard home.
 *
 * The information architecture is the five real service domains. Nothing here decides
 * readiness, and nothing here reaches past the shell: every card is a button that opens
 * the real surface that owns the capability.
 */

export default function DashboardHome({ locale, facts, onNavigate }: { locale: Locale; facts: CapabilityFacts; onNavigate: (target: PanelId) => void }) {
  return (
    <div className="dash-home">
      <Hero locale={locale} facts={facts} onNavigate={onNavigate} />
      <div className="dash-grid">
        {SERVICE_SECTIONS.map((section) => (
          <DashboardSection
            key={section.id}
            icon={section.icon}
            accent={section.accent}
            span={section.span}
            title={section.text[locale].title}
            description={section.text[locale].description}
          >
            <div className={`service-grid grid-${section.grid}`}>
              {section.services.map((service) => (
                <ServiceCard key={service.id} service={service} facts={facts} locale={locale} onOpen={onNavigate} />
              ))}
            </div>
          </DashboardSection>
        ))}
      </div>
    </div>
  );
}
