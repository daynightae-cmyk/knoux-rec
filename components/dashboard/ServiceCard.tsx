import { Icon } from "./icons";
import StatusChip from "./StatusChip";
import { describeStatus, type Locale, type ServiceDefinition } from "./services";
import type { CapabilityFacts } from "./capabilities";
import type { PanelId } from "./panels";

/*
 * One reusable service card for the whole dashboard.
 *
 * The card resolves its own status from the capability facts, so a card can never claim
 * to be ready. Its accessible name is built from the resolved status, which means a
 * screen reader announces the real state and not just the title.
 */

type ServiceCardProps = {
  service: ServiceDefinition;
  facts: CapabilityFacts;
  locale: Locale;
  onOpen: (target: PanelId) => void;
};

export default function ServiceCard({ service, facts, locale, onOpen }: ServiceCardProps) {
  const status = describeStatus(service.resolve(facts), locale);
  const copy = service.text[locale];

  return (
    <button
      type="button"
      className={`service-card variant-${service.variant} accent-${service.accent}`}
      onClick={() => onOpen(service.target)}
      aria-label={`${copy.title}. ${status.label}. ${status.detail}`}
      title={service.technical[locale]}
    >
      <span className="service-icon">
        <Icon name={service.icon} size={19} />
      </span>
      <span className="service-body">
        <span className="service-title">{copy.title}</span>
        <span className="service-description">{copy.description}</span>
        <StatusChip tone={status.tone} label={status.label} detail={status.detail} />
      </span>
      <Icon name="chevron" size={15} />
    </button>
  );
}
