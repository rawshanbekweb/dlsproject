import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: "list",
  outputDir: "test-results",
  use: {
    baseURL: "http://127.0.0.1:3100",
    browserName: "chromium",
    // Set PLAYWRIGHT_CHANNEL=msedge to use an existing Windows Edge installation.
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    trace: "retain-on-failure",
    // Imo-ishora testlari uchun: haqiqiy kamerasiz `getUserMedia()`ni sinash.
    // Chromium sintetik video (harakatlanuvchi naqsh) beradi — qo'l ko'rinmaydi,
    // lekin butun kamera+MediaPipe quvuri (ruxsat, video oqimi, aniqlash sikli)
    // haqiqiy brauzerda ishlaydi. `--use-fake-ui-for-media-stream` ruxsat
    // so'rovini avtomatik tasdiqlaydi (`grantPermissions` bilan birga xavfsiz).
    permissions: ["camera"],
    launchOptions: {
      args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
    },
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/student/lab",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
