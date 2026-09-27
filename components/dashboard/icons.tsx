import type { ReactNode } from "react";

/*
 * KNOuX REC line icon set.
 *
 * Every glyph is authored inline so the packaged renderer never performs a remote
 * asset request and the desktop content security policy stays satisfied. All icons
 * share a 24x24 view box, a 1.6 stroke, rounded caps and simple geometry so the
 * service cards read as one visual family.
 */

const dot = (cx: number, cy: number, r: number) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />;

const paths = {
  /* Navigation */
  dashboard: <path d="M3.4 10.6 12 3.6l8.6 7M5.9 9.3V20.4h12.2V9.3M9.8 20.4v-6.1h4.4v6.1" />,
  record: <><circle cx="12" cy="12" r="6.4" />{dot(12, 12, 2.6)}</>,
  library: <><ellipse cx="12" cy="6.2" rx="7" ry="2.7" /><path d="M5 6.2v11.6c0 1.5 3.1 2.7 7 2.7s7-1.2 7-2.7V6.2M5 12c0 1.5 3.1 2.7 7 2.7s7-1.2 7-2.7" /></>,
  projects: <path d="M3 7.6A2.4 2.4 0 0 1 5.4 5.2h3.3l2 2.4h7.9A2.4 2.4 0 0 1 21 10v7.2a2.4 2.4 0 0 1-2.4 2.4H5.4A2.4 2.4 0 0 1 3 17.2Z" />,
  recovery: <path d="M3.6 12a8.4 8.4 0 1 0 2.8-6.3L3.6 8.3M3.6 3.8v4.5h4.5" />,
  exports: <path d="M12 15.6V4.2M12 4.2 8.2 8M12 4.2 15.8 8M4 14.6v3.8a2.4 2.4 0 0 0 2.4 2.4h11.2a2.4 2.4 0 0 0 2.4-2.4v-3.8" />,
  captions: <><rect x="3.2" y="6.4" width="17.6" height="11.2" rx="2.2" /><path d="M10.3 10.2a2.6 2.6 0 1 0 0 3.6M17.2 10.2a2.6 2.6 0 1 0 0 3.6" /></>,
  audio: <path d="M3.2 12h2.6l2-6.2 3 13.4 3-9.6 1.7 4.6h5.3" />,
  camera: <><rect x="2.8" y="6.4" width="12" height="11.2" rx="2.2" /><path d="m14.8 10.6 5.6-2.6v7.6l-5.6-2.6Z" /></>,
  settings: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2.9v2.2M12 18.9v2.2M2.9 12h2.2M18.9 12h2.2M5.5 5.5l1.6 1.6M16.9 16.9l1.6 1.6M18.5 5.5l-1.6 1.6M7.1 16.9l-1.6 1.6" /></>,
  chevron: <path d="m9.6 5.6 6.4 6.4-6.4 6.4" />,

  /* Capture Studio */
  monitor: <><rect x="2.8" y="4.4" width="18.4" height="12.4" rx="2.2" /><path d="M8.6 20.4h6.8M12 16.8v3.6" /></>,
  window: <><rect x="3" y="5.2" width="18" height="13.6" rx="2.2" /><path d="M3 9.2h18" />{dot(6.2, 7.2, 0.75)}{dot(8.7, 7.2, 0.75)}</>,
  region: <rect x="3.4" y="5.4" width="17.2" height="13.2" rx="2.2" strokeDasharray="3.4 3" />,
  cameraPip: <><rect x="2.8" y="6.6" width="11.6" height="10.8" rx="2.2" /><path d="m14.4 10.6 5.8-2.6v8.4l-5.8-2.6Z" /><circle cx="8.6" cy="10.4" r="1.7" /><path d="M5.9 15.2a2.8 2.8 0 0 1 5.4 0" /></>,

  /* Audio Engine */
  microphone: <><rect x="9.2" y="3.2" width="5.6" height="9.6" rx="2.8" /><path d="M5.8 11.2a6.2 6.2 0 0 0 12.4 0M12 17.4v3.4M9 20.8h6" /></>,
  speaker: <><path d="M3.8 9.4h3.3L12 5.4v13.2l-4.9-4H3.8Z" /><path d="M15.4 9.6a3.4 3.4 0 0 1 0 4.8M18 7a7 7 0 0 1 0 10" /></>,
  database: <><ellipse cx="12" cy="6.2" rx="7" ry="2.7" /><path d="M5 6.2v11.6c0 1.5 3.1 2.7 7 2.7s7-1.2 7-2.7V6.2" /><path d="M5 12c0 1.5 3.1 2.7 7 2.7s7-1.2 7-2.7" /></>,
  shield: <path d="M12 3.2 19 6v5.6c0 4.2-2.9 7.5-7 9.2-4.1-1.7-7-5-7-9.2V6Z" />,

  /* Project & Recovery */
  fileText: <><path d="M13.4 3.4H7A2 2 0 0 0 5 5.4v13.2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9Z" /><path d="M13.4 3.4V9H19M8.4 13h7.2M8.4 16.4h4.6" /></>,
  thumbnail: <><rect x="3.2" y="4.8" width="17.6" height="14.4" rx="2.2" /><circle cx="8.8" cy="9.6" r="1.5" /><path d="m4 17.6 6-5.4 3.2 3 2.6-2.2 4.2 3.6" /></>,

  /* Library */
  search: <><circle cx="10.9" cy="10.9" r="6.2" /><path d="m15.5 15.5 4.2 4.2" /></>,
  sorting: <><path d="M3.8 6.6h11.4M3.8 11.4h8.2M3.8 16.2h5" /><path d="M17.4 5.2v13.4M17.4 18.6l3-3M17.4 18.6l-3-3" /></>,

  /* Edit & Deliver */
  trim: <path d="M6.4 2.6v14.8h14.8M2.6 6.4h14.8v14.8" />,
  zoom: <><circle cx="10.9" cy="10.9" r="6.2" /><path d="m15.5 15.5 4.2 4.2M10.9 8.2v5.4M8.2 10.9h5.4" /></>,
  srt: <><path d="M13.4 3.4H7A2 2 0 0 0 5 5.4v13.2a2 2 0 0 0 2 2h4" /><path d="M13.4 3.4V9H19M8.4 13.4h5.2M8.4 16.8h3.4" /><path d="M17 12.4v5.2M14.9 15.5 17 17.6l2.1-2.1" /></>,
  formats: <><rect x="2.8" y="5" width="18.4" height="14" rx="2.2" /><path d="M7.6 5v14M16.4 5v14M2.8 9.4h4.8M2.8 14.6h4.8M16.4 9.4h4.8M16.4 14.6h4.8" /></>,
  terminal: <><rect x="2.8" y="4.4" width="18.4" height="15.2" rx="2.4" /><path d="m7.4 9.6 2.8 2.6-2.8 2.6M12.8 15.2h4" /></>,
  verified: <><path d="M12 3.2 19 6v5.6c0 4.2-2.9 7.5-7 9.2-4.1-1.7-7-5-7-9.2V6Z" /><path d="m8.8 11.9 2.3 2.4 4.3-4.7" /></>,

  /* Hero workflow + benefits */
  scissors: <><circle cx="5.6" cy="18.4" r="2.3" /><circle cx="18.4" cy="18.4" r="2.3" /><path d="M7.3 16.7 17.2 4.4M16.7 16.7 6.8 4.4" />{dot(12, 11.4, 1.15)}</>,
  sparkles: <><path d="m10.6 3.4 1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4L4.6 9.4l4.4-1.6Z" /><path d="m17.4 14.6.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9Z" /></>,
  layers: <><path d="M12 3.4 21 7.8l-9 4.4-9-4.4Z" /><path d="m3 12.6 9 4.4 9-4.4" /></>,
  wrench: <path d="M15.3 3.4a5.3 5.3 0 0 0-5.7 7L3.7 16.3a2 2 0 0 0 2.8 2.8l5.9-5.9a5.3 5.3 0 0 0 7-5.7l-3 3-2.6-.7-.7-2.6Z" />,

  /* Status glyphs */
  check: <path d="m4.8 12.4 4.6 4.6L19.2 7.2" />,
  pulse: <><circle cx="12" cy="12" r="7.6" />{dot(12, 12, 3)}</>,
  alert: <><path d="M12 4.2 21 19.8H3Z" /><path d="M12 9.8v4.2M12 16.8h.01" /></>,
  cross: <><circle cx="12" cy="12" r="8.4" /><path d="m9.2 9.2 5.6 5.6M14.8 9.2l-5.6 5.6" /></>,
  blocked: <><circle cx="12" cy="12" r="8.4" /><path d="M8.4 12h7.2" /></>,
  info: <><circle cx="12" cy="12" r="8.4" /><path d="M12 11.2v5.4M12 7.8h.01" /></>,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
