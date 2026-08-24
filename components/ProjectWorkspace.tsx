import { useEffect, useMemo, useRef, useState } from "react";
import type { KnouxProject, RecordingRecord } from "../desktop/contracts";

export type ProjectWorkspacePanel = "editor" | "captions" | "export";

type ProjectWorkspaceProps = {
  panel: ProjectWorkspacePanel;
  locale: "en" | "ar";
  records: RecordingRecord[];
  selectedRecordingId: string | null;
  project: KnouxProject | null;
  loading: boolean;
  saving: boolean;
  dirty: boolean;
  error: string | null;
  canUndo: boolean;
  canRedo: boolean;
  onSelectRecording: (recordingId: string) => void;
  onChange: (mutator: (project: KnouxProject) => KnouxProject) => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
};

type Copy = {
  eyebrow: string;
  title: string;
  selectRecording: string;
  noProjects: string;
  loading: string;
  sourcePreview: string;
  trim: string;
  fullSource: string;
  trimStart: string;
  trimEnd: string;
  duration: string;
  playhead: string;
  timelineZoom: string;
  resetZoom: string;
  undo: string;
  redo: string;
  save: string;
  saving: string;
  unsaved: string;
  saved: string;
  captions: string;
  captionLanguage: string;
  addCaption: string;
  noCaptions: string;
  start: string;
  end: string;
  text: string;
  delete: string;
  exportSrt: string;
  transcriptionUnavailable: string;
  export: string;
  exportMp4: string;
  exporting: string;
  exportNote: string;
  configuredRange: string;
  exportsTo: string;
  useFullSource: string;
};

