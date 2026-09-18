// Imo-ishora mashqi uchun qo'l skeleti solishtirish mantig'i.
//
// Bu yerda kamera, MediaPipe, React — HECH NARSA yo'q. Faqat sonlar bilan
// ishlaydigan, test qilinadigan funksiyalar (xuddi speech-analyzer.ts kabi).
// UI/kamera qatlami `use-hand-tracking.ts` va `SignPractice.tsx`da.
//
// NEGA VIDEO EMAS: xotira/maxfiylik uchun — bitta imo ~3 soniya x 15 kadr =
// ~45 ta nuqta to'plami, har biri 21 nuqta x (x,y) = 42 son. Bu bir necha KB,
// video esa MB'larcha bo'lardi va hech qachon saqlanishi shart emas (faqat
// bu sonlar ball chiqarish uchun kerak).
//
// NEGA Z (chuqurlik) YO'Q: bitta oddiy kamerada MediaPipe'ning z bahosi
// taxminiy va shovqinli (stereo emas). x/y (ekrandagi joylashuv) yetarlicha
// aniq va barqaror — shuning uchun V1'da faqat ular ishlatiladi.

/** MediaPipe HandLandmarker'ning bitta qo'l uchun 21 nuqtasi — faqat x,y (0..1, kadr ichida normallashgan). */
export type HandFrame = { x: number; y: number }[];

/** Bitta pайтdagi holat — 0, 1 yoki 2 qo'l ko'rinishi mumkin. Yo'q qo'l — `null`. */
export type SignFrame = { left: HandFrame | null; right: HandFrame | null };

export type SignSequence = SignFrame[];

const POINTS_PER_HAND = 21;
/** Bilak (0) va o'rta barmoq asosi (9) — masshtabni shu ikkisi orasidagi masofa bilan normallashtiramiz. */
const WRIST = 0;
const MIDDLE_MCP = 9;

/**
 * Bitta qo'lni kameraga masofa va joylashuvdan mustaqil qiladi: bilakni
 * markazga ko'chiradi, keyin bilak→o'rta-barmoq-asosi masofasiga bo'lib
 * masshtablaydi. Natija: qo'l qayerda va qanchalik yaqin turishidan
 * qat'i nazar, bir xil "shakl" bir xil sonlarga aylanadi.
 */
function normalizeHand(hand: HandFrame): number[] {
  if (hand.length !== POINTS_PER_HAND) return new Array(POINTS_PER_HAND * 2).fill(0);
  const wrist = hand[WRIST];
  const mid = hand[MIDDLE_MCP];
  const scale = Math.hypot(mid.x - wrist.x, mid.y - wrist.y) || 1;
  const out: number[] = [];
  for (const p of hand) {
    out.push((p.x - wrist.x) / scale, (p.y - wrist.y) / scale);
  }
  return out;
}

/** Bitta freym → sonlar vektori: [chap 42 ta, chap-bor-yo'qligi, o'ng 42 ta, o'ng-bor-yo'qligi]. */
function frameVector(frame: SignFrame): number[] {
  const left = frame.left ? normalizeHand(frame.left) : new Array(POINTS_PER_HAND * 2).fill(0);
  const right = frame.right ? normalizeHand(frame.right) : new Array(POINTS_PER_HAND * 2).fill(0);
  return [...left, frame.left ? 1 : 0, ...right, frame.right ? 1 : 0];
}

function frameDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/**
 * Dynamic Time Warping — ikki ketma-ketlik turli tezlikda bajarilgan bo'lsa
 * ham (bola sekinroq yoki tezroq imo qilsa ham) eng yaxshi moslashtirib
 * taqqoslaydi. Natija: yo'l bo'yicha o'rtacha masofa (kichikroq — yaqinroq).
 *
 * `read-aloud.ts`dagi so'z-darajasidagi tekislash (`align()`) bilan bir xil
 * g'oya — jonli kirishni ma'lum "to'g'ri" namunaga solishtirish — faqat bu
 * yerda so'z emas, raqamli freym ketma-ketligi solishtiriladi.
 */
function dtwAverageDistance(a: number[][], b: number[][]): number {
  const n = a.length;
  const m = b.length;
  if (n === 0 || m === 0) return Infinity;

  const dist: number[][] = Array.from({ length: n }, () => new Array(m).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      dist[i][j] = frameDistance(a[i], b[j]);
    }
  }

  const cost: number[][] = Array.from({ length: n }, () => new Array(m).fill(Infinity));
  const steps: number[][] = Array.from({ length: n }, () => new Array(m).fill(1));
  cost[0][0] = dist[0][0];
  for (let i = 1; i < n; i++) cost[i][0] = cost[i - 1][0] + dist[i][0], (steps[i][0] = i + 1);
  for (let j = 1; j < m; j++) cost[0][j] = cost[0][j - 1] + dist[0][j], (steps[0][j] = j + 1);

  for (let i = 1; i < n; i++) {
    for (let j = 1; j < m; j++) {
      const options: [number, number][] = [
        [cost[i - 1][j], steps[i - 1][j]],
        [cost[i][j - 1], steps[i][j - 1]],
        [cost[i - 1][j - 1], steps[i - 1][j - 1]],
      ];
      options.sort((x, y) => x[0] - y[0]);
      const [bestCost, bestSteps] = options[0];
      cost[i][j] = bestCost + dist[i][j];
      steps[i][j] = bestSteps + 1;
    }
  }

  return cost[n - 1][m - 1] / steps[n - 1][m - 1];
}

/**
 * Konstanta: normallashgan masofa → ball. Hozircha HAQIQIY yozib olingan
 * namunalar bilan sinalmagan — birinchi haqiqiy referenslar qo'shilgach
 * (`/admin/signs` orqali) bu qiymat sozlanishi kerak bo'lishi mumkin.
 * (Xuddi shu tan olingan cheklov Kontekst hujjatida ham yozilgan.)
 */
const DISTANCE_TO_SCORE_K = 220;

/**
 * O'quvchining jonli ketma-ketligini bitta yoki bir nechta namunaga
 * solishtiradi (bir nechta bo'lsa — ENG YAXSHISI olinadi, chunki turli
 * namunalar bir oz farq qilishi tabiiy). 0-100 ball qaytaradi.
 */
export function scoreSignAttempt(live: SignSequence, references: SignSequence[]): number {
  if (live.length === 0 || references.length === 0) return 0;
  const liveVectors = live.map(frameVector);

  let best = Infinity;
  for (const ref of references) {
    if (ref.length === 0) continue;
    const refVectors = ref.map(frameVector);
    const avgDist = dtwAverageDistance(liveVectors, refVectors);
    if (avgDist < best) best = avgDist;
  }
  if (!Number.isFinite(best)) return 0;

  const score = Math.round(100 - best * DISTANCE_TO_SCORE_K);
  return Math.max(0, Math.min(100, score));
}

/** Ketma-ketlikda hech bo'lmasa bitta qo'l ko'ringanmi — bo'sh/mikrofonsiz urinishni ushlash uchun. */
export function hasAnyHand(seq: SignSequence): boolean {
  return seq.some((f) => f.left || f.right);
}
