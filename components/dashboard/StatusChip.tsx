import { Icon, type IconName } from "./icons";
import type { StatusTone } from "./capabilities";

/*
 * Status chip.
 *
 * The tone sets the colour, but the text is always rendered and always carries its own
 * meaning, so state is never communicated by colour alone. The leading glyph repeats the
 * category in a shape, which keeps the chip readable for colour-blind users and in
 * high-contrast modes.
 */

const TONE_ICON: Record<StatusTone, IconName> = {
  success: "check",
  active: "pulse",
  warning: "alert",
  danger: "cross",
  blocked: "blocked",
  neutral: "info",
};

export default function StatusChip({ tone, label, detail }: { tone: StatusTone; label: string; detail?: string }) {
  return (
    <span className={`status-chip tone-${tone}`} title={detail}>
      <Icon name={TONE_ICON[tone]} size={11} />
      <span>{label}</span>
    </span>
  );
}
