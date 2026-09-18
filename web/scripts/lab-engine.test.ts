import assert from "node:assert/strict";
import { evaluateTeaching, interpretRoom, matchesTarget } from "../src/lib/lab-engine";
import { labMissions, teachingLessons } from "../src/lib/lab-content";

let checks = 0;
function check(name: string, fn: () => void) { fn(); checks++; console.log(`✓ ${name}`); }
for (const lesson of teachingLessons) {
  for (const step of lesson.steps) {
    check(`${step.rule}: lesson example advances`, () => assert.equal(evaluateTeaching(step, step.example).understood, true));
    for (const text of ["", "yes", "I like pizza", "asdf penguin mammal plant"]) {
      check(`${step.rule}: does not advance for ${JSON.stringify(text)}`, () => assert.equal(evaluateTeaching(step, text).understood, false));
    }
  }
}
const birds = teachingLessons[0];
for (const answer of ["All birds can fly", "All birds cannot fly", "A penguin can fly and a fish cannot fly", "It is not true that penguins cannot fly"]) {
  check(`birds: rejects misconception ${answer}`, () => assert.equal(evaluateTeaching(birds.steps[0], answer).understood, false));
}
check("ASR punctuation and curly contractions", () => assert.equal(evaluateTeaching(birds.steps[1], "Penguins CAN’T fly!").understood, true));
check("wrong animal example cannot advance transfer", () => assert.equal(evaluateTeaching(birds.steps[2], "Penguins cannot fly").understood, false));
check("negated whale evidence", () => assert.equal(evaluateTeaching(teachingLessons[1].steps[1], "Whales do not breathe air").understood, false));
check("unrelated evidence is not whale evidence", () => assert.equal(evaluateTeaching(teachingLessons[1].steps[1], "Humans breathe air").understood, false));
check("negated plant evidence", () => assert.equal(evaluateTeaching(teachingLessons[2].steps[1], "Plants do not grow").understood, false));
check("wrong classification", () => assert.equal(evaluateTeaching(teachingLessons[1].steps[0], "A whale is a fish, not a mammal").understood, false));
for (const mission of labMissions) {
  check(`room mission ${mission.id} is solvable`, () => { const result = interpretRoom(mission.example); assert.equal(result.kind, "move"); if (result.kind === "move") assert.equal(matchesTarget(result.placement, mission.target), true); });
}
check("ambiguous chair asks its color before moving", () => {
  const initial = interpretRoom("Put the chair to the left of the table");
  assert.equal(initial.kind, "clarify");
  assert.match(initial.reply, /Which chair/);
  const answer = interpretRoom("The red one", initial.pending);
  assert.equal(answer.kind, "move");
  if (answer.kind === "move") assert.deepEqual(answer.placement, labMissions[0].target);
});
check("object, relation and anchor can be clarified across turns", () => {
  let result = interpretRoom("Move the green plant"); assert.equal(result.kind, "clarify");
  result = interpretRoom("On", result.pending); assert.equal(result.kind, "clarify");
  result = interpretRoom("The shelf", result.pending); assert.equal(result.kind, "move");
  if (result.kind === "move") assert.deepEqual(result.placement, labMissions[1].target);
});
for (const answer of ["", "hello", "Do not put the red chair on the table", "Put the yellow chair near the table", "Put the red chair behind the table", "Put the red chair and the book on the table", "Put the red chair on or under the table", "Move the red plant on the shelf"]) {
  check(`room does not move for ${JSON.stringify(answer)}`, () => assert.equal(interpretRoom(answer).kind, "clarify"));
}
check("supports on the left side of", () => {
  const result = interpretRoom("Put the red chair on the left side of the table");
  assert.equal(result.kind, "move");
  if (result.kind === "move") assert.deepEqual(result.placement, labMissions[0].target);
});
check("wrong but clear placement does not complete mission", () => {
  const result = interpretRoom("Put the blue chair to the left of the table");
  assert.equal(result.kind, "move");
  if (result.kind === "move") assert.equal(matchesTarget(result.placement, labMissions[0].target), false);
});
check("unrelated follow-up cannot silently reuse pending command", () => {
  const first = interpretRoom("Put the chair on the table");
  assert.equal(interpretRoom("a dinosaur", first.pending).kind, "clarify");
});
console.log(`\n${checks} laboratory checks passed.`);
