import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KnouxProject, RecorderHealth, RecordingRecord } from "./desktop/contracts";
import ProjectWorkspace, { cloneProject, type ProjectWorkspacePanel } from "./components/ProjectWorkspace";
import { useRecorder, type CameraPipPosition, type CameraPipShape, type CaptureMode } from "./hooks/useRecorder";

type Panel = "capture" | "library" | "editor" | "captions" | "export" | "audio" | "camera" | "settings";
type Locale = "en" | "ar";

const copy = {
  en: {
    capture: "Capture", library: "Library", editor: "Editor", captions: "Captions", export: "Export", audio: "Audio Studio", camera: "Camera Studio", settings: "Settings",
    record: "Record", stop: "Stop", pause: "Pause", resume: "Resume", ready: "Ready", recording: "Recording", paused: "Paused", finalizing: "Finalizing safely", failed: "Needs attention",
    sourcePicker: "Source picker", sourceHint: "Live desktop and application thumbnails are supplied by the Windows desktop capturer.", refresh: "Refresh", noSources: "No compatible capture sources were found.", selected: "Selected",
    display: "Display", window: "Window", region: "Region", captureMode: "Capture mode", selectRegion: "Select region", regionSelected: "Region selected", screen: "Screen", application: "Application",
    quality: "Quality", frameRate: "Frame rate", destination: "Destination", targetOnly: "Target setting", timer: "Elapsed", written: "Written to disk", screenshot: "Screenshot", screenshotReady: "A real screenshot was saved through the browser download flow.",
    systemAudio: "System audio", microphone: "Microphone", cameraOverlay: "Camera picture-in-picture", systemAudioNote: "Windows WASAPI loopback is captured locally, then muxed into the finalized WebM and verified with FFprobe.",
    outputDevice: "Windows output device", refreshDevices: "Refresh devices", microphoneDevice: "Microphone device", microphoneGain: "Microphone gain", mute: "Mute", active: "Active", noMicrophone: "No microphone detected", level: "Live level", systemMeter: "System level",
    cameraDevice: "Camera device", noCamera: "No camera detected", shape: "Shape", position: "Position", size: "Size", mirror: "Mirror", opacity: "Opacity", rounded: "Rounded", circle: "Circle", square: "Square", topLeft: "Top left", topRight: "Top right", bottomLeft: "Bottom left", bottomRight: "Bottom right",
    presentation: "Presentation canvas", padding: "Padding", background: "Background", presentationNote: "Enabled canvas framing is composited before encoding, so the final recording matches these controls.",
    last: "Latest recording", noRecording: "No recording has been finalized in this session.", open: "Open", reveal: "Show in folder", delete: "Delete", exportMp4: "Export MP4", exported: "MP4 export completed locally and was verified.", recordings: "Saved recordings", load: "Refresh library", emptyLibrary: "Your finalized local recordings will appear here.", created: "Created", duration: "Duration", sizeLabel: "Size", muxed: "System audio muxed", sidecar: "System WAV source retained",
    desktopStorage: "Local storage", folder: "Recording folder", chooseFolder: "Change folder", available: "Available", unavailable: "Unavailable", writable: "Writable", yes: "Yes", no: "No", language: "Language", english: "English", arabic: "العربية", globalShortcut: "Global shortcut", shortcutValue: "Ctrl + Shift + R",
    error: "Recorder error", dismiss: "Dismiss", desktopRequired: "Desktop capture sources are available in the KNOuX REC Windows application.", media: "Local media runtime", verified: "Verified", unavailableRuntime: "Unavailable",
  },
  ar: {
    capture: "الالتقاط", library: "المكتبة", editor: "المحرر", captions: "التسميات", export: "التصدير", audio: "استديو الصوت", camera: "استديو الكاميرا", settings: "الإعدادات",
    record: "تسجيل", stop: "إيقاف", pause: "إيقاف مؤقت", resume: "استئناف", ready: "جاهز", recording: "جارٍ التسجيل", paused: "متوقف مؤقتاً", finalizing: "جارٍ الإنهاء بأمان", failed: "يتطلب الانتباه",
    sourcePicker: "منتقي المصدر", sourceHint: "توفر أداة سطح المكتب في Windows صوراً مصغرة حية للشاشات والتطبيقات.", refresh: "تحديث", noSources: "لم يُعثر على مصادر التقاط متوافقة.", selected: "المحدد",
    display: "شاشة", window: "نافذة", region: "منطقة", captureMode: "وضع الالتقاط", selectRegion: "اختيار منطقة", regionSelected: "تم اختيار منطقة", screen: "شاشة", application: "تطبيق",
    quality: "الجودة", frameRate: "معدل الإطارات", destination: "الوجهة", targetOnly: "إعداد مستهدف", timer: "المدة", written: "المكتوب على القرص", screenshot: "لقطة شاشة", screenshotReady: "تم حفظ لقطة شاشة حقيقية عبر مسار تنزيل المتصفح.",
    systemAudio: "صوت النظام", microphone: "الميكروفون", cameraOverlay: "كاميرا داخل الصورة", systemAudioNote: "يُلتقط WASAPI محلياً في Windows ثم يُدمج داخل WebM النهائي ويُتحقق منه بـ FFprobe.",
    outputDevice: "جهاز إخراج Windows", refreshDevices: "تحديث الأجهزة", microphoneDevice: "جهاز الميكروفون", microphoneGain: "كسب الميكروفون", mute: "كتم", active: "نشط", noMicrophone: "لم يُكتشف ميكروفون", level: "المستوى الحي", systemMeter: "مستوى النظام",
    cameraDevice: "جهاز الكاميرا", noCamera: "لم تُكتشف كاميرا", shape: "الشكل", position: "الموضع", size: "الحجم", mirror: "مرآة", opacity: "الشفافية", rounded: "مستدير", circle: "دائري", square: "مربع", topLeft: "أعلى اليسار", topRight: "أعلى اليمين", bottomLeft: "أسفل اليسار", bottomRight: "أسفل اليمين",
    presentation: "لوحة العرض", padding: "الحشوة", background: "الخلفية", presentationNote: "يُركب إطار اللوحة المفعّل قبل الترميز، لذا يطابق التسجيل النهائي هذه العناصر.",
    last: "أحدث تسجيل", noRecording: "لم يتم إنهاء أي تسجيل في هذه الجلسة.", open: "فتح", reveal: "إظهار في المجلد", delete: "حذف", exportMp4: "تصدير MP4", exported: "اكتمل تصدير MP4 محلياً وتم التحقق منه.", recordings: "التسجيلات المحفوظة", load: "تحديث المكتبة", emptyLibrary: "ستظهر هنا تسجيلاتك المحلية التي تم إنهاؤها.", created: "تاريخ الإنشاء", duration: "المدة", sizeLabel: "الحجم", muxed: "تم دمج صوت النظام", sidecar: "تم الاحتفاظ بمصدر WAV للنظام",
    desktopStorage: "التخزين المحلي", folder: "مجلد التسجيلات", chooseFolder: "تغيير المجلد", available: "المتاح", unavailable: "غير متاح", writable: "قابل للكتابة", yes: "نعم", no: "لا", language: "اللغة", english: "English", arabic: "العربية", globalShortcut: "الاختصار العام", shortcutValue: "Ctrl + Shift + R",
    error: "خطأ في المسجل", dismiss: "إغلاق", desktopRequired: "تظهر مصادر سطح المكتب داخل تطبيق KNOuX REC على Windows.", media: "محرك الوسائط المحلي", verified: "تم التحقق", unavailableRuntime: "غير متاح",
  },
} as const;

