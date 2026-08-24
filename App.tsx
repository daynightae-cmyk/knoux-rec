import { useCallback, useEffect, useMemo, useState } from "react";
import type { RecorderHealth, RecordingRecord } from "./desktop/contracts";
import { useRecorder } from "./hooks/useRecorder";

type Panel = "capture" | "library" | "settings";
type Locale = "en" | "ar";

const copy = {
  en: {
    capture: "Capture", library: "Library", settings: "Settings", record: "Record", stop: "Stop", pause: "Pause", resume: "Resume",
    sources: "Choose a source", refresh: "Refresh sources", selected: "Selected", systemAudio: "System audio", microphone: "Microphone",
    target: "Capture target", frameRate: "Frame rate", quality: "Quality", desktopRequired: "Desktop capture sources are available in the KNOuX REC Windows application.",
    recording: "Recording", ready: "Ready", paused: "Paused", finalizing: "Finalizing safely", failed: "Needs attention", timer: "Elapsed", written: "Written to disk",
    sourceHint: "The picker shows live thumbnails from your connected screens and windows.", noSources: "No capture sources were found. Refresh, or verify that Windows is not blocking screen capture.",
    last: "Latest recording", open: "Open", reveal: "Show in folder", noRecording: "No recording has been finalized in this session.", screenshot: "Screenshot", screenshotReady: "A real screenshot was saved through your browser download flow.",
    recordings: "Saved recordings", load: "Refresh library", emptyLibrary: "Your finalized local recordings will appear here.", delete: "Delete", created: "Created", duration: "Duration", size: "Size",
    desktopStorage: "Local storage", folder: "Recording folder", chooseFolder: "Change folder", available: "Available", unavailable: "Unavailable", writable: "Writable", yes: "Yes", no: "No",
    language: "Language", english: "English", arabic: "العربية", camera: "Available cameras", noCamera: "No camera detected", error: "Recorder error", dismiss: "Dismiss",
    shortcut: "Global shortcut", shortcutValue: "Ctrl + Shift + R", targetQuality: "target only", systemAudioNote: "Uses native Windows WASAPI loopback in the desktop app; if initialization fails, recording does not start.", audioDevice: "Windows output device", refreshDevices: "Refresh devices", nativeAudioSidecar: "Native system audio is saved as a verified WAV sidecar next to the video; muxing into the WebM container is not implemented yet.", cameraOverlay: "Camera picture-in-picture", cameraOverlayNote: "The camera is composited into the recorded canvas at the lower-right corner.",
  },
  ar: {
    capture: "الالتقاط", library: "المكتبة", settings: "الإعدادات", record: "تسجيل", stop: "إيقاف", pause: "إيقاف مؤقت", resume: "استئناف",
    sources: "اختر مصدرًا", refresh: "تحديث المصادر", selected: "المحدد", systemAudio: "صوت النظام", microphone: "الميكروفون",
    target: "هدف الالتقاط", frameRate: "معدل الإطارات", quality: "الجودة", desktopRequired: "تظهر مصادر سطح المكتب داخل تطبيق KNOuX REC على Windows.",
    recording: "جارٍ التسجيل", ready: "جاهز", paused: "متوقف مؤقتًا", finalizing: "جارٍ الإنهاء بأمان", failed: "يتطلب الانتباه", timer: "المدة", written: "المكتوب على القرص",
    sourceHint: "يعرض المنتقي صورًا مصغّرة حية للشاشات والنوافذ المتصلة.", noSources: "لم يُعثر على مصادر التقاط. حدّث القائمة أو تحقق من أن Windows لا يمنع الالتقاط.",
    last: "أحدث تسجيل", open: "فتح", reveal: "إظهار في المجلد", noRecording: "لم يتم إنهاء أي تسجيل في هذه الجلسة.", screenshot: "لقطة شاشة", screenshotReady: "تم حفظ لقطة شاشة حقيقية عبر مسار تنزيل المتصفح.",
    recordings: "التسجيلات المحفوظة", load: "تحديث المكتبة", emptyLibrary: "ستظهر هنا تسجيلاتك المحلية التي تم إنهاؤها.", delete: "حذف", created: "تاريخ الإنشاء", duration: "المدة", size: "الحجم",
    desktopStorage: "التخزين المحلي", folder: "مجلد التسجيلات", chooseFolder: "تغيير المجلد", available: "المتاح", unavailable: "غير متاح", writable: "قابل للكتابة", yes: "نعم", no: "لا",
    language: "اللغة", english: "English", arabic: "العربية", camera: "الكاميرات المتاحة", noCamera: "لم يتم اكتشاف كاميرا", error: "خطأ في المسجل", dismiss: "إغلاق",
    shortcut: "الاختصار العام", shortcutValue: "Ctrl + Shift + R", targetQuality: "هدف فقط", systemAudioNote: "يستخدم التطبيق WASAPI loopback الأصلي في Windows؛ إذا فشلت التهيئة فلن يبدأ التسجيل.", audioDevice: "جهاز إخراج Windows", refreshDevices: "تحديث الأجهزة", nativeAudioSidecar: "يُحفظ صوت النظام الأصلي كملف WAV جانبي تم التحقق منه بجوار الفيديو؛ لم يُنفذ بعد دمجه داخل حاوية WebM.", cameraOverlay: "كاميرا داخل الصورة", cameraOverlayNote: "تُركّب الكاميرا داخل لوحة التسجيل في الزاوية السفلية اليمنى.",
  },
} as const;

