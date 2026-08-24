using System;
using System.IO;
using System.Linq;
using System.Threading;
using NAudio.CoreAudioApi;
using NAudio.Wave;

namespace KnouxRecAudioHelper
{
    internal static class Program
    {
        private static int Main(string[] args)
        {
            if (args.Length == 0 || string.Equals(args[0], "list", StringComparison.OrdinalIgnoreCase)) return ListDevices();
            if (string.Equals(args[0], "capture", StringComparison.OrdinalIgnoreCase)) return Capture(args.Skip(1).ToArray());
            EmitError("invalid_command", "Expected list or capture.");
            return 2;
        }

        private static int ListDevices()
        {
            try
            {
                using (var enumerator = new MMDeviceEnumerator())
                {
                    string defaultId = null;
                    try { defaultId = enumerator.GetDefaultAudioEndpoint(DataFlow.Render, Role.Multimedia).ID; } catch { }
                    var devices = enumerator.EnumerateAudioEndPoints(DataFlow.Render, DeviceState.Active)
                        .Select(device => "{\"id\":\"" + Escape(device.ID) + "\",\"name\":\"" + Escape(device.FriendlyName) + "\",\"state\":\"" + Escape(device.State.ToString()) + "\",\"isDefault\":" + (device.ID == defaultId ? "true" : "false") + "}");
                    Console.WriteLine("{\"event\":\"devices\",\"devices\":[" + string.Join(",", devices) + "]}");
                    return 0;
                }
            }
            catch (Exception error)
            {
                EmitError("enumeration_failed", error.Message);
                return 1;
            }
        }

        private static int Capture(string[] args)
        {
            var deviceId = ReadOption(args, "--device");
            var outputPath = ReadOption(args, "--output");
            if (string.IsNullOrWhiteSpace(outputPath))
            {
                EmitError("missing_output", "The --output path is required.");
                return 2;
            }

            try
            {
                var outputDirectory = Path.GetDirectoryName(Path.GetFullPath(outputPath));
                if (!string.IsNullOrWhiteSpace(outputDirectory)) Directory.CreateDirectory(outputDirectory);
                using (var enumerator = new MMDeviceEnumerator())
                using (var device = string.IsNullOrWhiteSpace(deviceId) ? enumerator.GetDefaultAudioEndpoint(DataFlow.Render, Role.Multimedia) : enumerator.GetDevice(deviceId))
                using (var capture = new WasapiLoopbackCapture(device))
                using (var writer = new WaveFileWriter(outputPath, capture.WaveFormat))
                using (var stopped = new ManualResetEvent(false))
                {
                    long recordedBytes = 0;
                    int peakPermille = 0;
                    Exception stoppedError = null;
                    capture.DataAvailable += (sender, data) =>
                    {
                        writer.Write(data.Buffer, 0, data.BytesRecorded);
                        Interlocked.Add(ref recordedBytes, data.BytesRecorded);
                        var peak = FloatPeakPermille(data.Buffer, data.BytesRecorded);
                        if (peak > peakPermille) Interlocked.Exchange(ref peakPermille, peak);
                    };
                    capture.RecordingStopped += (sender, eventArgs) => { stoppedError = eventArgs.Exception; stopped.Set(); };
                    Console.WriteLine("{\"event\":\"ready\",\"deviceId\":\"" + Escape(device.ID) + "\",\"deviceName\":\"" + Escape(device.FriendlyName) + "\",\"sampleRate\":" + capture.WaveFormat.SampleRate + ",\"channels\":" + capture.WaveFormat.Channels + ",\"bitsPerSample\":" + capture.WaveFormat.BitsPerSample + "}");
                    capture.StartRecording();
                    string line;
                    while ((line = Console.ReadLine()) != null && !string.Equals(line.Trim(), "stop", StringComparison.OrdinalIgnoreCase)) { }
                    capture.StopRecording();
                    if (!stopped.WaitOne(TimeSpan.FromSeconds(5))) { EmitError("stop_timeout", "WASAPI did not stop in five seconds."); return 1; }
                    if (stoppedError != null) { EmitError("capture_stopped_with_error", stoppedError.Message); return 1; }
                    writer.Flush();
                    var fileBytes = File.Exists(outputPath) ? new FileInfo(outputPath).Length : 0;
                    Console.WriteLine("{\"event\":\"stopped\",\"bytesRecorded\":" + recordedBytes + ",\"fileBytes\":" + fileBytes + ",\"peakPermille\":" + peakPermille + "}");
                    return fileBytes > 44 ? 0 : 3;
                }
            }
            catch (Exception error)
            {
                EmitError("capture_failed", error.Message);
                return 1;
            }
        }

        private static string ReadOption(string[] args, string name)
        {
            for (var index = 0; index < args.Length - 1; index++) if (string.Equals(args[index], name, StringComparison.OrdinalIgnoreCase)) return args[index + 1];
            return null;
        }

        private static int FloatPeakPermille(byte[] buffer, int count)
        {
            var peak = 0f;
            for (var offset = 0; offset + 4 <= count; offset += 4)
            {
                var value = Math.Abs(BitConverter.ToSingle(buffer, offset));
                if (!float.IsNaN(value) && !float.IsInfinity(value) && value > peak) peak = value;
            }
            return Math.Min(1000, (int)Math.Round(peak * 1000));
        }

        private static void EmitError(string code, string message)
        {
            Console.WriteLine("{\"event\":\"error\",\"code\":\"" + Escape(code) + "\",\"message\":\"" + Escape(message) + "\"}");
        }

        private static string Escape(string value)
        {
            return (value ?? string.Empty).Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\r", "\\r").Replace("\n", "\\n");
        }
    }
}