const copy: Record<"en" | "ar", Record<ProjectWorkspacePanel, Copy>> = {
  en: {
    editor: {
      eyebrow: "NON-DESTRUCTIVE PROJECT", title: "Editor", selectRecording: "Recording project", noProjects: "No finalized recording project is available yet.", loading: "Loading the local project…", sourcePreview: "Source preview", trim: "Continuous trim", fullSource: "Use full source", trimStart: "Start", trimEnd: "End", duration: "Source duration", playhead: "Playhead", timelineZoom: "Timeline zoom", resetZoom: "Reset zoom", undo: "Undo", redo: "Redo", save: "Save project", saving: "Saving project…", unsaved: "Unsaved project edits", saved: "Project saved locally", captions: "Captions", captionLanguage: "Language", addCaption: "Add caption", noCaptions: "No captions have been added.", start: "Start", end: "End", text: "Text", delete: "Delete", exportSrt: "Export SRT", transcriptionUnavailable: "Automatic transcription is unavailable in this build.", export: "Export", exportMp4: "Export MP4", exporting: "Exporting locally…", exportNote: "The export uses the saved continuous trim. Progress and cancellation are unavailable because this local job is synchronous.", configuredRange: "Configured range", exportsTo: "Exports are written to the app-local exports folder.", useFullSource: "Full source",
    },
    captions: {
      eyebrow: "PROJECT CAPTIONS", title: "Captions", selectRecording: "Recording project", noProjects: "No finalized recording project is available yet.", loading: "Loading the local project…", sourcePreview: "Source preview", trim: "Continuous trim", fullSource: "Use full source", trimStart: "Start", trimEnd: "End", duration: "Source duration", playhead: "Playhead", timelineZoom: "Timeline zoom", resetZoom: "Reset zoom", undo: "Undo", redo: "Redo", save: "Save project", saving: "Saving project…", unsaved: "Unsaved caption edits", saved: "Captions saved locally", captions: "Caption segments", captionLanguage: "Language", addCaption: "Add caption", noCaptions: "No captions have been added.", start: "Start", end: "End", text: "Text", delete: "Delete", exportSrt: "Export SRT", transcriptionUnavailable: "Automatic transcription is unavailable in this build.", export: "Export", exportMp4: "Export MP4", exporting: "Exporting locally…", exportNote: "The export uses the saved continuous trim. Progress and cancellation are unavailable because this local job is synchronous.", configuredRange: "Configured range", exportsTo: "Exports are written to the app-local exports folder.", useFullSource: "Full source",
    },
    export: {
      eyebrow: "LOCAL PROJECT OUTPUT", title: "Export", selectRecording: "Recording project", noProjects: "No finalized recording project is available yet.", loading: "Loading the local project…", sourcePreview: "Source preview", trim: "Continuous trim", fullSource: "Use full source", trimStart: "Start", trimEnd: "End", duration: "Source duration", playhead: "Playhead", timelineZoom: "Timeline zoom", resetZoom: "Reset zoom", undo: "Undo", redo: "Redo", save: "Save project", saving: "Saving project…", unsaved: "Unsaved project edits", saved: "Project saved locally", captions: "Captions", captionLanguage: "Language", addCaption: "Add caption", noCaptions: "No captions have been added.", start: "Start", end: "End", text: "Text", delete: "Delete", exportSrt: "Export SRT", transcriptionUnavailable: "Automatic transcription is unavailable in this build.", export: "Export", exportMp4: "Export MP4", exporting: "Exporting locally…", exportNote: "The export uses the saved continuous trim. Progress and cancellation are unavailable because this local job is synchronous.", configuredRange: "Configured range", exportsTo: "Exports are written to the app-local exports folder.", useFullSource: "Full source",
    },
  },
  ar: {
    editor: {
      eyebrow: "مشروع غير هدمي", title: "المحرر", selectRecording: "مشروع التسجيل", noProjects: "لا يوجد مشروع لتسجيل مكتمل حتى الآن.", loading: "جارٍ تحميل المشروع المحلي…", sourcePreview: "معاينة المصدر", trim: "قص مستمر", fullSource: "استخدام المصدر كاملاً", trimStart: "البداية", trimEnd: "النهاية", duration: "مدة المصدر", playhead: "رأس التشغيل", timelineZoom: "تكبير خط الزمن", resetZoom: "إعادة الضبط", undo: "تراجع", redo: "إعادة", save: "حفظ المشروع", saving: "جارٍ حفظ المشروع…", unsaved: "تعديلات مشروع غير محفوظة", saved: "حُفظ المشروع محلياً", captions: "التسميات", captionLanguage: "اللغة", addCaption: "إضافة تسمية", noCaptions: "لم تُضف أي تسميات بعد.", start: "البداية", end: "النهاية", text: "النص", delete: "حذف", exportSrt: "تصدير SRT", transcriptionUnavailable: "النسخ التلقائي غير متاح في هذا الإصدار.", export: "التصدير", exportMp4: "تصدير MP4", exporting: "جارٍ التصدير محلياً…", exportNote: "يستخدم التصدير القص المستمر المحفوظ. لا يتوفر تقدم أو إلغاء لأن المهمة المحلية متزامنة.", configuredRange: "النطاق المضبوط", exportsTo: "تُكتب الملفات في مجلد exports المحلي للتطبيق.", useFullSource: "المصدر كاملاً",
    },
    captions: {
      eyebrow: "تسميات المشروع", title: "التسميات", selectRecording: "مشروع التسجيل", noProjects: "لا يوجد مشروع لتسجيل مكتمل حتى الآن.", loading: "جارٍ تحميل المشروع المحلي…", sourcePreview: "معاينة المصدر", trim: "قص مستمر", fullSource: "استخدام المصدر كاملاً", trimStart: "البداية", trimEnd: "النهاية", duration: "مدة المصدر", playhead: "رأس التشغيل", timelineZoom: "تكبير خط الزمن", resetZoom: "إعادة الضبط", undo: "تراجع", redo: "إعادة", save: "حفظ المشروع", saving: "جارٍ حفظ المشروع…", unsaved: "تعديلات تسميات غير محفوظة", saved: "حُفظت التسميات محلياً", captions: "مقاطع التسميات", captionLanguage: "اللغة", addCaption: "إضافة تسمية", noCaptions: "لم تُضف أي تسميات بعد.", start: "البداية", end: "النهاية", text: "النص", delete: "حذف", exportSrt: "تصدير SRT", transcriptionUnavailable: "النسخ التلقائي غير متاح في هذا الإصدار.", export: "التصدير", exportMp4: "تصدير MP4", exporting: "جارٍ التصدير محلياً…", exportNote: "يستخدم التصدير القص المستمر المحفوظ. لا يتوفر تقدم أو إلغاء لأن المهمة المحلية متزامنة.", configuredRange: "النطاق المضبوط", exportsTo: "تُكتب الملفات في مجلد exports المحلي للتطبيق.", useFullSource: "المصدر كاملاً",
    },
    export: {
      eyebrow: "مخرج مشروع محلي", title: "التصدير", selectRecording: "مشروع التسجيل", noProjects: "لا يوجد مشروع لتسجيل مكتمل حتى الآن.", loading: "جارٍ تحميل المشروع المحلي…", sourcePreview: "معاينة المصدر", trim: "قص مستمر", fullSource: "استخدام المصدر كاملاً", trimStart: "البداية", trimEnd: "النهاية", duration: "مدة المصدر", playhead: "رأس التشغيل", timelineZoom: "تكبير خط الزمن", resetZoom: "إعادة الضبط", undo: "تراجع", redo: "إعادة", save: "حفظ المشروع", saving: "جارٍ حفظ المشروع…", unsaved: "تعديلات مشروع غير محفوظة", saved: "حُفظ المشروع محلياً", captions: "التسميات", captionLanguage: "اللغة", addCaption: "إضافة تسمية", noCaptions: "لم تُضف أي تسميات بعد.", start: "البداية", end: "النهاية", text: "النص", delete: "حذف", exportSrt: "تصدير SRT", transcriptionUnavailable: "النسخ التلقائي غير متاح في هذا الإصدار.", export: "التصدير", exportMp4: "تصدير MP4", exporting: "جارٍ التصدير محلياً…", exportNote: "يستخدم التصدير القص المستمر المحفوظ. لا يتوفر تقدم أو إلغاء لأن المهمة المحلية متزامنة.", configuredRange: "النطاق المضبوط", exportsTo: "تُكتب الملفات في مجلد exports المحلي للتطبيق.", useFullSource: "المصدر كاملاً",
    },
  },
};

