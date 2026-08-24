import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "release/**",
      "node_modules/**",
      ".knoux-local/**",
      "desktop/main.cjs",
      "desktop/preload.cjs",
      "desktop/native-audio.cjs",
      "desktop/media-backend.cjs",
      "desktop/region-overlay.cjs",
      "scripts/desktop-capture-smoke.cjs",
      "scripts/ffmpeg-runtime-smoke.cjs",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: ["**/*.{cjs,mjs}", "scripts/**/*.js"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["services/screenshotService.ts"],
    rules: { "no-control-regex": "off" },
  },
  {
    files: ["tests/**/*.ts"],
    rules: { "@typescript-eslint/no-non-null-assertion": "off" },
  },
);
