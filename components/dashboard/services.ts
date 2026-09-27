import type { CapabilityFacts, ResolvedStatus, StatusKey, StatusTone } from "./capabilities";
import {
  STATUS_META,
  resolveIncrementalRecording,
  resolveMediaRuntime,
  resolveStorageProtection,
  resolveWasapi,
} from "./capabilities";
import type { IconName } from "./icons";
import type { Locale, PanelId } from "./panels";

export type { Locale };
export type ServiceAccent = "blue" | "violet";
export type ServiceVariant = "standard" | "compact" | "horizontal";

/*
 * Service descriptors.
 *
 * A descriptor is metadata only: identity, copy, icon, accent and the real surface it
 * opens. It never carries a readiness flag. Readiness is always produced by `resolve`,
 * which reads the capability facts handed to it, so a descriptor can never assert that
 * something is ready.
 */

export type ServiceText = { title: string; description: string };

export type ServiceDefinition = {
  id: string;
  target: PanelId;
  icon: IconName;
  accent: ServiceAccent;
  variant: ServiceVariant;
  /** Technical explanation surfaced on demand, for example the native runtime behind a feature. */
  technical: Record<Locale, string>;
  text: Record<Locale, ServiceText>;
  resolve: (facts: CapabilityFacts) => ResolvedStatus;
};

export type ServiceSection = {
  id: string;
  icon: IconName;
  accent: ServiceAccent;
  span: "half" | "wide";
  /** Column contract for the section's service grid. */
  grid: "two" | "three" | "strip";
  text: Record<Locale, { title: string; description: string }>;
  services: ServiceDefinition[];
};

const desktopOnly = (): ResolvedStatus => ({ key: "desktopOnly" });

/* Shared resolvers. Every one of them reads only real recorded or measured state. */

const sourceStatus = (kind: "screen" | "window") => (facts: CapabilityFacts): ResolvedStatus => {
  if (!facts.isDesktop) return desktopOnly();
  const count = kind === "screen" ? facts.screenSources : facts.windowSources;
  if (count === 0) return { key: kind === "screen" ? "noDisplaySource" : "noWindowSource" };
  return { key: kind === "screen" ? "displaySources" : "windowSources", values: [count] };
};

const regionStatus = (facts: CapabilityFacts): ResolvedStatus => {
  if (!facts.isDesktop) return desktopOnly();
  if (!facts.regionSelected) return { key: "regionAvailable" };
  return facts.regionLabel
    ? { key: "regionSet", detail: `Selected region: ${facts.regionLabel}` }
    : { key: "regionSet" };
};

const cameraStatus = (facts: CapabilityFacts): ResolvedStatus => {
  if (!facts.isDesktop) return desktopOnly();
  if (facts.cameras === 0) return { key: "noCamera" };
  if (facts.cameraEnabled) return { key: "cameraActive" };
  return { key: "camerasDetected", values: [facts.cameras] };
};

const microphoneStatus = (facts: CapabilityFacts): ResolvedStatus => {
  if (!facts.isDesktop) return desktopOnly();
  if (facts.microphones === 0) return { key: "noMicrophone" };
  if (facts.microphoneEnabled) return { key: "microphoneActive" };
  return { key: "microphonesDetected", values: [facts.microphones] };
};

const recoveryStatus = (facts: CapabilityFacts): ResolvedStatus => {
  if (!facts.isDesktop) return desktopOnly();
  if (facts.recoverableSessions > 0) return { key: "recoveryAvailable", values: [facts.recoverableSessions] };
  if (facts.recoverySessions > 0) return { key: "recoveryBlocked", values: [facts.recoverySessions] };
  return { key: "noRecovery" };
};

const thumbnailStatus = (facts: CapabilityFacts): ResolvedStatus => {
  if (!facts.isDesktop) return desktopOnly();
  if (facts.mediaAvailable === false) return { key: "mediaUnavailable" };
  if (facts.recordings === 0) return { key: "thumbnailsNoSource" };
  return { key: "thumbnailsReady", values: [facts.thumbnailedRecordings, facts.recordings] };
};

