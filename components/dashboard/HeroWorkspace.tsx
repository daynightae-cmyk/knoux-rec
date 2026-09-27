import { useId } from "react";

/*
 * Decorative recording-workspace illustration for the dashboard hero.
 *
 * This is product illustration, not a live view. It carries no runtime values of its
 * own: the only numbers it can ever show are the real elapsed time and the real source
 * label handed to it while a recording is actually running. Idle, it stays clearly
 * illustrative.
 */

type HeroWorkspaceProps = {
  active: boolean;
  /** Real elapsed time while recording, already formatted by the caller. */
  elapsed: string | null;
  /** Real source name while recording, or null when idle. */
  sourceLabel: string | null;
};

const BLOCKS = [0, 1, 2, 3, 4, 5, 6, 7];
const WAVES = [10, 18, 26, 14, 30, 22, 12, 24, 16, 28, 20, 11, 25, 14, 19, 9, 17, 23];

export default function HeroWorkspace({ active, elapsed, sourceLabel }: HeroWorkspaceProps) {
  const id = useId().replace(/:/g, "");
  const sky = `sky-${id}`;
  const frame = `frame-${id}`;
  const block = `block-${id}`;
  const wave = `wave-${id}`;

  return (
    <div className={`hero-workspace${active ? " is-recording" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 420 226" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={sky} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#1b2f86" />
            <stop offset="55%" stopColor="#3b2a86" />
            <stop offset="100%" stopColor="#120a34" />
          </linearGradient>
          <linearGradient id={frame} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6f8bff" />
            <stop offset="100%" stopColor="#b06bff" />
          </linearGradient>
          <linearGradient id={block} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3d6dff" />
            <stop offset="100%" stopColor="#9d4dff" />
          </linearGradient>
          <linearGradient id={wave} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#4d8bff" />
          </linearGradient>
        </defs>

        {/* stacked rear panel */}
        <rect x="52" y="18" width="330" height="188" rx="14" fill="rgba(20,30,74,0.85)" stroke="rgba(120,140,255,0.22)" />

        {/* main screen */}
        <rect x="26" y="34" width="330" height="188" rx="14" fill="url(#sky)" stroke="rgba(140,160,255,0.4)" />
        <rect x="26" y="34" width="330" height="188" rx="14" fill="none" stroke={`url(#${frame})`} strokeWidth="1.4" opacity="0.75" />

        {/* illustrated scene inside the screen */}
        <path d="M26 158 L104 96 L164 146 L214 108 L282 158 Z" fill="rgba(9,14,38,0.72)" />
        <circle cx="262" cy="80" r="17" fill="rgba(190,120,255,0.34)" />
        <path d="M26 186 L120 128 L200 186 Z" fill="rgba(6,10,28,0.82)" />

        {/* record indicator, bound to the real recorder state */}
        <g className="hero-rec">
          <rect x="38" y="46" width="66" height="19" rx="9.5" fill="rgba(6,10,28,0.72)" stroke="rgba(255,110,140,0.5)" />
          <circle cx="50" cy="55.5" r="4.2" fill="#ff315a" />
          {elapsed ? <text x="60" y="59.4" fill="#ffd9e0" fontSize="10" fontFamily="Cascadia Mono, Consolas, monospace">{elapsed}</text> : <text x="60" y="59.4" fill="#ffd9e0" fontSize="9" fontFamily="Inter, Segoe UI, sans-serif" fontWeight="700">REC</text>}
        </g>

        {/* capture brackets */}
        <g stroke="rgba(226,234,255,0.75)" strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M44 78v-9a4 4 0 0 1 4-4h9" />
          <path d="M320 65h9a4 4 0 0 1 4 4v9" />
          <path d="M44 168v9a4 4 0 0 0 4 4h9" />
          <path d="M320 181h9a4 4 0 0 0 4-4v-9" />
        </g>

        {/* real source label, only while a recording is running */}
        {sourceLabel ? <text x="44" y="205" fill="rgba(200,214,255,0.85)" fontSize="9.5" fontFamily="Inter, Segoe UI, sans-serif">{sourceLabel.slice(0, 42)}</text> : null}

        {/* picture-in-picture frame */}
        <g>
          <rect x="252" y="48" width="94" height="58" rx="9" fill="rgba(11,18,48,0.94)" stroke={`url(#${frame})`} strokeWidth="1.4" />
          <rect x="259" y="55" width="80" height="44" rx="6" fill="rgba(60,40,140,0.5)" />
          <circle cx="288" cy="72" r="8" fill="rgba(214,196,255,0.72)" />
          <path d="M274 95a15 15 0 0 1 28 0Z" fill="rgba(214,196,255,0.62)" />
          <path d="M339 68l11-5v20l-11-5Z" fill="rgba(160,180,255,0.6)" />
        </g>

        {/* audio waveform strip */}
        <g className="hero-wave">
          <rect x="252" y="112" width="94" height="26" rx="7" fill="rgba(9,14,38,0.8)" stroke="rgba(120,140,255,0.22)" />
          {WAVES.map((height, index) => (
            <rect key={index} x={258 + index * 4.7} y={125 - height / 2} width="2.4" height={height} rx="1.2" fill={`url(#${wave})`} opacity={0.55 + (index % 3) * 0.16} />
          ))}
        </g>

        {/* timeline */}
        <g className="hero-timeline">
          <rect x="40" y="132" width="196" height="24" rx="7" fill="rgba(7,11,32,0.9)" stroke="rgba(120,140,255,0.24)" />
          {BLOCKS.map((blockIndex) => (
            <rect key={blockIndex} x={46 + blockIndex * 24} y="139" width="18" height="10" rx="3" fill={`url(#${block})`} opacity={0.32 + (blockIndex % 4) * 0.16} />
          ))}
          <path d="M150 134v20" stroke="#f7f9ff" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="150" cy="134" r="2.6" fill="#f7f9ff" />
        </g>

        {/* transport */}
        <g>
          <path d="M44 176.5 51.5 180.5 44 184.5Z" fill="rgba(200,214,255,0.8)" />
          <circle cx="66" cy="180.5" r="3.4" fill="rgba(200,214,255,0.6)" />
          <circle cx="80" cy="180.5" r="3.4" fill="rgba(200,214,255,0.45)" />
        </g>

        {/* deck */}
        <path d="M12 214h360l-14 10H26Z" fill="rgba(24,34,84,0.9)" stroke="rgba(120,140,255,0.3)" />
      </svg>
    </div>
  );
}
