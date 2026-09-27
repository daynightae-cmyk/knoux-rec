import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // The packaged renderer is loaded with mainWindow.loadFile(), which uses the file://
  // protocol. Root-absolute asset URLs would resolve to the filesystem root under
  // file:// and the window would render blank, so the build must emit relative paths.
  base: "./",
});