function formatMs(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function cloneProject(project: KnouxProject): KnouxProject {
  return JSON.parse(JSON.stringify(project)) as KnouxProject;
}

function mediaUrl(record: RecordingRecord): string {
  return `knoux-rec-media://recording/${encodeURIComponent(record.id)}`;
}

function selectedRange(project: KnouxProject): { startMs: number; endMs: number } {
  const cut = project.timeline.cuts[0];
  return cut ? { startMs: cut.startMs, endMs: cut.endMs } : { startMs: 0, endMs: project.timeline.durationMs };
}

export default function ProjectWorkspace(props: ProjectWorkspaceProps) {
  const { panel, locale, records, selectedRecordingId, project, loading, saving, dirty, error, canUndo, canRedo, onSelectRecording, onChange, onSave, onUndo, onRedo } = props;
  const t = copy[locale][panel];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playheadMs, setPlayheadMs] = useState(0);
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [exportState, setExportState] = useState<"idle" | "exporting" | "complete" | "failed">("idle");
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const selectedRecord = records.find((record) => record.id === selectedRecordingId) ?? null;
  const range = project ? selectedRange(project) : null;
  const activeCaption = useMemo(() => project?.captions.segments.find((segment) => playheadMs >= segment.startMs && playheadMs <= segment.endMs) ?? null, [playheadMs, project]);

  useEffect(() => {
    setPlayheadMs(0);
    setExportState("idle");
    setExportMessage(null);
  }, [selectedRecordingId, panel]);

  const updateRange = (nextStart: number, nextEnd: number) => {
    if (!project) return;
    const duration = project.timeline.durationMs;
    const startMs = Math.max(0, Math.min(nextStart, Math.max(0, duration - 1)));
    const endMs = Math.max(startMs + 1, Math.min(nextEnd, duration));
    onChange((current) => ({ ...current, timeline: { ...current.timeline, cuts: [{ id: "primary-trim", startMs, endMs }] } }));
  };

  const scrub = (nextMs: number) => {
    setPlayheadMs(nextMs);
    if (videoRef.current) videoRef.current.currentTime = nextMs / 1000;
  };

  const addCaption = () => {
    if (!project) return;
    const startMs = Math.min(Math.max(0, Math.round(playheadMs)), Math.max(0, project.timeline.durationMs - 1));
    const endMs = Math.min(project.timeline.durationMs, Math.max(startMs + 1, startMs + 2000));
    onChange((current) => ({ ...current, captions: { ...current.captions, segments: [...current.captions.segments, { id: crypto.randomUUID(), startMs, endMs, text: "New caption" }] } }));
  };

  const updateCaption = (id: string, patch: Partial<KnouxProject["captions"]["segments"][number]>) => {
    if (!project) return;
    onChange((current) => ({ ...current, captions: { ...current.captions, segments: current.captions.segments.map((segment) => segment.id === id ? { ...segment, ...patch } : segment) } }));
  };

  const removeCaption = (id: string) => onChange((current) => ({ ...current, captions: { ...current.captions, segments: current.captions.segments.filter((segment) => segment.id !== id) } }));

  const exportSrt = async () => {
    if (!selectedRecordingId || !project || !project.captions.segments.length || !window.knouxRec || saving || dirty) return;
    setExportState("exporting");
    setExportMessage(null);
    try {
      const outputPath = await window.knouxRec.project.exportSrt(selectedRecordingId);
      setExportState("complete");
      setExportMessage(outputPath);
    } catch (reason) {
      setExportState("failed");
      setExportMessage(reason instanceof Error ? reason.message : "SRT export failed.");
    }
  };

  const exportMp4 = async () => {
    if (!selectedRecordingId || !project || !window.knouxRec || saving || dirty) return;
    setExportState("exporting");
    setExportMessage(null);
    try {
      const result = await window.knouxRec.project.export({ recordingId: selectedRecordingId, format: "mp4" });
      setExportState("complete");
      setExportMessage(result.outputPath);
    } catch (reason) {
      setExportState("failed");
      setExportMessage(reason instanceof Error ? reason.message : "MP4 export failed.");
    }
  };

  const renderedProject = project && selectedRecord ? <>
    <section className="project-toolbar card">
      <label>{t.selectRecording}<select value={selectedRecordingId ?? ""} onChange={(event) => onSelectRecording(event.target.value)}>{records.map((record) => <option key={record.id} value={record.id}>{record.fileName}</option>)}</select></label>
      <div className="project-history"><button className="secondary-button" disabled={!canUndo || saving} onClick={onUndo}>{t.undo}</button><button className="secondary-button" disabled={!canRedo || saving} onClick={onRedo}>{t.redo}</button><button className="secondary-button" disabled={saving || !dirty} onClick={onSave}>{saving ? t.saving : t.save}</button><span className={dirty ? "project-dirty" : "project-saved"}>{dirty ? t.unsaved : t.saved}</span></div>
    </section>
    {panel !== "export" && <div className="project-editor-grid">
      <section className="card video-editor-card">
        <div className="section-heading"><div><p className="eyebrow">SOURCE MEDIA</p><h2>{t.sourcePreview}</h2></div><span className="duration-badge">{formatMs(project.timeline.durationMs)}</span></div>
        <div className="video-preview"><video ref={videoRef} src={mediaUrl(selectedRecord)} controls onTimeUpdate={(event) => setPlayheadMs(Math.round(event.currentTarget.currentTime * 1000))} onLoadedMetadata={(event) => setPlayheadMs(Math.round(event.currentTarget.currentTime * 1000))} /><div className="caption-overlay" aria-live="polite">{activeCaption?.text}</div></div>
        <label className="playhead-control">{t.playhead}<input type="range" min="0" max={project.timeline.durationMs} step="100" value={Math.min(playheadMs, project.timeline.durationMs)} onChange={(event) => scrub(Number(event.target.value))} /><strong>{formatMs(playheadMs)}</strong></label>
      </section>
      <div className="timeline-zoom"><label>{t.timelineZoom}<input type="range" min="1" max="4" step="0.5" value={timelineZoom} onChange={(event) => setTimelineZoom(Number(event.target.value))} /></label><strong>{timelineZoom.toFixed(1)}x</strong><button className="secondary-button" type="button" onClick={() => setTimelineZoom(1)} disabled={timelineZoom === 1}>{t.resetZoom}</button></div>
      {panel === "editor" ? <section className="card trim-card"><p className="eyebrow">TIMELINE</p><h2>{t.trim}</h2><p className="muted">{t.duration}: {formatMs(project.timeline.durationMs)}</p><label>{t.trimStart}<input type="number" min="0" max={range!.endMs - 1} step="100" value={range!.startMs} onChange={(event) => updateRange(Number(event.target.value), range!.endMs)} /><small>{formatMs(range!.startMs)}</small></label><label>{t.trimEnd}<input type="number" min={range!.startMs + 1} max={project.timeline.durationMs} step="100" value={range!.endMs} onChange={(event) => updateRange(range!.startMs, Number(event.target.value))} /><small>{formatMs(range!.endMs)}</small></label><div className="trim-rail" style={{ transform: `scaleX(${timelineZoom})`, transformOrigin: locale === "ar" ? "right" : "left" }}><i style={{ insetInlineStart: `${(range!.startMs / project.timeline.durationMs) * 100}%`, insetInlineEnd: `${100 - (range!.endMs / project.timeline.durationMs) * 100}%` }} /></div><button className="secondary-button" disabled={!project.timeline.cuts.length} onClick={() => onChange((current) => ({ ...current, timeline: { ...current.timeline, cuts: [] } }))}>{t.fullSource}</button></section> : <CaptionEditor project={project} t={t} onChange={onChange} onAdd={addCaption} onUpdate={updateCaption} onRemove={removeCaption} onExportSrt={exportSrt} exportState={exportState} exportMessage={exportMessage} dirty={dirty} saving={saving} />}
    </div>}
    {panel === "editor" && <section className="card project-callout"><p className="eyebrow">CAPTIONS</p><h2>{t.captions}</h2><p className="muted">{t.transcriptionUnavailable}</p></section>}
    {panel === "export" && <ExportCard project={project} t={t} dirty={dirty} saving={saving} exportState={exportState} exportMessage={exportMessage} onExport={exportMp4} />}
  </> : null;

  return <section className="project-workspace">
    <div className="section-heading"><div><p className="eyebrow">{t.eyebrow}</p><h2>{t.title}</h2></div></div>
    {!records.length ? <div className="empty-library">{t.noProjects}</div> : loading ? <div className="empty-library">{t.loading}</div> : error ? <div className="alert project-error" role="alert"><div><strong>{t.title}</strong><p>{error}</p></div></div> : renderedProject}
  </section>;
}

