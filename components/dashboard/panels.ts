import type { IconName } from "./icons";

/* Canonical surface list for the KNOuX REC application shell. */
export type PanelId = "dashboard" | "capture" | "library" | "editor" | "audio" | "camera" | "recovery" | "export" | "captions" | "settings";

export type Locale = "en" | "ar";

export type NavItem = {
  id: PanelId;
  label: string;
  icon: IconName;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

/*
 * Sidebar structure follows the reference ordering while keeping the real product
 * surfaces. Audio Studio and Camera Studio are grouped with the capture work they
 * configure, and Recovery, Exports and Captions form the delivery group.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "workstation",
    label: "Workstation",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "dashboard" },
      { id: "capture", label: "Record", icon: "record" },
      { id: "library", label: "Library", icon: "library" },
      { id: "editor", label: "Projects", icon: "projects" },
    ],
  },
  {
    id: "studio",
    label: "Studio",
    items: [
      { id: "audio", label: "Audio Studio", icon: "audio" },
      { id: "camera", label: "Camera Studio", icon: "camera" },
    ],
  },
  {
    id: "delivery",
    label: "Deliver",
    items: [
      { id: "recovery", label: "Recovery", icon: "recovery" },
      { id: "export", label: "Exports", icon: "exports" },
      { id: "captions", label: "Captions", icon: "captions" },
      { id: "settings", label: "Settings", icon: "settings" },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

/*
 * Navigation labels are localized, matching the rest of the shell. The label is the
 * user-facing name for a surface; `NavItem.label` above is the default English key.
 */
const NAV_LABELS: Record<Locale, Record<PanelId, string>> = {
  en: {
    dashboard: "Dashboard",
    capture: "Record",
    library: "Library",
    editor: "Projects",
    audio: "Audio Studio",
    camera: "Camera Studio",
    recovery: "Recovery",
    export: "Exports",
    captions: "Captions",
    settings: "Settings",
  },
  ar: {
    dashboard: "لوحة المعلومات",
    capture: "التسجيل",
    library: "المكتبة",
    editor: "المشاريع",
    audio: "استديو الصوت",
    camera: "استديو الكاميرا",
    recovery: "الاستعادة",
    export: "التصدير",
    captions: "التسميات",
    settings: "الإعدادات",
  },
};

const NAV_GROUP_LABELS: Record<Locale, Record<string, string>> = {
  en: { workstation: "Workstation", studio: "Studio", delivery: "Deliver" },
  ar: { workstation: "محطة العمل", studio: "الاستوديو", delivery: "التسليم" },
};

export function navLabel(panel: PanelId, locale: Locale = "en"): string {
  return NAV_LABELS[locale][panel];
}

export function navItemLabel(item: NavItem, locale: Locale): string {
  return NAV_LABELS[locale][item.id] ?? item.label;
}

export function navGroupLabel(groupId: string, locale: Locale): string {
  return NAV_GROUP_LABELS[locale][groupId] ?? groupId;
}