type TranslationSet = { [Key in keyof typeof copy.en]: string };

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

export default function App() {
  const { state, actions } = useRecorder();
  const [panel, setPanel] = useState<Panel>("capture");
  const [locale, setLocale] = useState<Locale>("en");
  const [health, setHealth] = useState<RecorderHealth | null>(null);
  const [records, setRecords] = useState<RecordingRecord[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
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
    void Promise.all([window.knouxRec.settings.get(), loadHealth(), loadLibrary()]).then(([settings]) => setLocale(settings.locale));
  }, [loadHealth, loadLibrary]);

  useEffect(() => {
    if (state.lastRecording) void loadLibrary();
  }, [loadLibrary, state.lastRecording]);

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

  const changeFolder = async () => {
    if (!window.knouxRec) return;
    const selected = await window.knouxRec.system.chooseRecordingDirectory();
    if (selected) await loadHealth();
  };

  const deleteRecord = async (id: string) => {
    if (!window.knouxRec) return;
    await window.knouxRec.recording.remove(id);
    await loadLibrary();
  };

  const sourceCount = state.sources.length;
  const selectedSource = state.sources.find((source) => source.id === state.selectedSourceId) ?? null;
  const metrics = useMemo(() => [
    { label: t.timer, value: formatTime(state.recordingTime) },
    { label: t.written, value: `${formatBytes(state.bytesWritten)} · ${state.chunksWritten}` },
    { label: t.shortcut, value: t.shortcutValue },
  ], [state.bytesWritten, state.chunksWritten, state.recordingTime, t.shortcut, t.shortcutValue, t.timer, t.written]);

  return (
    <main className="app-shell" dir={direction}>
      <aside className="sidebar" aria-label="KNOuX REC navigation">
        <div className="brand"><span className="brand-mark">K</span><span><strong>KNOuX</strong><small>REC</small></span></div>
        <nav className="nav-list">
          {(["capture", "library", "settings"] as Panel[]).map((item) => (
            <button key={item} className={`nav-button ${panel === item ? "active" : ""}`} onClick={() => setPanel(item)}>
              {t[item]}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot"><span className={`status-dot ${state.status}`} />{statusLabel(state.status, t)}</div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div><p className="eyebrow">WINDOWS SCREEN RECORDER</p><h1>{t[panel]}</h1></div>
          <div className="topbar-actions">
            <button className="language-button" onClick={() => void updateLocale(locale === "en" ? "ar" : "en")}>{locale === "en" ? t.arabic : t.english}</button>
            <div className="connection-pill"><span className={state.isDesktop ? "connected" : "disconnected"} />{state.isDesktop ? "Desktop" : "Browser"}</div>
          </div>
        </header>

        {state.error && <section className="alert" role="alert"><div><strong>{t.error}</strong><p>{state.error}</p></div><button onClick={actions.clearError}>{t.dismiss}</button></section>}
        {notice && <section className="notice"><span>{notice}</span><button onClick={() => setNotice(null)}>×</button></section>}

        {panel === "capture" && (
          <div className="capture-layout">
            <section className="capture-primary card">
              <div className="section-heading"><div><p className="eyebrow">{t.target}</p><h2>{t.sources}</h2><p>{state.isDesktop ? t.sourceHint : t.desktopRequired}</p></div><button className="secondary-button" disabled={isBusy || !state.isDesktop} onClick={() => void actions.refreshSources()}>{t.refresh}</button></div>
              {state.isDesktop && sourceCount > 0 ? (
                <div className="source-grid">
                  {state.sources.map((source) => <button key={source.id} className={`source-card ${source.id === state.selectedSourceId ? "selected" : ""}`} onClick={() => actions.selectSource(source.id)} disabled={isBusy}>
                    <img src={source.thumbnailDataUrl} alt="" />
                    <span className="source-copy"><b>{source.name || (source.kind === "screen" ? "Screen" : "Window")}</b><small>{source.kind === "screen" ? "Display" : "Window"}</small></span>
                    {source.id === state.selectedSourceId && <span className="selection-badge">{t.selected}</span>}
                  </button>)}
                </div>
              ) : <div className="empty-source">{state.isDesktop ? t.noSources : t.desktopRequired}</div>}
            </section>

            <aside className="control-stack">
              <section className="card control-card"><p className="eyebrow">SESSION</p><h2>{statusLabel(state.status, t)}</h2><div className="timer">{formatTime(state.recordingTime)}</div><div className="metric-list">{metrics.map((metric) => <div key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></div>)}</div></section>
              <section className="card control-card"><p className="eyebrow">CONFIGURATION</p><label>{t.quality}<select value={state.recordingQuality} disabled={isBusy} onChange={(event) => actions.setRecordingQuality(event.target.value as typeof state.recordingQuality)}><option value="720p">720p</option><option value="1080p">1080p</option><option value="1440p">1440p</option><option value="4k">4K</option></select><small>{t.targetQuality}</small></label>
                <label>{t.frameRate}<select value={state.frameRate} disabled={isBusy} onChange={(event) => actions.setFrameRate(Number(event.target.value) as 30 | 60)}><option value={30}>30 FPS</option><option value={60}>60 FPS</option></select></label>
                <label className="toggle-row"><span>{t.systemAudio}<small>{t.systemAudioNote}</small></span><input type="checkbox" checked={state.includeSystemAudio} disabled={isBusy} onChange={(event) => actions.setIncludeSystemAudio(event.target.checked)} /></label>
                {state.includeSystemAudio && state.isDesktop && <label>{t.audioDevice}<div className="inline-select"><select value={state.selectedAudioOutputId || ""} disabled={isBusy || !state.audioOutputDevices.length} onChange={(event) => actions.setAudioOutput(event.target.value || null)}>{state.audioOutputDevices.map((device) => <option key={device.id} value={device.id}>{device.name}{device.isDefault ? " (Default)" : ""}</option>)}</select><button type="button" className="secondary-button compact" disabled={isBusy} onClick={() => void actions.refreshAudioOutputs()}>{t.refreshDevices}</button></div><small>{t.nativeAudioSidecar}</small></label>}
                <label className="toggle-row"><span>{t.microphone}</span><input type="checkbox" checked={state.includeMicrophone} disabled={isBusy} onChange={(event) => actions.setIncludeMicrophone(event.target.checked)} /></label>
                <label className="toggle-row"><span>{t.cameraOverlay}<small>{t.cameraOverlayNote}</small></span><input type="checkbox" checked={state.includeCamera} disabled={isBusy || !state.devices.length} onChange={(event) => actions.setIncludeCamera(event.target.checked)} /></label>
              </section>
            </aside>

            <section className="record-deck card">
              <div><p className="eyebrow">{selectedSource ? selectedSource.name : t.target}</p><h2>{state.status === "idle" ? t.ready : statusLabel(state.status, t)}</h2></div>
              <div className="record-actions">
                {state.status === "recording" && <button className="secondary-button" onClick={actions.pauseRecording}>{t.pause}</button>}
                {state.status === "paused" && <button className="secondary-button" onClick={actions.resumeRecording}>{t.resume}</button>}
                {isBusy ? <button className="record-button stop" onClick={() => void actions.stopRecording()} disabled={state.status === "finalizing"}>{t.stop}</button> : <button className="record-button" onClick={() => void actions.startRecording()} disabled={!state.isInitialized || (state.isDesktop && !state.selectedSourceId)}>{t.record}</button>}
                <button className="secondary-button" disabled={isBusy} onClick={() => void saveScreenshot()}>{t.screenshot}</button>
              </div>
            </section>

            <section className="card latest-card"><div className="section-heading"><div><p className="eyebrow">LOCAL FILE</p><h2>{t.last}</h2></div>{state.lastRecording && <span className="file-size">{formatBytes(state.lastRecording.sizeBytes)}</span>}</div>
              {state.lastRecording ? <div className="latest-row"><div><strong>{state.lastRecording.fileName}</strong><p>{formatDate(state.lastRecording.createdAt, locale)} · {formatTime(Math.floor(state.lastRecording.durationMs / 1000))}</p></div><div className="record-actions"><button className="secondary-button" onClick={() => void actions.openLastRecording()}>{t.open}</button><button className="secondary-button" onClick={() => void actions.revealLastRecording()}>{t.reveal}</button></div></div> : <div className="empty-library">{t.noRecording}</div>}
            </section>
          </div>
        )}

        {panel === "library" && <section className="card library-panel"><div className="section-heading"><div><p className="eyebrow">LOCAL MEDIA</p><h2>{t.recordings}</h2></div><button className="secondary-button" disabled={!state.isDesktop} onClick={() => void loadLibrary()}>{t.load}</button></div>
          {records.length ? <div className="record-table">{records.map((record) => <article key={record.id} className="record-row"><div className="record-icon">REC</div><div className="record-info"><strong>{record.fileName}</strong><span>{formatDate(record.createdAt, locale)} · {formatTime(Math.floor(record.durationMs / 1000))} · {formatBytes(record.sizeBytes)}{record.nativeSystemAudio ? ` · ${formatBytes(record.nativeSystemAudio.fileBytes)} WAV` : ""}</span></div><div className="record-actions"><button className="secondary-button" onClick={() => void window.knouxRec?.recording.open(record.id)}>{t.open}</button><button className="secondary-button" onClick={() => void window.knouxRec?.recording.reveal(record.id)}>{t.reveal}</button><button className="danger-button" onClick={() => void deleteRecord(record.id)}>{t.delete}</button></div></article>)}</div> : <div className="empty-library">{state.isDesktop ? t.emptyLibrary : t.desktopRequired}</div>}
        </section>}

        {panel === "settings" && <div className="settings-grid">
          <section className="card"><p className="eyebrow">PREFERENCES</p><h2>{t.language}</h2><div className="segmented"><button className={locale === "en" ? "active" : ""} onClick={() => void updateLocale("en")}>{t.english}</button><button className={locale === "ar" ? "active" : ""} onClick={() => void updateLocale("ar")}>{t.arabic}</button></div><h3>{t.camera}</h3>{state.devices.length ? <select value={state.currentDevice || ""} onChange={(event) => actions.setDevice(event.target.value)}>{state.devices.map((camera) => <option key={camera.deviceId} value={camera.deviceId}>{camera.label || "Camera"}</option>)}</select> : <p className="muted">{t.noCamera}</p>}</section>
          <section className="card"><p className="eyebrow">{t.desktopStorage}</p><h2>{t.folder}</h2>{health ? <div className="storage-details"><code>{health.recordingDirectory}</code><div><span>{t.writable}</span><strong>{health.writable ? t.yes : t.no}</strong></div><div><span>{t.available}</span><strong>{formatBytes(health.freeBytes)}</strong></div></div> : <p className="muted">{t.unavailable}</p>}<button className="secondary-button" disabled={!state.isDesktop} onClick={() => void changeFolder()}>{t.chooseFolder}</button></section>
        </div>}
      </section>
    </main>
  );
}
