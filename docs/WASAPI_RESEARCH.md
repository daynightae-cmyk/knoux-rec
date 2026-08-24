# WASAPI Research Notes

Microsoft documents that WASAPI loopback captures the stream being played by a **rendering endpoint**. A native client acquires an `IMMDevice` for that endpoint, initializes a shared-mode capture stream with `AUDCLNT_STREAMFLAGS_LOOPBACK`, and reads data using `IAudioCaptureClient`.[1]

> Loopback mode is shared-mode only. It cannot be treated as exclusive-mode capture, and event-driven behavior differs on Windows versions earlier than 10 version 1703.[1]

Device selection must use the MMDevice API rather than a decorative UI list. Microsoft describes creating an `IMMDeviceEnumerator`, calling `EnumAudioEndpoints` to enumerate render and/or capture endpoints, checking their properties, and activating suitable interfaces through `IMMDevice::Activate`.[2]

## Engineering implication

The existing Electron/Chromium source-audio path is not WASAPI loopback. Phase two needs a Windows-native helper or native module to enumerate rendering endpoints and capture loopback PCM. It must expose actual device identity, state, sample format, level, and capture failure information over the existing restricted IPC bridge. Until an encoded audio path is integrated with the recording muxer and verified by a real media file, the application must not claim native system-audio support.

## References

[1]: https://learn.microsoft.com/en-us/windows/win32/coreaudio/loopback-recording "Microsoft Learn: Loopback Recording"
[2]: https://learn.microsoft.com/en-us/windows/win32/coreaudio/enumerating-audio-devices "Microsoft Learn: Enumerating Audio Devices"
