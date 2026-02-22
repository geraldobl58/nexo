import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    projects: [
      // ─── Testes unitários de componentes (jsdom + React Testing Library) ────
      {
        plugins: [react()],
        resolve: {
          alias: { "@": path.join(dirname, "src") },
        },
        test: {
          name: "unit",
          environment: "jsdom",
          globals: true,
          setupFiles: ["vitest.setup.ts"],
          include: ["src/**/*.{test,spec}.{ts,tsx}"],
        },
      },

      // ─── Testes de stories no browser (Storybook + Playwright) ──────────────
      // https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
      {
        plugins: [
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
