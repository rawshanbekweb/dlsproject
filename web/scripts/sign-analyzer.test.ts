// Imo-ishora ball hisoblash mantig'i testi.
//
// Ishga tushirish:  npm run test:sign
//
// NEGA BU TEST BOR: hech qanday real yozib olingan namuna hali yo'q (birinchi
// referenslar `/admin/signs` orqali qo'lda yoziladi). Shuning uchun bu yerda
// SINTETIK (qo'lda yaratilgan) qo'l nuqtalari bilan faqat MATEMATIKA to'g'ri
// ishlayotganini tekshiramiz: bir xil imo yuqori ball, boshqa imo past ball,
// kamera masofasi/joylashuvi ball natijasiga ta'sir qilmasligi kerak.

import { hasAnyHand, scoreSignAttempt, type HandFrame, type SignFrame, type SignSequence } from "../src/lib/hand-landmarks";

/** 21 ta nuqtali sintetik qo'l — `shape` parametri barmoqlar "ochiqligini" o'zgartiradi. */
function makeHand(shape: number, cx = 0.5, cy = 0.5, scale = 1): HandFrame {
  const points: HandFrame = [];
  for (let i = 0; i < 21; i++) {
    const angle = (i / 21) * Math.PI * 2;
    const radius = 0.05 + 0.02 * Math.sin(angle * shape);
    points.push({ x: cx + Math.cos(angle) * radius * scale, y: cy + Math.sin(angle) * radius * scale });
  }
  return points;
}

function sequenceOf(shape: number, frames: number, cx = 0.5, cy = 0.5, scale = 1): SignSequence {
  const seq: SignSequence = [];
  for (let i = 0; i < frames; i++) seq.push({ left: null, right: makeHand(shape, cx, cy, scale) });
  return seq;
}

type Case = { name: string; run: () => string | null };

const cases: Case[] = [
  {
    name: "o'ziga solishtirsa ~100 ball",
    run: () => {
      const seq = sequenceOf(3, 15);
      const score = scoreSignAttempt(seq, [seq]);
      return score >= 98 ? null : `kutilgan >=98, kelgani ${score}`;
    },
  },
  {
    name: "kamera markazdan siljigan bo'lsa ham (translatsiya) ball o'zgarmaydi",
    run: () => {
      const ref = sequenceOf(3, 15, 0.5, 0.5);
      const live = sequenceOf(3, 15, 0.7, 0.3); // butunlay boshqa joyda
      const score = scoreSignAttempt(live, [ref]);
      return score >= 98 ? null : `translatsiya ballni pasaytirdi: ${score}`;
    },
  },
  {
    name: "qo'l kameraga yaqinroq/uzoqroq bo'lsa ham (masshtab) ball o'zgarmaydi",
    run: () => {
      const ref = sequenceOf(3, 15, 0.5, 0.5, 1);
      const live = sequenceOf(3, 15, 0.5, 0.5, 2.4); // 2.4x kattaroq — kameraga yaqin
      const score = scoreSignAttempt(live, [ref]);
      return score >= 98 ? null : `masshtab ballni pasaytirdi: ${score}`;
    },
  },
  {
    name: "butunlay boshqa imo past ball beradi",
    run: () => {
      const ref = sequenceOf(3, 15);
      const live = sequenceOf(9, 15); // boshqa "shakl"
      const score = scoreSignAttempt(live, [ref]);
      return score < 60 ? null : `kutilgan <60, kelgani ${score}`;
    },
  },
  {
    name: "sekinroq bajarilgan (ko'proq freym) bir xil imo baribir yuqori ball",
    run: () => {
      const ref = sequenceOf(3, 12);
      const live = sequenceOf(3, 30); // uch baravar sekinroq
      const score = scoreSignAttempt(live, [ref]);
      return score >= 95 ? null : `DTW tezlik farqini yutmadi: ${score}`;
    },
  },
  {
    name: "bir nechta namunadan ENG YAXSHISI olinadi",
    run: () => {
      const good = sequenceOf(3, 15);
      const bad = sequenceOf(9, 15);
      const live = sequenceOf(3, 15);
      const score = scoreSignAttempt(live, [bad, good]);
      return score >= 98 ? null : `eng yaxshi namuna tanlanmadi: ${score}`;
    },
  },
  {
    name: "bo'sh jonli ketma-ketlik 0 ball",
    run: () => (scoreSignAttempt([], [sequenceOf(3, 10)]) === 0 ? null : "0 emas"),
  },
  {
    name: "referens umuman bo'lmasa 0 ball",
    run: () => (scoreSignAttempt(sequenceOf(3, 10), []) === 0 ? null : "0 emas"),
  },
  {
    name: "hasAnyHand: ikkala qo'l ham yo'q bo'lsa false",
    run: () => {
      const empty: SignFrame[] = [{ left: null, right: null }, { left: null, right: null }];
      return hasAnyHand(empty) ? "true qaytardi" : null;
    },
  },
  {
    name: "hasAnyHand: kamida bitta freymda qo'l bo'lsa true",
    run: () => {
      const seq = sequenceOf(3, 5);
      return hasAnyHand(seq) ? null : "false qaytardi";
    },
  },
];

let failed = 0;
for (const c of cases) {
  const problem = c.run();
  if (problem) {
    failed++;
    console.error(`✗ ${c.name}`);
    console.error(`    ${problem}`);
  } else {
    console.log(`✓ ${c.name}`);
  }
}

console.log(`\n${cases.length - failed}/${cases.length} o'tdi`);
if (failed > 0) process.exit(1);
