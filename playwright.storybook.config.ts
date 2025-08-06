import { defineConfig } from "@playwright/test";
import baseConfig from "./playwright.config";

export default defineConfig({
  ...baseConfig,
  testDir: "./tests/e2e/storybook",
  use: {
    baseURL: "http://localhost:6006",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run storybook",
    port: 6006,
    reuseExistingServer: true,
  },
});
