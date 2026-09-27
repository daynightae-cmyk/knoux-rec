import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";

export type DashboardSectionProps = {
  icon: IconName;
  title: string;
  description: string;
  accent: "blue" | "violet";
  span: "half" | "wide";
  children: ReactNode;
};

/** Reusable section panel: one header shape, one border, one grid contract. */
export default function DashboardSection({ icon, title, description, accent, span, children }: DashboardSectionProps) {
  return (
    <section className={`dash-section accent-${accent} span-${span}`} aria-label={title}>
      <header className="dash-section-head">
        <span className="dash-section-icon">
          <Icon name={icon} size={18} />
        </span>
        <span className="dash-section-heading">
          <h2>{title}</h2>
          <p>{description}</p>
        </span>
      </header>
      {children}
    </section>
  );
}