const projectStatus = (facts: CapabilityFacts): ResolvedStatus => {
  if (!facts.isDesktop) return desktopOnly();
  if (facts.recordings === 0) return { key: "noRecordings" };
  return { key: facts.projectOpen ? "projectOpen" : "projectLocal" };
};

/** Project-backed services all require at least one finalized recording to act on. */
const requiresRecording = (key: StatusKey) => (facts: CapabilityFacts): ResolvedStatus => {
  if (!facts.isDesktop) return desktopOnly();
  if (facts.recordings === 0) return { key: "noRecordings" };
  return { key };
};

const srtStatus = (facts: CapabilityFacts): ResolvedStatus => {
  if (!facts.isDesktop) return desktopOnly();
  if (facts.captionSegments === 0) return { key: "noCaptions" };
  return { key: "captionsReady", values: [facts.captionSegments] };
};

const mediaBacked = (ready: StatusKey) => (facts: CapabilityFacts): ResolvedStatus => {
  if (!facts.isDesktop) return desktopOnly();
  return resolveMediaRuntime(facts, ready);
};

const libraryStatus = (key: StatusKey) => (facts: CapabilityFacts): ResolvedStatus =>
  facts.isDesktop ? { key } : desktopOnly();

export const SERVICES: ServiceDefinition[] = [
  /* Capture Studio */
  {
    id: "screen-capture",
    target: "capture",
    icon: "monitor",
    accent: "blue",
    variant: "standard",
    technical: {
      en: "Records a Windows display through the packaged desktop capturer.",
      ar: "يسجّل شاشة ويندوز عبر أداة الالتقاط المضمّنة.",
    },
    resolve: sourceStatus("screen"),
    text: {
      en: { title: "Screen Capture", description: "Record your entire display" },
      ar: { title: "التقاط الشاشة", description: "سجّل شاشتك بالكامل" },
    },
  },
  {
    id: "window-capture",
    target: "capture",
    icon: "window",
    accent: "blue",
    variant: "standard",
    technical: {
      en: "Records one application window instead of the whole desktop.",
      ar: "يسجّل نافذة تطبيق واحداً بدلاً من سطح المكتب الكامل.",
    },
    resolve: sourceStatus("window"),
    text: {
      en: { title: "Window Capture", description: "Record a single application window" },
      ar: { title: "التقاط النافذة", description: "سجّل نافذة تطبيق واحدة" },
    },
  },
  {
    id: "region-capture",
    target: "capture",
    icon: "region",
    accent: "violet",
    variant: "standard",
    technical: {
      en: "A transparent desktop overlay converts the drawn selection into display coordinates.",
      ar: "طبقة شفافة على سطح المكتب تحوّل المنطقة المرسومة إلى إحداثيات العرض.",
    },
    resolve: regionStatus,
    text: {
      en: { title: "Region Capture", description: "Select a custom screen region" },
      ar: { title: "التقاط المنطقة", description: "اختر منطقة مخصصة من الشاشة" },
    },
  },
  {
    id: "camera-pip",
    target: "camera",
    icon: "cameraPip",
    accent: "violet",
    variant: "standard",
    technical: {
      en: "The camera track is composited into the recording by a canvas compositor before encoding.",
      ar: "يُدمج مسار الكاميرا في التسجيل عبر مُركِّب قبل الترميز.",
    },
    resolve: cameraStatus,
    text: {
      en: { title: "Camera PiP", description: "Add your camera as picture-in-picture" },
      ar: { title: "الكاميرا داخل الصورة", description: "أضف كاميرتك داخل الصورة" },
    },
  },

  /* Audio Engine */
  {
    id: "microphone-input",
    target: "audio",
    icon: "microphone",
    accent: "violet",
    variant: "standard",
    technical: {
      en: "Microphone capture runs through the Web Audio graph, where gain and mute are applied before encoding.",
      ar: "يعمل التقاط الميكروفون عبر رسم الصوتي، حيث يُطبَّق الكسب والكتم قبل الترميز.",
    },
    resolve: microphoneStatus,
    text: {
      en: { title: "Microphone Input", description: "Capture from your microphone" },
      ar: { title: "إدخال الميكروفون", description: "التقط صوت الميكروفون" },
    },
  },
  {
    id: "system-audio",
    target: "audio",
    icon: "speaker",
    accent: "blue",
    variant: "standard",
    technical: {
      en: "Captures Windows output audio with the local native audio helper, then muxes it into the finalized recording.",
      ar: "يلتقط صوت إخراج ويندوز عبر المساعد الصوتي الأصلي المحلي، ثم يدمجه في التسجيل النهائي.",
    },
    resolve: resolveWasapi,
    text: {
      en: { title: "System Audio (WASAPI)", description: "Capture Windows output audio" },
      ar: { title: "صوت النظام (WASAPI)", description: "التقط صوت إخراج ويندوز" },
    },
  },
  {
    id: "incremental-recording",
    target: "capture",
    icon: "database",
    accent: "violet",
    variant: "standard",
    technical: {
      en: "Media chunks are appended to a local part file as they arrive, then moved into place atomically when the recording finishes.",
      ar: "تُضاف مقاطع الوسائط إلى ملف محلي أثناء وصولها، ثم تُنقل إلى مكانها بشكل ذري عند انتهاء التسجيل.",
    },
    resolve: resolveIncrementalRecording,
    text: {
      en: { title: "Incremental Recording", description: "Append media chunks to local disk" },
      ar: { title: "التسجيل التدريجي", description: "اكتب مقاطع الوسائط على القرص المحلي" },
    },
  },
  {
    id: "low-disk-protection",
    target: "settings",
    icon: "shield",
    accent: "violet",
    variant: "standard",
    technical: {
      en: "Stops accepting new recording data safely when available storage crosses the configured safety threshold.",
      ar: "يتوقف عن قبول بيانات تسجيل جديدة بأمان عند عبور المساحة المتاحة حد الأمان المُعد.",
    },
    resolve: resolveStorageProtection,
    text: {
      en: { title: "Low Disk Protection", description: "Refuse recording starts on low storage" },
      ar: { title: "حماية مساحة القرص", description: "ارفض بدء التسجيل عند ضعف المساحة" },
    },
  },

  /* Project & Recovery */
  {
    id: "knouxrec-projects",
    target: "editor",
    icon: "fileText",
    accent: "blue",
    variant: "compact",
    technical: {
      en: "Versioned .knouxrec project files are written atomically next to the recording.",
      ar: "تُكتب ملفات مشروع knouxrec بإصدار محدد بشكل ذري بجوار التسجيل.",
    },
    resolve: projectStatus,
    text: {
      en: { title: ".knouxrec Projects", description: "Versioned native project format" },
      ar: { title: "مشاريع knouxrec", description: "تنسيق مشروع محلي بإصدار محدد" },
    },
  },
  {
    id: "recording-recovery",
    target: "recovery",
    icon: "recovery",
    accent: "violet",
    variant: "compact",
    technical: {
      en: "Only verified media parts without a WASAPI sidecar can be recovered.",
      ar: "لا يمكن استعادة إلا أجزاء الوسائط المتحقق منها التي لا تملك ملف صوت WASAPI.",
    },
    resolve: recoveryStatus,
    text: {
      en: { title: "Recording Recovery", description: "Recover interrupted recordings" },
      ar: { title: "استعادة التسجيل", description: "استعد التسجيلات التي انقطعت" },
    },
  },
  {
    id: "thumbnail-generation",
    target: "library",
    icon: "thumbnail",
    accent: "violet",
    variant: "compact",
    technical: {
      en: "Thumbnails are generated locally with the bundled media runtime and served over a constrained local protocol.",
      ar: "تُولَّد الصور المصغرة محلياً عبر محرك الوسائط المضمّن وتُقدَّم عبر بروتوكول محلي مقيد.",
    },
    resolve: thumbnailStatus,
    text: {
      en: { title: "Thumbnail Generation", description: "Generate local video thumbnails" },
      ar: { title: "توليد الصور المصغرة", description: "ولّد صوراً مصغرة محلياً" },
    },
  },

  /* Library */
  {
    id: "library-search",
    target: "library",
    icon: "search",
    accent: "blue",
    variant: "compact",
    technical: {
      en: "Search matches local file names and probed video codecs.",
      ar: "يطابق البحث أسماء الملفات المحلية ورموز الفيديو المفحوصة.",
    },
    resolve: libraryStatus("localSearch"),
    text: {
      en: { title: "Library Search", description: "Quickly find your content" },
      ar: { title: "بحث المكتبة", description: "اعثر على محتواك بسرعة" },
    },
  },
  {
    id: "library-sorting",
    target: "library",
    icon: "sorting",
    accent: "violet",
    variant: "compact",
    technical: {
      en: "Sort locally by newest, oldest, longest, largest or name.",
      ar: "فرز محلي حسب الأحدث أو الأقدم أو الأطول أو الأكبر أو الاسم.",
    },
    resolve: libraryStatus("localSorting"),
    text: {
      en: { title: "Library Sorting", description: "Sort by date, length, size and more" },
      ar: { title: "فرز المكتبة", description: "فرز حسب التاريخ والمدة والحجم" },
    },
  },

  /* Edit & Deliver */
  {
    id: "trim-export",
    target: "editor",
    icon: "trim",
    accent: "blue",
    variant: "horizontal",
    technical: {
      en: "One continuous trim range is saved in the project and applied during export.",
      ar: "يُحفظ نطاق قص مستمر واحد في المشروع ويُطبَّق أثناء التصدير.",
    },
    resolve: requiresRecording("editorAvailable"),
    text: {
      en: { title: "Trim Export", description: "Cut and export a selected range" },
      ar: { title: "تصدير مقصوص", description: "قص النطاق المحدد وصدّره" },
    },
  },
  {
    id: "timeline-zoom",
    target: "editor",
    icon: "zoom",
    accent: "blue",
    variant: "horizontal",
    technical: {
      en: "Timeline zoom runs from 1x to 4x while editing a project.",
      ar: "يتراوح تكبير خط الزمن من 1x إلى 4x أثناء تحرير المشروع.",
    },
    resolve: requiresRecording("editorAvailable"),
    text: {
      en: { title: "Timeline Zoom", description: "Zoom the editing timeline" },
      ar: { title: "تكبير خط الزمن", description: "كبّر خط زمن التحرير" },
    },
  },
  {
    id: "captions-editor",
    target: "captions",
    icon: "captions",
    accent: "blue",
    variant: "horizontal",
    technical: {
      en: "Captions are edited manually. Automatic transcription is unavailable in this build.",
      ar: "تُحرَّر التسميات يدوياً. النسخ التلقائي غير متاح في هذا الإصدار.",
    },
    resolve: requiresRecording("captionsAvailable"),
    text: {
      en: { title: "Captions Editor", description: "Create and edit caption segments" },
      ar: { title: "محرر التسميات", description: "أنشئ وحرر مقاطع التسميات" },
    },
  },
  {
    id: "srt-export",
    target: "captions",
    icon: "srt",
    accent: "violet",
    variant: "horizontal",
    technical: {
      en: "SRT is written from the saved caption segments of a versioned project.",
      ar: "يُكتب ملف SRT من مقاطع التسميات المحفوظة في المشروع.",
    },
    resolve: srtStatus,
    text: {
      en: { title: "SRT Export", description: "Export captions as an SRT file" },
      ar: { title: "تصدير SRT", description: "صدّر التسميات كملف SRT" },
    },
  },
  {
    id: "export-format",
    target: "export",
    icon: "formats",
    accent: "blue",
    variant: "horizontal",
    technical: {
      en: "MP4 and WebM are produced by the local export engine.",
      ar: "ينتج محرك التصدير المحلي صيغتي MP4 وWebM.",
    },
    resolve: mediaBacked("formatsAvailable"),
    text: {
      en: { title: "Export Format Selection", description: "Choose MP4 or WebM output" },
      ar: { title: "اختيار صيغة التصدير", description: "اختر إخراج MP4 أو WebM" },
    },
  },
  {
    id: "export-engine",
    target: "export",
    icon: "terminal",
    accent: "violet",
    variant: "horizontal",
    technical: {
      en: "Export is driven by the bundled FFmpeg runtime through a constrained local backend.",
      ar: "يقود التصدير محرك FFmpeg المضمّن عبر خلفية محلية مقيدة.",
    },
    resolve: mediaBacked("mediaAvailable"),
    text: {
      en: { title: "Local Export Engine", description: "Export with the bundled FFmpeg" },
      ar: { title: "محرك التصدير المحلي", description: "صدّر عبر محرك FFmpeg المضمّن" },
    },
  },
  {
    id: "output-verification",
    target: "export",
    icon: "verified",
    accent: "blue",
    variant: "horizontal",
    technical: {
      en: "Verified with FFprobe: exported media is probed locally after every export.",
      ar: "تم التحقق عبر FFprobe: يُفحص الناتج محلياً بعد كل عملية تصدير.",
    },
    resolve: mediaBacked("outputVerified"),
    text: {
      en: { title: "Output Verification", description: "Validate exported files with FFprobe" },
      ar: { title: "التحقق من المخرجات", description: "تحقق من الملفات المصدّرة عبر FFprobe" },
    },
  },
];

