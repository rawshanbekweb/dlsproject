"use client";

export type LabCompletion = { mode: "teach" | "room" | "sign"; missionId: string; turns: number; timestamp: number };
const KEY = "speakup_lab_progress_v1";

export function loadLabProgress(): LabCompletion[] {
  try {
    const data: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(data)) return [];
    return data.filter((item): item is LabCompletion => item && (item.mode === "teach" || item.mode === "room" || item.mode === "sign") && typeof item.missionId === "string" && Number.isFinite(item.turns) && item.turns > 0 && Number.isFinite(item.timestamp)).slice(0, 100);
  } catch { return []; }
}

/** One best completion per mission; these are task outcomes, not pronunciation scores. */
export function saveLabCompletion(mode: LabCompletion["mode"], missionId: string, turns: number): boolean {
  try {
    const old = loadLabProgress();
    const previous = old.find((item) => item.mode === mode && item.missionId === missionId);
    const entry = { mode, missionId, turns: Math.min(previous?.turns ?? turns, turns), timestamp: Date.now() };
    window.localStorage.setItem(KEY, JSON.stringify([entry, ...old.filter((item) => item !== previous)].slice(0, 100)));
    window.dispatchEvent(new Event("speakup-lab-progress"));
    return true;
  } catch { return false; }
}
