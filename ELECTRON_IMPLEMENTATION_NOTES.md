# Electron Implementation Notes

KNOuX REC uses Electron's `desktopCapturer.getSources()` in the main process to enumerate actual screen and window capture sources. Source enumeration requests screen and window types, real thumbnails, and window icons; thumbnails can be omitted only where the UI does not need them.

The renderer is isolated from Node.js and Electron internals. The desktop window uses `nodeIntegration: false`, `contextIsolation: true`, `enableRemoteModule: false`, and `webSecurity: true`. Its preload file exposes only named, domain-level methods with validated inputs, rather than exposing raw IPC or arbitrary command execution.

> The capture picker is required to show actual enumerated sources and thumbnails. It must not claim native capabilities that are unavailable at runtime.

## References

[1]: https://www.electronjs.org/docs/latest/api/desktop-capturer "Electron desktopCapturer"
[2]: https://www.electronjs.org/docs/latest/tutorial/context-isolation "Electron Context Isolation"

[1] [2]