function CaptionEditor({ project, t, onChange, onAdd, onUpdate, onRemove, onExportSrt, exportState, exportMessage, dirty, saving }: { project: KnouxProject; t: Copy; onChange: ProjectWorkspaceProps["onChange"]; onAdd: () => void; onUpdate: (id: string, patch: Partial<KnouxProject["captions"]["segments"][number]>) => void; onRemove: (id: string) => void; onExportSrt: () => void; exportState: string; exportMessage: string | null; dirty: boolean; saving: boolean }) {
  const segments = [...project.captions.segments].sort((left, right) => left.startMs - right.startMs);
  return <section className="card captions-card"><div className="section-heading"><div><p className="eyebrow">SRT</p><h2>{t.captions}</h2></div><button className="secondary-button" onClick={onAdd}>{t.addCaption}</button></div><label>{t.captionLanguage}<input value={project.captions.language ?? ""} maxLength={16} placeholder="en" onChange={(event) => onChange((current) => ({ ...current, captions: { ...current.captions, language: event.target.value.trim() || null } }))} /></label>{segments.length ? <div className="caption-list">{segments.map((segment) => <article className="caption-row" key={segment.id}><label>{t.start}<input type="number" min="0" max={segment.endMs - 1} step="100" value={segment.startMs} onChange={(event) => onUpdate(segment.id, { startMs: Number(event.target.value) })} /></label><label>{t.end}<input type="number" min={segment.startMs + 1} max={project.timeline.durationMs} step="100" value={segment.endMs} onChange={(event) => onUpdate(segment.id, { endMs: Number(event.target.value) })} /></label><label className="caption-text">{t.text}<textarea value={segment.text} maxLength={10000} onChange={(event) => onUpdate(segment.id, { text: event.target.value })} /></label><button className="danger-button" onClick={() => onRemove(segment.id)}>{t.delete}</button></article>)}</div> : <p className="muted">{t.noCaptions}</p>}<p className="muted">{t.transcriptionUnavailable}</p><button className="secondary-button" disabled={!segments.length || dirty || saving || exportState === "exporting"} onClick={() => void onExportSrt()}>{t.exportSrt}</button>{dirty && <p className="export-error">{t.unsaved}</p>}{exportMessage && <p className={exportState === "failed" ? "export-error" : "export-result"}>{exportMessage}</p>}</section>;
}

function ExportCard({ project, t, dirty, saving, exportState, exportMessage, onExport }: { project: KnouxProject; t: Copy; dirty: boolean; saving: boolean; exportState: string; exportMessage: string | null; onExport: () => void }) {
  const range = selectedRange(project);
  return <section className="card export-card"><p className="eyebrow">MP4</p><h2>{t.export}</h2><div className="export-facts"><div><span>{t.configuredRange}</span><strong>{formatMs(range.startMs)} — {formatMs(range.endMs)}</strong></div><div><span>{t.duration}</span><strong>{formatMs(range.endMs - range.startMs)}</strong></div></div><p className="muted">{t.exportNote}</p><p className="muted">{t.exportsTo}</p>{dirty && <p className="export-error">{t.unsaved}</p>}<button className="record-button" disabled={dirty || saving || exportState === "exporting"} onClick={() => void onExport()}>{exportState === "exporting" ? t.exporting : t.exportMp4}</button>{exportMessage && <p className={exportState === "failed" ? "export-error" : "export-result"}>{exportMessage}</p>}</section>;
}

export { cloneProject };