type TranslationSet = { [Key in keyof typeof copy.en]: string };

const captureModes: CaptureMode[] = ["display", "window", "region"];
const cameraShapes: CameraPipShape[] = ["rounded", "circle", "square"];
const cameraPositions: CameraPipPosition[] = ["top-left", "top-right", "bottom-left", "bottom-right"];

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => value.toString().padStart(2, "0")).join(":");
}

function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length);
  return `${(bytes / 1024 ** exponent).toFixed(bytes >= 1024 ** 3 ? 2 : 1)} ${units[exponent - 1]}`;
}

function formatDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-AE" : "en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function statusLabel(status: string, t: TranslationSet): string {
  if (status === "recording") return t.recording;
  if (status === "paused") return t.paused;
  if (status === "finalizing") return t.finalizing;
  if (status === "failed") return t.failed;
  return t.ready;
}

function Meter({ value, label }: { value: number; label: string }) {
  const normalized = Math.min(100, Math.max(0, value / 10));
  return <div className="meter" aria-label={`${label}: ${Math.round(normalized)}%`}><div className="meter-head"><span>{label}</span><strong>{Math.round(normalized)}%</strong></div><div className="meter-rail"><i style={{ width: `${normalized}%` }} /></div></div>;
}

export default function App() {
  const { state, actions } = useRecorder();
  const [panel, setPanel] = useState<Panel>("capture");
  const [locale, setLocale] = useState<Locale>("en");
  const [health, setHealth] = useState<RecorderHealth | null>(null);
  const [records, setRecords] = useState<RecordingRecord[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [mediaAvailable, setMediaAvailable] = useState<boolean | null>(null);
  const [selectedProjectRecordingId, setSelectedProjectRecordingId] = useState<string | null>(null);
  const [project, setProject] = useState<KnouxProject | null>(null);
  const [projectHistory, setProjectHistory] = useState<KnouxProject[]>([]);
  const [projectHistoryIndex, setProjectHistoryIndex] = useState(0);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectSaving, setProjectSaving] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const projectRef = useRef<KnouxProject | null>(null);
  const projectHistoryRef = useRef<KnouxProject[]>([]);
  const projectHistoryIndexRef = useRef(0);
  const t = copy[locale];
  const isBusy = state.status === "recording" || state.status === "paused" || state.status === "finalizing";
  const direction = locale === "ar" ? "rtl" : "ltr";

  const loadHealth = useCallback(async () => {
    if (!window.knouxRec) return;
    setHealth(await window.knouxRec.system.health());
  }, []);
  const loadLibrary = useCallback(async () => {
    if (!window.knouxRec) return;
    setRecords(await window.knouxRec.recording.list());
  }, []);

  useEffect(() => {
    if (!window.knouxRec) return;
    void Promise.all([window.knouxRec.settings.get(), loadHealth(), loadLibrary(), window.knouxRec.media.getRuntimeStatus()]).then(([settings, , , runtime]) => {
      setLocale(settings.locale);
      setMediaAvailable(runtime.available);
    });
  }, [loadHealth, loadLibrary]);
  useEffect(() => { if (state.lastRecording) void loadLibrary(); }, [loadLibrary, state.lastRecording]);

  const updateLocale = async (nextLocale: Locale) => {
    setLocale(nextLocale);
    if (window.knouxRec) await window.knouxRec.settings.update({ locale: nextLocale });
  };
  const saveScreenshot = async () => {
    setNotice(null);
    const result = await actions.takeScreenshot({ format: "png", timestamp: true });
    if (!result.success || !result.blob) throw new Error(result.error || "Screenshot capture failed.");
    const url = URL.createObjectURL(result.blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.filename || "KNOuX-REC-screenshot.png";
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice(t.screenshotReady);
  };
  const changeFolder = async () => { if (window.knouxRec && await window.knouxRec.system.chooseRecordingDirectory()) await loadHealth(); };
  const deleteRecord = async (id: string) => { if (window.knouxRec) { await window.knouxRec.recording.remove(id); await loadLibrary(); } };
  const exportRecord = async (id: string) => { if (!window.knouxRec) return; await window.knouxRec.project.export({ recordingId: id, format: "mp4" }); setNotice(t.exported); };
  const selectMode = async (mode: CaptureMode) => {
    actions.setCaptureMode(mode);
    if (mode === "region" && state.isDesktop) await actions.selectRegion();
  };

  const loadProject = useCallback(async (recordingId: string) => {
    if (!window.knouxRec) return;
    setProjectLoading(true);
    setProjectError(null);
    try {
      const loaded = await window.knouxRec.project.get(recordingId);
      if (!loaded) throw new Error("The recording project is not available.");
      const snapshot = cloneProject(loaded);
      setSelectedProjectRecordingId(recordingId);
      projectRef.current = snapshot;
      projectHistoryRef.current = [snapshot];
      projectHistoryIndexRef.current = 0;
      setProject(snapshot);
      setProjectHistory([snapshot]);
      setProjectHistoryIndex(0);
    } catch (reason) {
      projectRef.current = null;
      projectHistoryRef.current = [];
      projectHistoryIndexRef.current = 0;
      setProject(null);
      setProjectHistory([]);
      setProjectHistoryIndex(0);
      setProjectError(reason instanceof Error ? reason.message : "Unable to load the local project.");
    } finally {
      setProjectLoading(false);
    }
  }, []);

  const updateProject = useCallback((mutator: (current: KnouxProject) => KnouxProject) => {
    const current = projectRef.current;
    if (!current) return;
    const next = cloneProject(mutator(cloneProject(current)));
    const nextHistory = [...projectHistoryRef.current.slice(0, projectHistoryIndexRef.current + 1), next];
    projectRef.current = next;
    projectHistoryRef.current = nextHistory;
    projectHistoryIndexRef.current = nextHistory.length - 1;
    setProject(next);
    setProjectHistory(nextHistory);
    setProjectHistoryIndex(nextHistory.length - 1);
  }, []);

  const undoProject = useCallback(() => {
    if (projectHistoryIndexRef.current <= 0) return;
    const previousIndex = projectHistoryIndexRef.current - 1;
    const previous = cloneProject(projectHistoryRef.current[previousIndex]);
    projectRef.current = previous;
    projectHistoryIndexRef.current = previousIndex;
    setProject(previous);
    setProjectHistoryIndex(previousIndex);
  }, []);

  const redoProject = useCallback(() => {
    if (projectHistoryIndexRef.current >= projectHistoryRef.current.length - 1) return;
    const nextIndex = projectHistoryIndexRef.current + 1;
    const next = cloneProject(projectHistoryRef.current[nextIndex]);
    projectRef.current = next;
    projectHistoryIndexRef.current = nextIndex;
    setProject(next);
    setProjectHistoryIndex(nextIndex);
  }, []);

  const saveProject = useCallback(async () => {
    if (!window.knouxRec || !project) return;
    setProjectSaving(true);
    setProjectError(null);
    try {
      const saved = await window.knouxRec.project.save(project);
      const snapshot = cloneProject(saved);
      projectRef.current = snapshot;
      projectHistoryRef.current = [snapshot];
      projectHistoryIndexRef.current = 0;
      setProject(snapshot);
      setProjectHistory([snapshot]);
      setProjectHistoryIndex(0);
    } catch (reason) {
      setProjectError(reason instanceof Error ? reason.message : "Unable to save the local project.");
    } finally {
      setProjectSaving(false);
    }
  }, [project]);

  const openProject = useCallback((recordingId: string, targetPanel: ProjectWorkspacePanel = "editor") => {
    setPanel(targetPanel);
    void loadProject(recordingId);
  }, [loadProject]);

  useEffect(() => {
    if ((panel === "editor" || panel === "captions" || panel === "export") && records.length && !selectedProjectRecordingId) void loadProject(records[0].id);
  }, [loadProject, panel, records, selectedProjectRecordingId]);

  const visibleSources = state.sources.filter((source) => state.captureMode === "window" ? source.kind === "window" : source.kind === "screen");
  const selectedSource = state.sources.find((source) => source.id === state.selectedSourceId) ?? null;
  const metrics = useMemo(() => [
    { label: t.timer, value: formatTime(state.recordingTime) },
    { label: t.written, value: `${formatBytes(state.bytesWritten)} · ${state.chunksWritten}` },
    { label: t.globalShortcut, value: t.shortcutValue },
  ], [state.bytesWritten, state.chunksWritten, state.recordingTime, t.globalShortcut, t.shortcutValue, t.timer, t.written]);

  return <main className="app-shell" dir={direction}>
    <aside className="sidebar" aria-label="KNOuX REC navigation">
      <div className="brand"><span className="brand-mark">K</span><span><strong>KNOuX</strong><small>REC</small></span></div>
      <nav className="nav-list">{(["capture", "library", "editor", "captions", "export", "audio", "camera", "settings"] as Panel[]).map((item) => <button key={item} className={`nav-button ${panel === item ? "active" : ""}`} onClick={() => setPanel(item)}>{t[item]}</button>)}</nav>
      <div className="sidebar-foot"><span className={`status-dot ${state.status}`} />{statusLabel(state.status, t)}</div>
    </aside>

    <section className="workspace">
      <header className="topbar"><div><p className="eyebrow">WINDOWS RECORDING STUDIO</p><h1>{t[panel]}</h1></div><div className="topbar-actions"><button className="language-button" onClick={() => void updateLocale(locale === "en" ? "ar" : "en")}>{locale === "en" ? t.arabic : t.english}</button><div className="connection-pill"><span className={state.isDesktop ? "connected" : "disconnected"} />{state.isDesktop ? "Desktop" : "Browser"}</div></div></header>
      {state.error && <section className="alert" role="alert"><div><strong>{t.error}</strong><p>{state.error}</p></div><button onClick={actions.clearError}>{t.dismiss}</button></section>}
      {notice && <section className="notice"><span>{notice}</span><button onClick={() => setNotice(null)}>×</button></section>}

      {panel === "capture" && <div className="capture-layout">
        <section className="capture-primary card"><div className="section-heading"><div><p className="eyebrow">CAPTURE</p><h2>{t.sourcePicker}</h2><p>{state.isDesktop ? t.sourceHint : t.desktopRequired}</p></div><button className="secondary-button" disabled={isBusy || !state.isDesktop} onClick={() => void actions.refreshSources()}>{t.refresh}</button></div>
          <div className="segmented capture-mode" aria-label={t.captureMode}>{captureModes.map((mode) => <button key={mode} className={state.captureMode === mode ? "active" : ""} disabled={isBusy || !state.isDesktop} onClick={() => void selectMode(mode)}>{t[mode]}</button>)}</div>
          {state.captureMode === "region" && state.regionSelection && <p className="mode-note">{t.regionSelected}: {state.regionSelection.physicalBounds.width} × {state.regionSelection.physicalBounds.height}px <button className="secondary-button compact" disabled={isBusy} onClick={() => void actions.selectRegion()}>{t.selectRegion}</button></p>}
          {state.isDesktop && visibleSources.length ? <div className="source-grid">{visibleSources.map((source) => <button key={source.id} className={`source-card ${source.id === state.selectedSourceId ? "selected" : ""}`} onClick={() => actions.selectSource(source.id)} disabled={isBusy}><img src={source.thumbnailDataUrl} alt="" /><span className="source-copy"><b>{source.name || (source.kind === "screen" ? t.screen : t.window)}</b><small>{source.kind === "screen" ? `${t.screen} · ${source.displayId || "Windows"}` : `${t.application} · ${t.window}`}</small></span>{source.id === state.selectedSourceId && <span className="selection-badge">{t.selected}</span>}</button>)}</div> : <div className="empty-source">{state.isDesktop ? t.noSources : t.desktopRequired}</div>}
        </section>
        <aside className="control-stack"><section className="card control-card"><p className="eyebrow">SESSION</p><h2>{statusLabel(state.status, t)}</h2><div className="timer">{formatTime(state.recordingTime)}</div><div className="metric-list">{metrics.map((metric) => <div key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></div>)}</div></section>
          <section className="card control-card"><p className="eyebrow">PROFILE</p><label>{t.quality}<select value={state.recordingQuality} disabled={isBusy} onChange={(event) => actions.setRecordingQuality(event.target.value as typeof state.recordingQuality)}><option value="720p">720p</option><option value="1080p">1080p</option><option value="1440p">1440p</option><option value="4k">4K</option></select><small>{t.targetOnly}</small></label><label>{t.frameRate}<select value={state.frameRate} disabled={isBusy} onChange={(event) => actions.setFrameRate(Number(event.target.value) as 30 | 60)}><option value={30}>30 FPS</option><option value={60}>60 FPS</option></select></label><label className="toggle-row"><span>{t.systemAudio}</span><input type="checkbox" checked={state.includeSystemAudio} disabled={isBusy || !state.isDesktop} onChange={(event) => actions.setIncludeSystemAudio(event.target.checked)} /></label><label className="toggle-row"><span>{t.microphone}</span><input type="checkbox" checked={state.includeMicrophone} disabled={isBusy || !state.microphoneDevices.length} onChange={(event) => actions.setIncludeMicrophone(event.target.checked)} /></label><label className="toggle-row"><span>{t.cameraOverlay}</span><input type="checkbox" checked={state.includeCamera} disabled={isBusy || !state.devices.length} onChange={(event) => actions.setIncludeCamera(event.target.checked)} /></label></section></aside>
        <section className="record-deck card"><div><p className="eyebrow">{selectedSource ? selectedSource.name : t.sourcePicker}</p><h2>{state.status === "idle" ? t.ready : statusLabel(state.status, t)}</h2><p className="muted">{t.destination}: {health?.recordingDirectory || "—"}</p></div><div className="record-actions">{state.status === "recording" && <button className="secondary-button" onClick={actions.pauseRecording}>{t.pause}</button>}{state.status === "paused" && <button className="secondary-button" onClick={actions.resumeRecording}>{t.resume}</button>}{isBusy ? <button className="record-button stop" onClick={() => void actions.stopRecording()} disabled={state.status === "finalizing"}>{t.stop}</button> : <button className="record-button" onClick={() => void actions.startRecording()} disabled={!state.isInitialized || (state.isDesktop && !state.selectedSourceId)}>{t.record}</button>}<button className="secondary-button" disabled={isBusy} onClick={() => void saveScreenshot()}>{t.screenshot}</button></div></section>
      </div>}

      {panel === "audio" && <div className="studio-grid"><section className="card studio-card"><p className="eyebrow">WASAPI</p><h2>{t.systemAudio}</h2><p className="muted">{t.systemAudioNote}</p><label className="toggle-row"><span>{t.active}</span><input type="checkbox" checked={state.includeSystemAudio} disabled={isBusy || !state.isDesktop} onChange={(event) => actions.setIncludeSystemAudio(event.target.checked)} /></label><label>{t.outputDevice}<div className="inline-select"><select value={state.selectedAudioOutputId || ""} disabled={isBusy || !state.audioOutputDevices.length} onChange={(event) => actions.setAudioOutput(event.target.value || null)}>{state.audioOutputDevices.map((device) => <option key={device.id} value={device.id}>{device.name}{device.isDefault ? " (Default)" : ""}</option>)}</select><button className="secondary-button compact" disabled={isBusy} onClick={() => void actions.refreshAudioOutputs()}>{t.refreshDevices}</button></div></label><Meter label={t.systemMeter} value={state.nativeAudioCapture?.peakPermille || 0} /></section>
        <section className="card studio-card"><p className="eyebrow">INPUT</p><h2>{t.microphone}</h2>{state.microphoneDevices.length ? <><label className="toggle-row"><span>{t.active}</span><input type="checkbox" checked={state.includeMicrophone} disabled={isBusy} onChange={(event) => actions.setIncludeMicrophone(event.target.checked)} /></label><label>{t.microphoneDevice}<select value={state.currentMicrophoneDevice || ""} disabled={isBusy} onChange={(event) => actions.setMicrophoneDevice(event.target.value || null)}>{state.microphoneDevices.map((device) => <option key={device.deviceId} value={device.deviceId}>{device.label || t.microphone}</option>)}</select></label><label>{t.microphoneGain}<input type="range" min="0" max="2" step="0.05" value={state.microphoneGain} disabled={isBusy} onChange={(event) => actions.setMicrophoneGain(Number(event.target.value))} /><small>{state.microphoneGain.toFixed(2)}×</small></label><label className="toggle-row"><span>{t.mute}</span><input type="checkbox" checked={state.microphoneMuted} disabled={isBusy} onChange={(event) => actions.setMicrophoneMuted(event.target.checked)} /></label><Meter label={t.level} value={state.microphonePeakPermille} /></> : <div className="empty-library">{t.noMicrophone}</div>}</section></div>}

      {panel === "camera" && <div className="studio-grid"><section className="card studio-card"><p className="eyebrow">CAMERA</p><h2>{t.cameraOverlay}</h2>{state.devices.length ? <><label className="toggle-row"><span>{t.active}</span><input type="checkbox" checked={state.includeCamera} disabled={isBusy} onChange={(event) => actions.setIncludeCamera(event.target.checked)} /></label><label>{t.cameraDevice}<select value={state.currentDevice || ""} disabled={isBusy} onChange={(event) => actions.setDevice(event.target.value)}>{state.devices.map((device) => <option key={device.deviceId} value={device.deviceId}>{device.label || t.cameraOverlay}</option>)}</select></label><label>{t.shape}<select value={state.cameraShape} disabled={isBusy} onChange={(event) => actions.setCameraShape(event.target.value as CameraPipShape)}>{cameraShapes.map((shape) => <option key={shape} value={shape}>{t[shape]}</option>)}</select></label><label>{t.position}<select value={state.cameraPosition} disabled={isBusy} onChange={(event) => actions.setCameraPosition(event.target.value as CameraPipPosition)}>{cameraPositions.map((position) => <option key={position} value={position}>{t[position.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()) as "topLeft" | "topRight" | "bottomLeft" | "bottomRight"]}</option>)}</select></label><label>{t.size}<input type="range" min="0.12" max="0.4" step="0.01" value={state.cameraScale} disabled={isBusy} onChange={(event) => actions.setCameraScale(Number(event.target.value))} /></label><label>{t.opacity}<input type="range" min="0.2" max="1" step="0.05" value={state.cameraOpacity} disabled={isBusy} onChange={(event) => actions.setCameraOpacity(Number(event.target.value))} /></label><label className="toggle-row"><span>{t.mirror}</span><input type="checkbox" checked={state.cameraMirror} disabled={isBusy} onChange={(event) => actions.setCameraMirror(event.target.checked)} /></label></> : <div className="empty-library">{t.noCamera}</div>}</section>
        <section className="card studio-card"><p className="eyebrow">CANVAS</p><h2>{t.presentation}</h2><p className="muted">{t.presentationNote}</p><label>{t.padding}<input type="range" min="0" max="0.2" step="0.01" value={state.presentationPadding} disabled={isBusy} onChange={(event) => actions.setPresentationPadding(Number(event.target.value))} /><small>{Math.round(state.presentationPadding * 100)}%</small></label><label>{t.background}<input type="color" value={state.presentationBackground} disabled={isBusy} onChange={(event) => actions.setPresentationBackground(event.target.value)} /></label></section></div>}

      {panel === "library" && <section className="card library-panel"><div className="section-heading"><div><p className="eyebrow">LOCAL MEDIA</p><h2>{t.recordings}</h2></div><button className="secondary-button" disabled={!state.isDesktop} onClick={() => void loadLibrary()}>{t.load}</button></div>{records.length ? <div className="record-table">{records.map((record) => <article key={record.id} className="record-row"><div className="record-icon">REC</div><div className="record-info"><strong>{record.fileName}</strong><span>{formatDate(record.createdAt, locale)} · {formatTime(Math.floor(record.durationMs / 1000))} · {formatBytes(record.sizeBytes)}{record.media?.video?.codec ? ` · ${record.media.video.codec.toUpperCase()}` : ""}{record.systemAudioMuxed ? ` · ${t.muxed}` : ""}</span>{record.nativeSystemAudio && <small>{t.sidecar}</small>}</div><div className="record-actions"><button className="secondary-button" onClick={() => void window.knouxRec?.recording.open(record.id)}>{t.open}</button><button className="secondary-button" onClick={() => void window.knouxRec?.recording.reveal(record.id)}>{t.reveal}</button><button className="secondary-button" onClick={() => openProject(record.id, "editor")}>{t.editor}</button><button className="secondary-button" onClick={() => void exportRecord(record.id)}>{t.exportMp4}</button><button className="danger-button" onClick={() => void deleteRecord(record.id)}>{t.delete}</button></div></article>)}</div> : <div className="empty-library">{state.isDesktop ? t.emptyLibrary : t.desktopRequired}</div>}</section>}

      {(panel === "editor" || panel === "captions" || panel === "export") && <ProjectWorkspace panel={panel} locale={locale} records={records} selectedRecordingId={selectedProjectRecordingId} project={project} loading={projectLoading} saving={projectSaving} dirty={projectHistoryIndex !== 0} error={projectError} canUndo={projectHistoryIndex > 0} canRedo={projectHistoryIndex < projectHistory.length - 1} onSelectRecording={(recordingId) => void loadProject(recordingId)} onChange={updateProject} onSave={() => void saveProject()} onUndo={undoProject} onRedo={redoProject} />}

      {panel === "settings" && <div className="settings-grid"><section className="card"><p className="eyebrow">PREFERENCES</p><h2>{t.language}</h2><div className="segmented"><button className={locale === "en" ? "active" : ""} onClick={() => void updateLocale("en")}>{t.english}</button><button className={locale === "ar" ? "active" : ""} onClick={() => void updateLocale("ar")}>{t.arabic}</button></div><h3>{t.media}</h3><p className="muted">{mediaAvailable ? t.verified : t.unavailableRuntime}</p></section><section className="card"><p className="eyebrow">{t.desktopStorage}</p><h2>{t.folder}</h2>{health ? <div className="storage-details"><code>{health.recordingDirectory}</code><div><span>{t.writable}</span><strong>{health.writable ? t.yes : t.no}</strong></div><div><span>{t.available}</span><strong>{formatBytes(health.freeBytes)}</strong></div></div> : <p className="muted">{t.unavailable}</p>}<button className="secondary-button" disabled={!state.isDesktop} onClick={() => void changeFolder()}>{t.chooseFolder}</button></section></div>}
    </section>
  </main>;
}
