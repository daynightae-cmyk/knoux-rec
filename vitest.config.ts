import { defineConfig } from "vitest/config";

/*
 * Vitest configuration.
 *
 * The desktop UI acceptance suite renders the real shell into jsdom. On Windows the
 * jsdom environment needs well over a minute to boot, which exceeds the forks pool
 * worker start-up window, so the suite is pinned to the threads pool with generous
 * timeouts. Everything else keeps the project defaults.
 */
export default defineConfig({
  test: {
    pool: "threads",
    testTimeout: 30_000,
    hookTimeout: 30_000,
    teardownTimeout: 30_000,
  },
});
