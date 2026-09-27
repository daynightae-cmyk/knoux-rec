import { useId } from "react";

/*
 * KNOuX REC circular brand mark.
 *
 * Reproduced as scalable inline SVG rather than a bitmap so the sidebar, top bar and
 * any splash surface share one asset at any density, with no remote request and no
 * stretched proportions. The mark follows the reference composition: a neon ring, a
 * camera frame with a record indicator, and an audio waveform strip.
 */

export function BrandMark({ size = 44 }: { size?: number }) {
  const id = useId().replace(/:/g, "");
  const ring = `ring-${id}`;
  const face = `face-${id}`;
  const bar = `bar-${id}`;
  const lens = `lens-${id}`;

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="KNOuX REC">
      <defs>
        <linearGradient id={ring} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3d86ff" />
          <stop offset="46%" stopColor="#7137ff" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
        <radialGradient id={face} cx="50%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#1b2a63" />
          <stop offset="70%" stopColor="#0a1030" />
          <stop offset="100%" stopColor="#060a1c" />
        </radialGradient>
        <linearGradient id={bar} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#bc3cff" />
          <stop offset="55%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#3578ff" />
        </linearGradient>
        <radialGradient id={lens} cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#ff6b86" />
          <stop offset="100%" stopColor="#e01f45" />
        </radialGradient>
      </defs>

      <circle cx="60" cy="60" r="56" fill="none" stroke={`url(#${ring})`} strokeWidth="5" opacity="0.28" />
      <circle cx="60" cy="60" r="52" fill="none" stroke={`url(#${ring})`} strokeWidth="3" />
      <circle cx="60" cy="60" r="44" fill={`url(#${face})`} stroke="rgba(140,160,255,0.28)" strokeWidth="1.5" />

      {/* camera frame corner brackets */}
      <g stroke="rgba(226,234,255,0.92)" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M33 41v-6a2 2 0 0 1 2-2h6" />
        <path d="M79 33h6a2 2 0 0 1 2 2v6" />
        <path d="M33 71v6a2 2 0 0 0 2 2h6" />
        <path d="M79 79h6a2 2 0 0 0 2-2v-6" />
      </g>

      {/* record indicator */}
      <circle cx="41" cy="41" r="4.4" fill="#ff315a" />
      <circle cx="41" cy="41" r="7.6" fill="none" stroke="#ff315a" strokeWidth="1.4" opacity="0.5" />

      {/* camera body and lens */}
      <rect x="42" y="42" width="30" height="25" rx="7" fill="#1a2560" stroke="rgba(190,200,255,0.5)" strokeWidth="1.6" />
      <path d="M72 50.5 85 45v22l-13-5.5Z" fill="#24327a" stroke="rgba(190,200,255,0.42)" strokeWidth="1.5" />
      <circle cx="57" cy="54.5" r="9" fill="none" stroke="rgba(214,224,255,0.7)" strokeWidth="1.6" />
      <circle cx="57" cy="54.5" r="5" fill={`url(#${lens})`} />

      {/* waveform strip and playhead */}
      <rect x="30" y="78" width="60" height="14" rx="5" fill="rgba(11,18,48,0.85)" stroke="rgba(140,160,255,0.3)" strokeWidth="1.2" />
      <g fill={`url(#${bar})`}>
        <rect x="35" y="83" width="2.4" height="4" rx="1.2" />
        <rect x="40" y="80" width="2.4" height="10" rx="1.2" />
        <rect x="45" y="82" width="2.4" height="6" rx="1.2" />
        <rect x="50" y="79" width="2.4" height="12" rx="1.2" />
        <rect x="55" y="82.5" width="2.4" height="5" rx="1.2" />
        <rect x="60" y="80.5" width="2.4" height="9" rx="1.2" />
        <rect x="65" y="83" width="2.4" height="4" rx="1.2" />
        <rect x="70" y="79.5" width="2.4" height="11" rx="1.2" />
      </g>
      <rect x="76" y="78" width="8" height="14" rx="3" fill="rgba(53,120,255,0.35)" stroke="rgba(180,196,255,0.5)" strokeWidth="1" />
      <path d="M60 76v18" stroke="#f7f9ff" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="60" cy="76" r="2.2" fill="#f7f9ff" />
    </svg>
  );
}

export function BrandWordmark({ size = 44, compact = false }: { size?: number; compact?: boolean }) {
  return (
    <span className={`brand-lockup${compact ? " compact" : ""}`}>
      <BrandMark size={size} />
      <span className="brand-wordmark">
        <strong>KNOuX</strong>
        <span className="brand-rec">REC</span>
      </span>
    </span>
  );
}
