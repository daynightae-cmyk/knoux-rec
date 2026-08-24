const REGION_MIN_SIZE = 64;
let active = null;

function createHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Choose capture region</title><style>
    *{box-sizing:border-box}html,body,#root{margin:0;width:100%;height:100%;overflow:hidden;background:rgba(7,10,18,.32);font-family:Segoe UI,Arial,sans-serif;color:#fff;user-select:none}
    #shade{position:fixed;inset:0;cursor:crosshair}#selection{position:fixed;border:2px solid #78b7ff;background:rgba(57,126,255,.18);display:none;box-shadow:0 0 0 9999px rgba(0,0,0,.34)}
    #hud{position:fixed;display:none;transform:translateY(-100%);padding:10px 12px;border-radius:10px;background:#111a2e;border:1px solid rgba(255,255,255,.22);box-shadow:0 10px 30px rgba(0,0,0,.38);font-size:12px;gap:10px;align-items:center}
    button{border:0;border-radius:7px;padding:7px 10px;font:inherit;font-weight:600;cursor:pointer;background:#78b7ff;color:#06111f}button.secondary{background:#27324b;color:#fff}.hint{position:fixed;left:50%;top:28px;transform:translateX(-50%);padding:10px 14px;border-radius:10px;background:rgba(17,26,46,.92);border:1px solid rgba(255,255,255,.16);font-size:13px}
  </style></head><body><div id="shade"></div><div id="selection"></div><div id="hud"><span id="metrics"></span><button id="confirm">Confirm</button><button id="cancel" class="secondary">Cancel</button></div><div class="hint">Drag to select a recording region. Confirm to continue, or press Esc to cancel.</div><script>
  (()=>{const shade=document.getElementById('shade'),selection=document.getElementById('selection'),hud=document.getElementById('hud'),metrics=document.getElementById('metrics');let config=null,start=null,rect=null;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const draw=()=>{if(!rect)return;selection.style.display='block';selection.style.left=rect.x+'px';selection.style.top=rect.y+'px';selection.style.width=rect.width+'px';selection.style.height=rect.height+'px';hud.style.display='flex';hud.style.left=(rect.x+rect.width)+'px';hud.style.top=rect.y+'px';metrics.textContent=Math.round(rect.width)+' × '+Math.round(rect.height)+' · '+Math.round(config.origin.x+rect.x)+', '+Math.round(config.origin.y+rect.y)};
  shade.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY};rect={x:start.x,y:start.y,width:0,height:0};shade.setPointerCapture(e.pointerId);draw()});
  shade.addEventListener('pointermove',e=>{if(!start)return;const x=Math.min(start.x,e.clientX),y=Math.min(start.y,e.clientY);rect={x:clamp(x,0,innerWidth),y:clamp(y,0,innerHeight),width:Math.abs(e.clientX-start.x),height:Math.abs(e.clientY-start.y)};draw()});
  shade.addEventListener('pointerup',e=>{if(!start)return;shade.releasePointerCapture(e.pointerId);start=null;draw()});
  document.getElementById('confirm').addEventListener('click',()=>{if(!rect||rect.width<64||rect.height<64)return;window.knouxRec.region.complete({x:config.origin.x+rect.x,y:config.origin.y+rect.y,width:rect.width,height:rect.height})});
  document.getElementById('cancel').addEventListener('click',()=>window.knouxRec.region.cancel());
  addEventListener('keydown',e=>{if(e.key==='Escape')window.knouxRec.region.cancel()});
  window.knouxRec.region.onConfiguration(value=>{config=value});
  })();</script></body></html>`;
}

function openRegionOverlay({ BrowserWindow, ipcMain, screen, preloadPath }) {
  if (active) return Promise.reject(new Error("A region selection is already active."));
  const displays = screen.getAllDisplays();
  if (!displays.length) return Promise.reject(new Error("No Windows display is available for region selection."));
  const left = Math.min(...displays.map((display) => display.bounds.x));
  const top = Math.min(...displays.map((display) => display.bounds.y));
  const right = Math.max(...displays.map((display) => display.bounds.x + display.bounds.width));
  const bottom = Math.max(...displays.map((display) => display.bounds.y + display.bounds.height));
  const overlay = new BrowserWindow({
    x: left, y: top, width: right - left, height: bottom - top, frame: false, transparent: true,
    alwaysOnTop: true, skipTaskbar: true, resizable: false, movable: false, minimizable: false,
    maximizable: false, fullscreenable: false, backgroundColor: "#00000000",
    webPreferences: { preload: preloadPath, nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true },
  });
  overlay.setAlwaysOnTop(true, "screen-saver");
  overlay.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(createHtml())}`);

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      ipcMain.removeListener("region:confirm", onConfirm);
      ipcMain.removeListener("region:cancel", onCancel);
      overlay.removeAllListeners("closed");
      if (!overlay.isDestroyed()) overlay.close();
      active = null;
    };
    const fail = (error) => { cleanup(); reject(error); };
    const onCancel = (event) => {
      if (event?.sender && event.sender !== overlay.webContents) return;
      fail(new Error("Region selection was cancelled."));
    };
    const onConfirm = (event, rawBounds) => {
      if (event?.sender !== overlay.webContents) return;
      if (!rawBounds || !Number.isFinite(rawBounds.x) || !Number.isFinite(rawBounds.y) || !Number.isFinite(rawBounds.width) || !Number.isFinite(rawBounds.height)) return;
      const dipBounds = { x: Math.round(rawBounds.x), y: Math.round(rawBounds.y), width: Math.round(rawBounds.width), height: Math.round(rawBounds.height) };
      if (dipBounds.width < REGION_MIN_SIZE || dipBounds.height < REGION_MIN_SIZE) return;
      const display = displays.find((candidate) => dipBounds.x >= candidate.bounds.x && dipBounds.y >= candidate.bounds.y && dipBounds.x + dipBounds.width <= candidate.bounds.x + candidate.bounds.width && dipBounds.y + dipBounds.height <= candidate.bounds.y + candidate.bounds.height);
      if (!display) return;
      const physicalBounds = screen.dipToScreenRect(null, dipBounds);
      const displayPhysicalBounds = screen.dipToScreenRect(null, display.bounds);
      cleanup();
      resolve({ displayId: String(display.id), dipBounds, physicalBounds, displayPhysicalBounds, scaleFactor: display.scaleFactor });
    };
    active = { overlay };
    ipcMain.once("region:confirm", onConfirm);
    ipcMain.once("region:cancel", onCancel);
    overlay.once("closed", onCancel);
    overlay.webContents.once("did-finish-load", () => overlay.webContents.send("region:configuration", { origin: { x: left, y: top } }));
  });
}

module.exports = { openRegionOverlay };
