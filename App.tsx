import { useEffect, useMemo } from "react";
import { useRecorder } from "./hooks/useRecorder";

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

export default function App() {
  const { state, actions } = useRecorder();

  const previewUrl = useMemo(
    () => (state.recordingBlob ? URL.createObjectURL(state.recordingBlob) : null),
    [state.recordingBlob],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <section className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-violet-300">
              KNOuX
            </p>
            <h1 className="text-3xl font-bold">REC</h1>
            <p className="mt-2 text-sm text-slate-400">
              Screen recorder only Ã¢â‚¬â€ clean production baseline
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
            <div className="text-xs text-slate-400">Session</div>
            <div className="font-mono text-2xl">{formatTime(state.recordingTime)}</div>
          </div>
        </header>

        {state.error && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
            {state.error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-5 text-xl font-semibold">Capture</h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="rounded-2xl border border-white/10 p-4">
                <span className="block text-sm text-slate-300">Quality</span>
                <select
                  className="mt-2 w-full rounded-xl bg-slate-900 p-3"
                  value={state.recordingQuality}
                  disabled={state.isRecording}
                  onChange={(e) =>
                    actions.setRecordingQuality(
                      e.target.value as typeof state.recordingQuality,
                    )
                  }
                >
                  <option value="low">720p</option>
                  <option value="medium">1080p</option>
                  <option value="high">1440p</option>
                  <option value="ultra">4K</option>
                </select>
              </label>

              <label className="rounded-2xl border border-white/10 p-4">
                <span className="block text-sm text-slate-300">Frame rate</span>
                <select
                  className="mt-2 w-full rounded-xl bg-slate-900 p-3"
                  value={state.frameRate}
                  disabled={state.isRecording}
                  onChange={(e) => actions.setFrameRate(Number(e.target.value))}
                >
                  <option value={30}>30 FPS</option>
                  <option value={60}>60 FPS</option>
                </select>
              </label>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex items-center justify-between rounded-2xl border border-white/10 p-4">
                <span>System / shared audio</span>
                <input
                  type="checkbox"
                  checked={state.includeAudio}
                  disabled={state.isRecording}
                  onChange={(e) => actions.setIncludeAudio(e.target.checked)}
                />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-white/10 p-4">
                <span>Microphone</span>
                <input
                  type="checkbox"
                  checked={state.includeMicrophone}
                  disabled={state.isRecording}
                  onChange={(e) => actions.setIncludeMicrophone(e.target.checked)}
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {!state.isRecording ? (
                <button
                  className="rounded-2xl bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-500"
                  onClick={() => void actions.startRecording()}
                >
                  Start screen recording
                </button>
              ) : (
                <>
                  <button
                    className="rounded-2xl bg-red-600 px-6 py-3 font-semibold hover:bg-red-500"
                    onClick={() => void actions.stopRecording()}
                  >
                    Stop
                  </button>
                  {!state.isPaused ? (
                    <button
                      className="rounded-2xl bg-amber-600 px-6 py-3 font-semibold hover:bg-amber-500"
                      onClick={actions.pauseRecording}
                    >
                      Pause
                    </button>
                  ) : (
                    <button
                      className="rounded-2xl bg-emerald-600 px-6 py-3 font-semibold hover:bg-emerald-500"
                      onClick={actions.resumeRecording}
                    >
                      Resume
                    </button>
                  )}
                </>
              )}

              <button
                className="rounded-2xl border border-white/15 px-6 py-3 font-semibold hover:bg-white/10"
                disabled={state.isRecording}
                onClick={() => void actions.takeScreenshot({ watermark: false })}
              >
                Screenshot
              </button>

              <button
                className="rounded-2xl border border-white/15 px-6 py-3 font-semibold hover:bg-white/10"
                disabled={state.isRecording}
                onClick={() => void actions.startWebcamRecording()}
              >
                Camera only
              </button>
            </div>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-semibold">Status</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Recorder</dt>
                <dd>{state.isRecording ? (state.isPaused ? "Paused" : "Recording") : "Ready"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">FPS target</dt>
                <dd>{state.frameRate}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Bitrate</dt>
                <dd>{Math.round(state.bitRate / 1_000_000)} Mbps</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Camera devices</dt>
                <dd>{state.devices.length}</dd>
              </div>
            </dl>
          </aside>
        </div>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-xl font-semibold">Latest recording</h2>

          {previewUrl ? (
            <>
              <video
                className="max-h-[520px] w-full rounded-2xl bg-black"
                src={previewUrl}
                controls
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="rounded-2xl bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500"
                  onClick={actions.downloadRecording}
                >
                  Save recording
                </button>
                <button
                  className="rounded-2xl border border-white/15 px-5 py-3 font-semibold hover:bg-white/10"
                  onClick={actions.clearRecording}
                >
                  Clear preview
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-slate-500">
              No recording yet.
            </div>
          )}
        </section>
      </section>
    </main>
  );
}