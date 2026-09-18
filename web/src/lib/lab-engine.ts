import { roomObjects, type Anchor, type ObjectId, type Placement, type Relation, type TeachingStep } from "./lab-content";

export function normalizeAnswer(text: string): string {
  return text.toLowerCase().replace(/[’‘]/g, "'")
    .replace(/\bcan't\b/g, "cannot").replace(/\bdon't\b/g, "do not")
    .replace(/\bdoesn't\b/g, "does not").replace(/\bisn't\b/g, "is not")
    .replace(/\baren't\b/g, "are not").replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
}

export type TeachingFeedback = { understood: boolean; reply: string; tip: string };

/** Conservative, lesson-specific patterns. Unknown wording asks for clarification;
 * it is never reported as a scientific/grammar verdict or sent to an LLM. */
export function evaluateTeaching(step: TeachingStep, answer: string): TeachingFeedback {
  const text = normalizeAnswer(answer);
  const flightless = /\b(cannot|can not|do not|does not|never) fly\b/.test(text);
  const nonFlyingExample = /\b(penguins?|ostrich(?:es)?|kiwis?|emus?)\b/.test(text) && flightless;
  const air = /\bbreath(?:e|es|ing) air\b/.test(text);
  const milk = /\b(feed|feeds|drink|drinks|give|gives)\b.{0,45}\bmilk\b/.test(text);
  const plantReason = /\b(grow|grows|growing)\b/.test(text) || /\bneed(?:s)? (?:\w+ ){0,2}water\b/.test(text);
  const negativeReason = /\b(not|never|cannot)\b.{0,25}\b(breathe|grow|need|feed|drink)\b/.test(text);
  let understood = false;
  switch (step.rule) {
    case "birds-correction":
      understood = /\bnot (?:all|every) birds? (?:can )?fly\b/.test(text) ||
        /\b(?:some|many) birds? (?:cannot|can not|do not|never) fly\b/.test(text) || nonFlyingExample;
      if (/\b(?:all|every) birds? can fly\b/.test(text) && !/\bnot (?:all|every)\b/.test(text)) understood = false;
      break;
    case "birds-example": understood = nonFlyingExample; break;
    case "ostrich": understood = /\bostrich(?:es)?\b/.test(text) && flightless; break;
    case "whale-correction":
      understood = /\bwhales?\b/.test(text) && (/\b(?:is|are) (?:a )?mammals?\b/.test(text) || /\b(?:is|are) not (?:a )?fish\b/.test(text));
      if (/\b(?:is|are) (?:a )?fish\b|\bnot (?:a )?mammals?\b/.test(text)) understood = false;
      break;
    case "whale-reason": understood = /\b(whales?|they|it)\b/.test(text) && (air || milk) && !negativeReason; break;
    case "dolphin": understood = /\bdolphins? (?:is|are) (?:a )?mammals?\b/.test(text) && !/\bnot\b/.test(text); break;
    case "plants-correction": understood = /\b(?:trees?|plants?) (?:is|are) (?:alive|living(?: things?)?)\b/.test(text); break;
    case "plants-reason": understood = /\b(plants?|trees?|they|it)\b/.test(text) && plantReason && !negativeReason; break;
    case "cactus": understood = /\bcactus is (?:a living thing|alive|living)\b/.test(text) && plantReason && !negativeReason; break;
  }
  // Do not accept a negated counterexample such as "It is not true that penguins cannot fly".
  if (/\bnot true\b|\bwrong that\b/.test(text)) understood = false;
  if (step.rule.startsWith("birds") || step.rule === "ostrich") {
    if (/\b(penguins?|ostrich(?:es)?|kiwis?|emus?) (?:\w+ ){0,2}can fly\b/.test(text) || /\b(?:all|every|no) birds? (?:cannot|can not|do not|never|can) fly\b/.test(text) && !/\bnot (?:all|every)\b/.test(text)) understood = false;
  }
  return understood
    ? { understood: true, reply: `Now I understand! ${step.learned}`, tip: "Tushuntirishing yetib bordi. Nomi yangi narsani o‘rgandi!" }
    : { understood: false, reply: text ? "I am not sure I understood. Could you explain it another way?" : "I am listening. What would you teach me?", tip: step.hint };
}

export type PendingCommand = { color?: string; noun?: string; relation?: Relation; anchor?: Anchor };
export type RoomResult =
  | { kind: "clarify"; pending: PendingCommand; reply: string; tip: string }
  | { kind: "move"; placement: Placement; pending: PendingCommand; reply: string; tip: string };

export function interpretRoom(answer: string, previous: PendingCommand = {}): RoomResult {
  const text = normalizeAnswer(answer);
  const clarify = (reply: string, tip: string, pending = previous): RoomResult => ({ kind: "clarify", pending, reply, tip });
  if (!text) return clarify("What would you like me to move?", "Bitta buyum, rang va uning yangi joyini ayt.");
  if (/\b(not|never|cannot|can not|dont)\b/.test(text)) return clarify("Please tell me where you DO want it.", "Masalan: Put the red chair next to the table.", {});
  if (/\b(and|then|or)\b/.test(text)) return clarify("One instruction at a time, please!", "Hozircha bitta buyumni bitta joyga ko‘chirishni ayt.", {});
  const colors = [...new Set(text.match(/\b(red|blue|green)\b/g) ?? [])];
  const nouns = [...new Set(text.match(/\b(chair|plant|book)\b/g) ?? [])];
  const anchors = [...new Set(text.match(/\b(table|window|shelf)\b/g) ?? [])] as Anchor[];
  const relations: Relation[] = [];
  if (/\b(?:to the )?left (?:side )?of\b/.test(text)) relations.push("left");
  if (/\b(?:to the )?right (?:side )?of\b/.test(text)) relations.push("right");
  if (!relations.length && /\b(on|on top of)\b/.test(text)) relations.push("on");
  if (/\b(under|below|beneath)\b/.test(text)) relations.push("under");
  if (/\b(next to|beside|near)\b/.test(text)) relations.push("near");
  if (colors.length > 1 || nouns.length > 1 || anchors.length > 1 || relations.length > 1)
    return clarify("I found more than one choice. Which one do you mean?", "Bitta rang, buyum va joyni tanla.", {});
  // Never reuse a previous instruction when the new input contains no known detail.
  if (!colors.length && !nouns.length && !anchors.length && !relations.length)
    return clarify("I could not find that object or place in our room.", "Xonadagi so‘zlardan foydalan: chair, plant, book, table, window, shelf.");
  if (/\b(yellow|purple|orange|black|white|pink|behind|between|above|inside|bed|door|sofa)\b/.test(text))
    return clarify("I do not have that choice in this room yet.", "Xona lug‘atidagi buyum va joylashuvlardan foydalan.", {});
  const changesObject = !!nouns[0] && nouns[0] !== previous.noun;
  const pending: PendingCommand = {
    ...previous,
    ...(changesObject ? { color: undefined } : {}),
    ...(colors[0] ? { color: colors[0] } : {}),
    ...(nouns[0] ? { noun: nouns[0] } : {}),
    ...(relations[0] ? { relation: relations[0] } : {}),
    ...(anchors[0] ? { anchor: anchors[0] } : {}),
  };
  const options = roomObjects.filter((object) => (!pending.color || object.color === pending.color) && (!pending.noun || object.noun === pending.noun));
  if (!options.length) return clarify("I cannot find that object here.", "Masalan, red chair, blue chair, green plant yoki red book ni tanla.", {});
  if (options.length > 1) return clarify(pending.noun === "chair" ? "Which chair: the red chair or the blue chair?" : "Which object do you mean?", "Rangini yoki buyum nomini aniqlashtir. Masalan: The red chair.", pending);
  if (!pending.relation || !pending.anchor) return clarify("Where should I put it?", "Joyini ayt: on the table, under the table, next to the window…", pending);
  const placement: Placement = { object: options[0].id as ObjectId, relation: pending.relation, anchor: pending.anchor };
  return { kind: "move", placement, pending: {}, reply: "Got it! Look at the room. Is that where you wanted it?", tip: "Nomi ko‘rsatmangni bajardi. Joylashuvni tekshir." };
}

export function matchesTarget(actual: Placement, target: Placement): boolean {
  return actual.object === target.object && actual.relation === target.relation && actual.anchor === target.anchor;
}
