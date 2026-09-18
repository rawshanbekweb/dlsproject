import { test, expect, type Page } from "@playwright/test";
import { teachingLessons, labMissions } from "../src/lib/lab-content";

async function answer(page: Page, text: string) {
  await page.getByLabel("Sening navbating").fill(text);
  await page.getByRole("button", { name: "Yuborish" }).click();
}

test("landing and lab navigation work without a database", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Kichik robotga");
  await page.screenshot({ path: "test-results/landing-desktop.png", fullPage: true });
  await page.getByRole("link", { name: "Nomi bilan boshlash" }).click();
  await expect(page).toHaveURL(/\/student\/lab\/teach$/);
  await expect(page.getByRole("log")).toContainText("ALL birds can fly");
  expect(errors).toEqual([]);
});

test("teaching rejects a misconception, completes all lessons and persists progress", async ({ page }) => {
  await page.goto("/student/lab/teach");
  await page.screenshot({ path: "test-results/teach-desktop.png", fullPage: true });
  await answer(page, "All birds can fly");
  await expect(page.getByRole("log")).toContainText("Could you explain it another way?");
  await expect(page.locator(".lab-conversation-heading")).toContainText("1 / 3");
  for (const lesson of teachingLessons) {
    await page.getByRole("button", { name: lesson.title }).click();
    for (const step of lesson.steps) await answer(page, step.example);
    await expect(page.getByRole("heading", { name: "Bugun Nomi sendan o‘rgandi!" })).toBeVisible();
  }
  await page.reload();
  const entries = await page.evaluate(() => JSON.parse(localStorage.getItem("speakup_lab_progress_v1") ?? "[]"));
  expect(entries).toHaveLength(3);
  await page.goto("/student/lab");
  await expect(page.locator(".lab-progress-numbers").locator("strong").first()).toHaveText("3 / 3");
});

test("room clarifies an object, moves it, completes missions and can reset", async ({ page }) => {
  await page.goto("/student/lab/room");
  await page.screenshot({ path: "test-results/room-desktop.png", fullPage: true });
  await answer(page, "Put the chair to the left of the table");
  await expect(page.getByRole("log")).toContainText("Which chair");
  await answer(page, "The red one");
  await expect(page.getByRole("heading", { name: "Bir-biringizni tushundingiz!" })).toBeVisible();
  await expect(page.locator(".lab-room-scene li").first()).toHaveText("red chair: to the left of the table");
  await page.getByRole("button", { name: "Xonani qayta boshlash" }).click();
  await expect(page.locator(".lab-room-scene li").first()).toContainText("boshlang‘ich joyida");
  await answer(page, "Put the blue chair to the left of the table");
  await expect(page.getByRole("heading", { name: "Bir-biringizni tushundingiz!" })).toHaveCount(0);
  for (let i = 1; i < labMissions.length; i++) {
    await page.getByRole("button", { name: `0${i + 1} · ${labMissions[i].title}` }).click();
    await answer(page, labMissions[i].example);
    await expect(page.getByRole("heading", { name: "Bir-biringizni tushundingiz!" })).toBeVisible();
  }
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("speakup_lab_progress_v1") ?? "[]").length)).toBe(3);
});

test("no microphone or blocked storage still allows completing a lesson", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "SpeechRecognition", { value: undefined, configurable: true });
    Object.defineProperty(window, "webkitSpeechRecognition", { value: undefined, configurable: true });
    Storage.prototype.setItem = () => { throw new DOMException("Blocked", "SecurityError"); };
  });
  await page.goto("/student/lab/teach");
  await expect(page.getByRole("button", { name: "Gapirish" })).toBeDisabled();
  for (const step of teachingLessons[0].steps) await answer(page, step.example);
  await expect(page.getByRole("status")).toContainText("Brauzer natijani saqlay olmadi");
});

test("microphone permission error preserves typing fallback", async ({ page }) => {
  await page.addInitScript(() => {
    class Recognition {
      onerror?: (event: { error: string }) => void;
      start() { setTimeout(() => this.onerror?.({ error: "not-allowed" }), 20); }
      stop() {}
      abort() {}
    }
    Object.defineProperty(window, "SpeechRecognition", { value: Recognition, configurable: true });
  });
  await page.goto("/student/lab/teach");
  await page.getByRole("button", { name: "Gapirish" }).click();
  await expect(page.locator(".lab-answer [role='alert']")).toContainText("Mikrofonga ruxsat berilmadi");
  await answer(page, teachingLessons[0].steps[0].example);
  await expect(page.locator(".lab-conversation-heading")).toContainText("2 / 3");
});

test("voice text can be reviewed after stopping before submission", async ({ page }) => {
  await page.addInitScript(() => {
    class Recognition {
      onresult?: (event: unknown) => void;
      start() {}
      stop() {
        setTimeout(() => this.onresult?.({ resultIndex: 0, results: [{ 0: { transcript: "Not all birds can fly" }, isFinal: true, length: 1 }] }), 50);
      }
      abort() {}
    }
    Object.defineProperty(window, "SpeechRecognition", { value: Recognition, configurable: true });
  });
  await page.goto("/student/lab/teach");
  await page.getByRole("button", { name: "Gapirish" }).click();
  await expect(page.getByRole("button", { name: "Yuborish" })).toBeDisabled();
  await page.getByRole("button", { name: "To‘xtatish" }).click();
  await expect(page.getByLabel("Sening navbating")).toHaveValue("Not all birds can fly");
  await expect(page.getByRole("button", { name: "Yuborish" })).toBeEnabled();
  await page.getByRole("button", { name: "Yuborish" }).click();
  await expect(page.locator(".lab-conversation-heading")).toContainText("2 / 3");
});

test("mobile layouts fit and the room can be completed by keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/", "/student/lab", "/student/lab/teach", "/student/lab/room"]) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/mobile-${path.replaceAll("/", "-") || "home"}.png`, fullPage: true });
  }
  await answer(page, labMissions[0].example);
  await expect(page.getByRole("heading", { name: "Bir-biringizni tushundingiz!" })).toBeVisible();
});
