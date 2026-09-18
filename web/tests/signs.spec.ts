import { test, expect } from "@playwright/test";

// Haqiqiy kamera va qo'l yo'q — Chromium'ning sintetik video qurilmasi
// ishlatiladi (playwright.config.ts). Bu haqiqiy qo'l harakatini SINAMAYDI
// (bu faqat `scripts/sign-analyzer.test.ts`dagi sintetik nuqtalar bilan
// tekshiriladi), lekin butun amaliy quvurni — kamera ruxsati, video oqimi,
// MediaPipe modelini CDN'dan yuklash, aniqlash sikli, UI holatlari — haqiqiy
// brauzerda ishga tushiradi. Qo'l ko'rinmagani uchun natija doim past/0
// bo'ladi; shu KUTILGAN va tekshiriladigan holat.

const DRAFT_KEY = "speakup_sign_drafts_v1";

/** `sign-draft-store.ts` bilan bir xil shakldagi qoralama — kamerasiz sinov uchun. */
function fakeReference(wordId: string) {
  const frames = Array.from({ length: 10 }, (_, i) => ({
    left: null,
    right: Array.from({ length: 21 }, (_, j) => ({ x: 0.5 + Math.sin(i + j) * 0.05, y: 0.5 + Math.cos(i + j) * 0.05 })),
  }));
  return { wordId, landmarks: frames, recordedAt: new Date().toISOString() };
}

test("signs page: no reference yet, practice disabled, no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/student/lab/signs");
  await expect(page.getByRole("heading", { name: "Imo-ishora mashqi" })).toBeVisible();

  // 20 ta so'z yorlig'i ko'rinishi kerak.
  await expect(page.locator(".lab-topic-tabs button")).toHaveCount(20);

  // Birinchi so'z uchun hali namuna yo'q — ogohlantirish ko'rinadi.
  await expect(page.getByText("Bu so'z uchun hali namuna yo'q")).toBeVisible();

  expect(errors).toEqual([]);
});

test("draft reference saved by admin becomes usable on the student page", async ({ page }) => {
  // Admin'ning "Export"dan oldingi qoralama oqimini taqlid qilamiz: xuddi
  // shu localStorage kaliti/shakli bilan to'g'ridan-to'g'ri yozamiz.
  await page.goto("/student/lab/signs");
  await page.evaluate(
    ({ key, ref }) => window.localStorage.setItem(key, JSON.stringify([ref])),
    { key: DRAFT_KEY, ref: fakeReference("hello") },
  );
  await page.reload();

  // "Hello" birinchi so'z (signWords[0]) — endi ogohlantirish yo'q va tugma yoqilgan.
  await expect(page.getByText("Bu so'z uchun hali namuna yo'q")).toHaveCount(0);
});

test("full camera pipeline: permission, MediaPipe load, capture, scored result", async ({ page }) => {
  test.setTimeout(90_000); // MediaPipe modeli birinchi safar CDN'dan yuklanadi.
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/student/lab/signs");
  await page.evaluate(
    ({ key, ref }) => window.localStorage.setItem(key, JSON.stringify([ref])),
    { key: DRAFT_KEY, ref: fakeReference("hello") },
  );
  await page.reload();

  await page.getByRole("button", { name: "Kamerani yoqish" }).click();
  // Model yuklanguncha video oqimi va "Boshlash" tugmasi kutiladi.
  await expect(page.getByRole("button", { name: "Boshlash" })).toBeVisible({ timeout: 60_000 });

  // Sintetik kamera qo'lsiz — status shuni aks ettirishi kerak.
  await expect(page.getByText("Qo'l ko'rinmayapti")).toBeVisible();

  await page.getByRole("button", { name: "Boshlash" }).click();
  // Countdown (~0.7s) + yozib olish (2.5s) + ballash — natija ko'rinishini kutamiz.
  await expect(page.getByText(/\d+ ball/)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Yaqin edi")).toBeVisible(); // qo'l ko'rinmagani uchun past ball

  expect(errors).toEqual([]);
});

test("mobile viewport: signs page fits without horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/student/lab/signs");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/mobile-signs.png", fullPage: true });
});
