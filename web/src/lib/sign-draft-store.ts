"use client";

// `/admin/signs`da yozib olingan, hali `sign-content.ts`ga export QILINMAGAN
// referenslar — shu brauzerda sinash uchun. Production'da har bir talaba
// brauzeri bo'sh boshlanadi, ya'ni bu faqat mahalliy sinov vositasi.
//
// `lab-progress.ts` bilan bir xil naqsh: localStorage, hech qayerga
// yuborilmaydi.

import type { SignReference } from "./sign-content";

const KEY = "speakup_sign_drafts_v1";

export function loadDraftReferences(): SignReference[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? (raw as SignReference[]) : [];
  } catch {
    return [];
  }
}

export function saveDraftReference(ref: SignReference): void {
  if (typeof window === "undefined") return;
  try {
    const all = loadDraftReferences().filter((r) => r.wordId !== ref.wordId || r.recordedAt !== ref.recordedAt);
    all.push(ref);
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Xotira to'lgan bo'lsa ham yozib olish oqimi buzilmasin.
  }
}

export function removeDraftReference(wordId: string, recordedAt: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = loadDraftReferences().filter((r) => !(r.wordId === wordId && r.recordedAt === recordedAt));
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // e'tiborsiz qoldiriladi
  }
}

export function clearDraftReferences(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // e'tiborsiz qoldiriladi
  }
}
