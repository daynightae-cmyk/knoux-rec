const { app, desktopCapturer } = require("electron");

app.whenReady().then(async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ["screen", "window"],
      thumbnailSize: { width: 320, height: 180 },
      fetchWindowIcons: true,
    });
    const screens = sources.filter((source) => source.id.startsWith("screen:")).length;
    const windows = sources.filter((source) => source.id.startsWith("window:")).length;
    const invalidThumbnails = sources.filter((source) => source.thumbnail.isEmpty()).length;
    console.log(JSON.stringify({
      sourceCount: sources.length,
      screenCount: screens,
      windowCount: windows,
      emptyThumbnailCount: invalidThumbnails,
    }));
    if (screens < 1) process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    app.quit();
  }
});
