import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const required = ["dist/index.html", "desktop/main.cjs", "desktop/preload.cjs", "package.json"];
const failures = [];

for (const relativePath of required) {
  const absolutePath = resolve(root, relativePath);
  if (!existsSync(absolutePath) || statSync(absolutePath).size === 0) {
    failures.push(`Missing or empty required artifact: ${relativePath}`);
  }
}

const main = readFileSync(resolve(root, "desktop/main.cjs"), "utf8");
for (const setting of ["nodeIntegration: false", "contextIsolation: true", "sandbox: true", "webSecurity: true"]) {
  if (!main.includes(setting)) failures.push(`Missing Electron security setting: ${setting}`);
}
for (const channel of ["recording:start-file", "recording:append-chunk", "recording:finish-file", "capture:list-sources"]) {
  if (!main.includes(channel)) failures.push(`Missing domain IPC handler: ${channel}`);
}

const releaseDirectory = resolve(root, "release");
if (existsSync(releaseDirectory)) {
  const files = readdirSync(releaseDirectory, { recursive: true }).map(String);
  const installers = files.filter((file) => /Setup.*\.exe$/i.test(file));
  if (!installers.length) failures.push("Release directory exists but contains no NSIS installer executable.");
}

if (failures.length) {
  console.error("KNOuX REC release verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("KNOuX REC release verification passed.");
  console.log("Validated secure Electron settings, actual IPC handlers, and required build artifacts.");
}