function section(
  id: string,
  icon: IconName,
  accent: ServiceAccent,
  span: "half" | "wide",
  grid: "two" | "three" | "strip",
  en: { title: string; description: string },
  ar: { title: string; description: string },
  serviceIds: string[],
): ServiceSection {
  return {
    id,
    icon,
    accent,
    span,
    grid,
    text: { en, ar },
    services: serviceIds.map((serviceId) => {
      const found = SERVICES.find((service) => service.id === serviceId);
      if (!found) throw new Error(`Unknown dashboard service: ${serviceId}`);
      return found;
    }),
  };
}

export const SERVICE_SECTIONS: ServiceSection[] = [
  section("capture", "monitor", "blue", "half", "two", { title: "Capture Studio", description: "Capture exactly what you need" }, { title: "استوديو الالتقاط", description: "التقط ما تحتاجه بالضبط" }, [
    "screen-capture",
    "window-capture",
    "region-capture",
    "camera-pip",
  ]),
  section("audio", "speaker", "violet", "half", "two", { title: "Audio Engine", description: "Professional audio capture and protection" }, { title: "محرك الصوت", description: "التقاط صوتي احترافي وحماية" }, [
    "microphone-input",
    "system-audio",
    "incremental-recording",
    "low-disk-protection",
  ]),
  section("project", "projects", "blue", "half", "three", { title: "Project & Recovery", description: "Keep your work safe and organized" }, { title: "المشروع والاستعادة", description: "احتفظ بعملك آمناً ومنظماً" }, [
    "knouxrec-projects",
    "recording-recovery",
    "thumbnail-generation",
  ]),
  section("library", "library", "violet", "half", "two", { title: "Library", description: "Find and organize your recordings" }, { title: "المكتبة", description: "اعثر على تسجيلاتك ورتّبها" }, [
    "library-search",
    "library-sorting",
  ]),
  section("deliver", "trim", "blue", "wide", "strip", { title: "Edit & Deliver", description: "Edit, refine and export your recordings" }, { title: "التحرير والتسليم", description: "حرّر تسجيلاتك وحسّنها وصدّرها" }, [
    "trim-export",
    "timeline-zoom",
    "captions-editor",
    "srt-export",
    "export-format",
    "export-engine",
    "output-verification",
  ]),
];

