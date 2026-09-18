"use client";

// Imo-ishora namunalarini yozib olish vositasi.
//
// Bu DB-ga yozmaydi — Lab bo'limi butunlay statik kontent (`sign-content.ts`,
// `lab-content.ts` bilan bir xil naqsh). Shu yerda yozib olingan namunalar
// avval shu BRAUZERNING localStorage'iga tushadi (`sign-draft-store.ts`) —
// shu zahoti `/student/lab/signs`da sinab ko'rish uchun. Mamnun bo'lgach,
// "Export" tugmasi `sign-content.ts`ga joylash uchun tayyor kodni beradi.

import { useMemo, useState } from "react";
import { useHandTracking } from "@/lib/use-hand-tracking";
import { hasAnyHand, type SignSequence } from "@/lib/hand-landmarks";
import { signWords } from "@/lib/sign-content";
import {
  loadDraftReferences,
  removeDraftReference,
  saveDraftReference,
} from "@/lib/sign-draft-store";

const CAPTURE_MS = 2500;

export default function AdminSignsPage() {
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState<"idle" | "countdown" | "recording">("idle");
  const [drafts, setDrafts] = useState(() => loadDraftReferences());
  const [msg, setMsg] = useState("");
  const hand = useHandTracking();

  const word = signWords[wordIndex];
  const wordDrafts = useMemo(() => drafts.filter((d) => d.wordId === word.id), [drafts, word.id]);

  function refreshDrafts() {
    setDrafts(loadDraftReferences());
  }

  async function record() {
    setMsg("");
    if (!hand.active) await hand.startCamera();
    setPhase("countdown");
    window.setTimeout(() => {
      setPhase("recording");
      hand.startCapture();
      window.setTimeout(() => {
        const seq = hand.stopCapture();
        setPhase("idle");
        onCaptured(seq);
      }, CAPTURE_MS);
    }, 700);
  }

  function onCaptured(seq: SignSequence) {
    if (!hasAnyHand(seq)) {
      setMsg("Hech qanday qo'l ko'rinmadi — qayta urinib ko'ring.");
      return;
    }
    saveDraftReference({ wordId: word.id, landmarks: seq, recordedAt: new Date().toISOString() });
    refreshDrafts();
    setMsg(`Saqlandi (${seq.length} freym). Endi "/student/lab/signs"da sinab ko'rishingiz mumkin.`);
  }

  function removeDraft(recordedAt: string) {
    removeDraftReference(word.id, recordedAt);
    refreshDrafts();
  }

  const exportCode = useMemo(() => buildExportSnippet(drafts), [drafts]);

  return (
    <div className="space-y-5">
      <div className="border-b border-line pb-4">
        <h1 className="text-2xl font-bold text-ink">Imo-ishora namunalarini yozib olish</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Kamera oldida so&apos;zni ko&apos;rsating, saqlang, keyin{" "}
          <code>/student/lab/signs</code>da sinab ko&apos;ring. Mamnun bo&apos;lsangiz, pastdagi
          kodni <code>sign-content.ts</code>ga joylashtiring.
        </p>
      </div>

      <div className="card">
        <label className="label" htmlFor="admin-sign-word">
          So&apos;z
        </label>
        <select
          id="admin-sign-word"
          className="input"
          value={wordIndex}
          onChange={(e) => {
            setWordIndex(Number(e.target.value));
            setMsg("");
          }}
        >
          {signWords.map((w, i) => (
            <option key={w.id} value={i}>
              {w.labelUz} · {w.labelEn} ({w.category})
            </option>
          ))}
        </select>

        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div
            className="relative shrink-0 overflow-hidden rounded-sm bg-black"
            style={{ width: 320, aspectRatio: "4 / 3" }}
          >
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={hand.videoRef}
              muted
              playsInline
              className="h-full w-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            {phase === "countdown" && <RecOverlay>Tayyorlaning…</RecOverlay>}
            {phase === "recording" && <RecOverlay>● Yozilmoqda</RecOverlay>}
          </div>

          <div className="flex-1 space-y-3">
            {hand.error && <p role="alert" className="text-sm text-state-danger">{hand.error}</p>}
            {hand.modelLoading && (
              <p role="status" className="text-sm text-ink-muted">
                Yuklanmoqda…
              </p>
            )}
            <p className="text-sm text-ink-muted" role="status">
              {hand.active
                ? hand.handsVisible.left || hand.handsVisible.right
                  ? "✋ Qo'l ko'rinyapti"
                  : "Qo'l ko'rinmayapti — kameraga yaqinroq turing"
                : "Kamera hali yoqilmagan"}
            </p>
            <div className="flex gap-2">
              {!hand.active && (
                <button className="btn-primary" onClick={() => hand.startCamera()}>
                  Kamerani yoqish
                </button>
              )}
              {hand.active && (
                <button className="btn-primary" onClick={record} disabled={phase !== "idle"}>
                  {phase === "idle" ? "Yozib olish (2.5s)" : "Yozilmoqda…"}
                </button>
              )}
            </div>
            {msg && <p role="status" className="text-sm text-ink">{msg}</p>}
          </div>
        </div>

        {wordDrafts.length > 0 && (
          <div className="mt-5 border-t border-line pt-4">
            <p className="section-title">Shu so&apos;z uchun yozib olinganlar ({wordDrafts.length})</p>
            <ul className="mt-2 space-y-1.5">
              {wordDrafts.map((d) => (
                <li key={d.recordedAt} className="flex items-center justify-between text-sm">
                  <span className="text-ink-muted">
                    {new Date(d.recordedAt).toLocaleTimeString("uz")} · {d.landmarks.length} freym
                  </span>
                  <button
                    className="btn-danger px-2 py-1 text-xs"
                    onClick={() => removeDraft(d.recordedAt)}
                  >
                    O&apos;chirish
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="card">
        <p className="section-title">
          Export — <code>sign-content.ts</code>ga joylashtiriladigan kod ({drafts.length} ta namuna)
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Bu shu brauzerdagi qoralamalar — boshqa hech kimga yuborilmaydi. Tayyor bo&apos;lganda
          quyidagi matnni nusxalab, <code>web/src/lib/sign-content.ts</code> faylidagi{" "}
          <code>signReferences</code> massiviga joylang.
        </p>
        <textarea
          readOnly
          className="input mt-3 min-h-40 font-mono text-xs"
          value={exportCode}
          onFocus={(e) => e.target.select()}
        />
        <button
          className="btn-ghost mt-3"
          disabled={drafts.length === 0}
          onClick={() => navigator.clipboard.writeText(exportCode)}
        >
          Nusxa olish
        </button>
      </div>
    </div>
  );
}

function buildExportSnippet(drafts: ReturnType<typeof loadDraftReferences>): string {
  if (drafts.length === 0) return "// Hali hech narsa yozib olinmagan.";
  return `export const signReferences: SignReference[] = ${JSON.stringify(drafts, null, 2)};`;
}

function RecOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">
      {children}
    </div>
  );
}
