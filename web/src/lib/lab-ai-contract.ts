import { teachingLessons, labMissions, roomObjects, type Placement } from "./lab-content";
import type { PendingCommand, RoomResult, TeachingFeedback } from "./lab-engine";

export type CoachHistory = { role: "nomi" | "student"; text: string }[];
export type CoachRequest =
  | { mode: "teach"; lessonId: string; stepIndex: number; answer: string; history: CoachHistory }
  | { mode: "room"; missionId: string; answer: string; history: CoachHistory; pending: PendingCommand };
export type CoachResponse =
  | { mode: "teach"; source: "ai"; feedback: TeachingFeedback }
  | { mode: "room"; source: "ai"; feedback: RoomResult };
export type CoachAvailability = { available: boolean; provider: "OpenAI" | "Google Gemini" | null };

export function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
const colors = ["red", "blue", "green"];
const nouns = ["chair", "plant", "book"];
export const relations = ["left", "right", "on", "under", "near"] as const;
export const anchors = ["table", "window", "shelf"] as const;
const has = (choices: readonly string[], value: unknown): value is string => typeof value === "string" && choices.includes(value);
const shortText = (value: unknown, max: number): value is string => typeof value === "string" && value.trim().length > 0 && value.length <= max;

function parsePending(value: unknown): PendingCommand | null {
  if (!record(value)) return null;
  for (const [key, options] of [["color", colors], ["noun", nouns], ["relation", relations], ["anchor", anchors]] as const) {
    if (value[key] !== undefined && !has(options, value[key])) return null;
  }
  // Construct a new object: never forward arbitrary client fields to the provider.
  return {
    ...(value.color ? { color: value.color as string } : {}),
    ...(value.noun ? { noun: value.noun as string } : {}),
    ...(value.relation ? { relation: value.relation as Placement["relation"] } : {}),
    ...(value.anchor ? { anchor: value.anchor as Placement["anchor"] } : {}),
  };
}

export function parseCoachRequest(value: unknown): CoachRequest | null {
  if (!record(value) || !shortText(value.answer, 600) || !Array.isArray(value.history) || value.history.length > 6) return null;
  const history: CoachHistory = [];
  for (const message of value.history) {
    if (!record(message) || !has(["nomi", "student"], message.role) || !shortText(message.text, 600)) return null;
    history.push({ role: message.role as "nomi" | "student", text: message.text.trim() });
  }
  if (value.mode === "teach") {
    const lesson = teachingLessons.find((item) => item.id === value.lessonId);
    if (!lesson || !Number.isInteger(value.stepIndex) || Number(value.stepIndex) < 0 || Number(value.stepIndex) >= lesson.steps.length) return null;
    return { mode: "teach", lessonId: lesson.id, stepIndex: Number(value.stepIndex), answer: value.answer.trim(), history };
  }
  if (value.mode === "room") {
    const mission = labMissions.find((item) => item.id === value.missionId);
    const pending = parsePending(value.pending);
    if (!mission || !pending) return null;
    return { mode: "room", missionId: mission.id, answer: value.answer.trim(), history, pending };
  }
  return null;
}

/** Validate model output before any transition. A schema-shaped response is not
 * proof of factual accuracy; evaluation cases still need review with real models. */
export function parseModelFeedback(mode: CoachRequest["mode"], value: unknown): CoachResponse | null {
  if (!record(value) || !shortText(value.reply, 500) || !shortText(value.tip, 400) || typeof value.confidence !== "number" || !Number.isFinite(value.confidence) || value.confidence < 0 || value.confidence > 1) return null;
  if (mode === "teach") {
    if (typeof value.understood !== "boolean" || (value.understood && value.confidence < 0.8)) return null;
    return { mode, source: "ai", feedback: { understood: value.understood, reply: value.reply.trim(), tip: value.tip.trim() } };
  }
  if (!has(["move", "clarify"], value.kind)) return null;
  for (const [key, options] of [["color", colors], ["noun", nouns], ["relation", relations], ["anchor", anchors]] as const) {
    if (value[key] !== "" && !has(options, value[key])) return null;
  }
  const pending = parsePending(Object.fromEntries(["color", "noun", "relation", "anchor"].filter((key) => value[key] !== "").map((key) => [key, value[key]])));
  if (!pending) return null;
  if (value.kind === "clarify") return { mode, source: "ai", feedback: { kind: "clarify", pending, reply: value.reply.trim(), tip: value.tip.trim() } };
  const objects = roomObjects.filter((object) => (!pending.color || object.color === pending.color) && (!pending.noun || object.noun === pending.noun));
  if (objects.length !== 1 || !pending.relation || !pending.anchor || value.confidence < 0.85) return null;
  return { mode, source: "ai", feedback: { kind: "move", pending: {}, placement: { object: objects[0].id, relation: pending.relation, anchor: pending.anchor }, reply: value.reply.trim(), tip: value.tip.trim() } };
}

/** Browser validation also protects against stale/proxy responses. */
export function validCoachResponse(value: unknown, mode: CoachRequest["mode"]): value is CoachResponse {
  if (!record(value) || value.mode !== mode || value.source !== "ai" || !record(value.feedback)) return false;
  const f = value.feedback;
  if (!shortText(f.reply, 500) || !shortText(f.tip, 400)) return false;
  if (mode === "teach") return typeof f.understood === "boolean";
  if (f.kind === "clarify") return parsePending(f.pending) !== null;
  return f.kind === "move" && record(f.placement) && roomObjects.some((o) => o.id === (f.placement as Record<string, unknown>).object) && has(relations, f.placement.relation) && has(anchors, f.placement.anchor);
}