type StatusText = { label: string; detail: string };

export const STATUS_TEXT: Record<Locale, Record<StatusKey, StatusText>> = {
  en: {
    ready: { label: "Ready", detail: "KNOuX REC is ready to record." },
    starting: { label: "Starting", detail: "Preparing the capture and audio runtimes." },
    recording: { label: "Recording", detail: "Screen recording is active." },
    paused: { label: "Paused", detail: "Recording is paused." },
    finalizing: { label: "Finalizing", detail: "Writing the recording safely to disk." },
    needsAttention: { label: "Needs attention", detail: "The recorder reported a failure." },
    runtimeUnavailable: { label: "Runtime unavailable", detail: "Recording runs in the KNOuX REC Windows application." },
    limited: { label: "Limited", detail: "Recording available; export runtime unavailable." },
    recoveryAvailable: { label: "Recovery", detail: "{0} interrupted session can be recovered." },
    desktopOnly: { label: "Desktop only", detail: "This service is provided by the Windows desktop runtime." },
    noDisplaySource: { label: "No display", detail: "The Windows capturer returned no display sources." },
    noWindowSource: { label: "No window", detail: "The Windows capturer returned no window sources." },
    displaySources: { label: "Available", detail: "{0} display sources detected by the Windows capturer." },
    windowSources: { label: "Available", detail: "{0} window sources detected by the Windows capturer." },
    regionSet: { label: "Region set", detail: "A region is selected for the next recording." },
    regionAvailable: { label: "Available", detail: "Select a region to constrain the recording." },
    noCamera: { label: "No camera", detail: "No camera device was detected." },
    cameraActive: { label: "Active", detail: "The camera is composited into the recording." },
    camerasDetected: { label: "Available", detail: "{0} camera devices detected." },
    noMicrophone: { label: "No microphone", detail: "No microphone input device was detected." },
    microphoneActive: { label: "Active", detail: "The microphone is included in the recording." },
    microphonesDetected: { label: "Available", detail: "{0} microphone input devices detected." },
    helperUnavailable: { label: "Helper unavailable", detail: "The native system audio helper could not be reached." },
    wasapiFailed: { label: "Capture failed", detail: "The native system audio capture reported a failure." },
    wasapiRecording: { label: "Recording", detail: "System audio is being captured by the native helper." },
    wasapiEnabled: { label: "Enabled", detail: "System audio is enabled for the next recording." },
    wasapiDevices: { label: "Available", detail: "{0} Windows output devices detected." },
    noOutputDevice: { label: "No output device", detail: "The native helper returned no active Windows output device." },
    incrementalActive: { label: "Active", detail: "{0} media chunks appended to the local part file." },
    incrementalProtected: { label: "Protected", detail: "Every media chunk is appended to a local part file and journaled." },
    storageUnavailable: { label: "Storage unavailable", detail: "The recording folder is not writable." },
    storageUnknown: { label: "Storage unknown", detail: "Free disk space could not be measured on this volume." },
    lowStorage: { label: "Low storage", detail: "Recording start is refused below 512 MB of free space." },
    protected: { label: "Protected", detail: "Recording start is refused when free space drops below 512 MB." },
    noRecordings: { label: "No recordings", detail: "Finalize a recording to unlock this service." },
    projectOpen: { label: "Open", detail: "A local project is open in the editor." },
    projectLocal: { label: "Local", detail: "Versioned .knouxrec files are stored next to the recording." },
    recoveryBlocked: { label: "Not recoverable", detail: "{0} interrupted sessions cannot be recovered." },
    noRecovery: { label: "None found", detail: "No interrupted sessions were found." },
    thumbnailsReady: { label: "Ready", detail: "{0} of {1} recordings have a local thumbnail." },
    thumbnailsNoSource: { label: "No recordings", detail: "Thumbnails appear once a recording is finalized." },
    localSearch: { label: "Available", detail: "Search matches local file names and probed video codecs." },
    localSorting: { label: "Available", detail: "Sort locally by newest, oldest, longest, largest or name." },
    editorAvailable: { label: "Available", detail: "Open a project to trim and zoom the timeline." },
    captionsAvailable: { label: "Available", detail: "Manual caption segments; automatic transcription is unavailable." },
    noCaptions: { label: "No captions", detail: "Add caption segments before exporting SRT." },
    captionsReady: { label: "Available", detail: "{0} caption segments ready to export." },
    formatsAvailable: { label: "Available", detail: "MP4 and WebM are produced by the local export engine." },
    mediaChecking: { label: "Checking", detail: "The local media runtime is still being probed." },
    mediaAvailable: { label: "Available", detail: "The bundled local media runtime answered successfully." },
    mediaUnavailable: { label: "Runtime unavailable", detail: "The local media runtime could not be verified on this machine." },
    outputVerified: { label: "Verified", detail: "Exported media is probed locally with FFprobe." },
    outputVerificationUnavailable: { label: "Unavailable", detail: "Output verification needs the local media runtime." },
  },
  ar: {
    ready: { label: "جاهز", detail: "KNOuX REC جاهز للتسجيل." },
    starting: { label: "جارٍ البدء", detail: "جارٍ تجهيز بيئتي الالتقاط والصوت." },
    recording: { label: "جارٍ التسجيل", detail: "التسجيل النشط للشاشة." },
    paused: { label: "متوقف مؤقتاً", detail: "التسجيل متوقف مؤقتاً." },
    finalizing: { label: "جارٍ الإنهاء", detail: "جارٍ كتابة التسجيل بأمان على القرص." },
    needsAttention: { label: "يتطلب الانتباه", detail: "أبلغ المسجل عن فشل." },
    runtimeUnavailable: { label: "بيئة التشغيل غير متاحة", detail: "يعمل التسجيل داخل تطبيق KNOuX REC لويندوز." },
    limited: { label: "محدود", detail: "التسجيل متاح؛ بيئة التصدير غير متاحة." },
    recoveryAvailable: { label: "استعادة", detail: "يمكن استعادة {0} من الجلسات المنقطعة." },
    desktopOnly: { label: "سطح المكتب فقط", detail: "تقدّم هذه الخدمة بيئة سطح مكتب ويندوز." },
    noDisplaySource: { label: "لا توجد شاشة", detail: "لم تُرجع أداة الالتقاط أي مصادر شاشة." },
    noWindowSource: { label: "لا توجد نافذة", detail: "لم تُرجع أداة الالتقاط أي مصادر نوافذ." },
    displaySources: { label: "متاح", detail: "اكتشفت أداة الالتقاط {0} من مصادر الشاشات." },
    windowSources: { label: "متاح", detail: "اكتشفت أداة الالتقاط {0} من مصادر النوافذ." },
    regionSet: { label: "المنطقة محددة", detail: "تم تحديد منطقة للتسجيل التالي." },
    regionAvailable: { label: "متاح", detail: "اختر منطقة لتقييد التسجيل." },
    noCamera: { label: "لا توجد كاميرا", detail: "لم يُكتشف أي جهاز كاميرا." },
    cameraActive: { label: "نشط", detail: "الكاميرا مدموجة داخل التسجيل." },
    camerasDetected: { label: "متاح", detail: "تم اكتشاف {0} من أجهزة الكاميرا." },
    noMicrophone: { label: "لا يوجد ميكروفون", detail: "لم يُكتشف أي جهاز إدخال ميكروفون." },
    microphoneActive: { label: "نشط", detail: "الميكروفون مُضمَّن في التسجيل." },
    microphonesDetected: { label: "متاح", detail: "تم اكتشاف {0} من أجهزة إدخال الميكروفون." },
    helperUnavailable: { label: "المساعد غير متاح", detail: "تعذّر الوصول إلى مساعد صوت النظام الأصلي." },
    wasapiFailed: { label: "فشل الالتقاط", detail: "أبلغ التقاط صوت النظام الأصلي عن فشل." },
    wasapiRecording: { label: "جارٍ التسجيل", detail: "يتم التقاط صوت النظام عبر المساعد الأصلي." },
    wasapiEnabled: { label: "مفعّل", detail: "صوت النظام مفعّل للتسجيل التالي." },
    wasapiDevices: { label: "متاح", detail: "تم اكتشاف {0} من أجهزة إخراج ويندوز." },
    noOutputDevice: { label: "لا يوجد جهاز إخراج", detail: "لم يُرجع المساعد الأصلي أي جهاز إخراج نشط." },
    incrementalActive: { label: "نشط", detail: "تمت إضافة {0} من مقاطع الوسائط إلى الملف المحلي." },
    incrementalProtected: { label: "محمي", detail: "يُضاف كل مقطع وسائط إلى ملف محلي ويُسجَّل في يومية." },
    storageUnavailable: { label: "التخزين غير متاح", detail: "مجلد التسجيل غير قابل للكتابة." },
    storageUnknown: { label: "التخزين غير معروف", detail: "تعذّر قياس المساحة الحرة على هذا القرص." },
    lowStorage: { label: "مساحة منخفضة", detail: "يُرفض بدء التسجيل عند أقل من 512 ميغابايت حرة." },
    protected: { label: "محمي", detail: "يُرفض بدء التسجيل عند هبوط المساحة الحرة تحت 512 ميغابايت." },
    noRecordings: { label: "لا توجد تسجيلات", detail: "أنهِ تسجيلاً لفتح هذه الخدمة." },
    projectOpen: { label: "مفتوح", detail: "مشروع محلي مفتوح في المحرر." },
    projectLocal: { label: "محلي", detail: "تُخزَّن ملفات knouxrec بإصدار محدد بجوار التسجيل." },
    recoveryBlocked: { label: "غير قابل للاستعادة", detail: "لا يمكن استعادة {0} من الجلسات المنقطعة." },
    noRecovery: { label: "لا توجد جلسات", detail: "لم يُعثر على أي جلسات منقطعة." },
    thumbnailsReady: { label: "جاهز", detail: "لدى {0} من {1} تسجيلاً صورة مصغرة محلية." },
    thumbnailsNoSource: { label: "لا توجد تسجيلات", detail: "تظهر الصور المصغرة بعد إنهاء تسجيل." },
    localSearch: { label: "متاح", detail: "يطابق البحث أسماء الملفات المحلية ورموز الفيديو المفحوصة." },
    localSorting: { label: "متاح", detail: "فرز محلي حسب الأحدث أو الأقدم أو الأطول أو الأكبر أو الاسم." },
    editorAvailable: { label: "متاح", detail: "افتح مشروعاً للقص وتكبير خط الزمن." },
    captionsAvailable: { label: "متاح", detail: "مقاطع تسميات يدوية؛ النسخ التلقائي غير متاح." },
    noCaptions: { label: "لا توجد تسميات", detail: "أضف مقاطع تسميات قبل تصدير SRT." },
    captionsReady: { label: "متاح", detail: "{0} من مقاطع التسميات جاهزة للتصدير." },
    formatsAvailable: { label: "متاح", detail: "ينتج محرك التصدير المحلي صيغتي MP4 وWebM." },
    mediaChecking: { label: "جارٍ الفحص", detail: "ما زال محرك الوسائط المحلي قيد الفحص." },
    mediaAvailable: { label: "متاح", detail: "استجاب محرك الوسائط المحلي المضمّن بنجاح." },
    mediaUnavailable: { label: "بيئة التشغيل غير متاحة", detail: "تعذّر التحقق من محرك الوسائط المحلي على هذا الجهاز." },
    outputVerified: { label: "تم التحقق", detail: "تُفحص الوسائط المصدّرة محلياً عبر FFprobe." },
    outputVerificationUnavailable: { label: "غير متاح", detail: "يتطلب التحقق من المخرجات محرك الوسائط المحلي." },
  },
};

export type DescribedStatus = { label: string; detail: string; tone: StatusTone };

/**
 * Fills a localized status template. A real runtime message, when the resolver supplied
 * one, always wins over the generic sentence, so a chip explains the actual failure.
 */
export function describeStatus(status: ResolvedStatus, locale: Locale): DescribedStatus {
  const template = STATUS_TEXT[locale][status.key];
  const values = status.values ?? [];
  const detail = status.detail?.trim();
  return {
    label: template.label,
    detail: detail || template.detail.replace(/\{(\d+)\}/g, (match, slot: string) => {
      const value = values[Number(slot)];
      return value === undefined || value === "" ? match : String(value);
    }),
    tone: STATUS_META[status.key].tone,
  };
}
