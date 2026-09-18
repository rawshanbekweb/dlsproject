"use client";

import { useEffect, useMemo, useState } from "react";
import { hasAnyHand, scoreSignAttempt, type SignSequence } from "@/lib/hand-landmarks";
import { useHandTracking } from "@/lib/use-hand-tracking";
import { signWords, signReferences, type SignWord } from "@/lib/sign-content";
import { loadDraftReferences } from "@/lib/sign-draft-store";
import { saveLabCompletion } from "@/lib/lab-progress";

const CAPTURE_MS = 2500;
/** Shu balldan yuqori — "to'g'ri" hisoblanadi. Haqiqiy namunalar bilan
 * sinalmagan, birinchi natijalardan keyin sozlash kerak bo'lishi mumkin. */
const PASS_SCORE = 60;

type Phase = "idle" | "countdown" | "recording" | "scoring" | "result";

export function SignPractice() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [draftReady, setDraftReady] = useState(false);
  const hand = useHandTracking();

  // Namunalar: kod ichidagi ro'yxat + shu brauzerda /admin/signs orqali
  // yozib olingan lekin hali export qilinmagan qoralamalar (sinov uchun).
  const referencesByWord = useMemo(() => {
    const map = new Map<string, SignSequence[]>();
    for (const ref of signReferences) {
      const list = map.get(ref.wordId) ?? [];
      list.push(ref.landmarks);
      map.set(ref.wordId, list);
    }
    if (draftReady) {
      for (const ref of loadDraftReferences()) {
        const list = map.get(ref.wordId) ?? [];
        list.push(ref.landmarks);
        map.set(ref.wordId, list);
      }
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftReady]);

  useEffect(() => setDraftReady(true), []);
  useEffect(() => () => hand.stopCamera(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const word = signWords[index];
  const references = referencesByWord.get(word.id) ?? [];
  const hasReference = references.length > 0;

  function reset() {
    setPhase("idle");
    setScore(null);
  }

  function selectWord(i: number) {
    setIndex(i);
    setAttempts(0);
    reset();
  }

  async function record() {
    if (!hand.active) {
      await hand.startCamera();
    }
    setPhase("countdown");
    window.setTimeout(() => {
      setPhase("recording");
      hand.startCapture();
      window.setTimeout(() => {
        const seq = hand.stopCapture();
        setPhase("scoring");
        window.setTimeout(() => finish(seq), 150);
      }, CAPTURE_MS);
    }, 700);
  }

  function finish(seq: SignSequence) {
    if (!hasAnyHand(seq)) {
      setScore(0);
      setPhase("result");
      return;
    }
    const s = scoreSignAttempt(seq, references);
    const nextAttempts = attempts + 1;
    setScore(s);
    setAttempts(nextAttempts);
    setPhase("result");
    if (s >= PASS_SCORE) saveLabCompletion("sign", word.id, nextAttempts);
  }

  return (
    <div className="lab-teach-grid">
      <section className="lab-robot-panel">
        <div className="lab-status">
          <i aria-hidden="true" /> {word.category}
        </div>
        <h2>
          {word.labelEn}
          <br />
          <span style={{ fontSize: "0.6em", fontWeight: 500 }}>{word.labelUz}</span>
        </h2>
        <p>Kamera oldida shu so&apos;zni imo-ishora bilan ko&apos;rsating.</p>
        {!hasReference && (
          <p className="lab-hint" role="status">
            Bu so&apos;z uchun hali namuna yo&apos;q. <code>/admin/signs</code> orqali yozib
            oling, keyin shu sahifada sinab ko&apos;rasiz.
          </p>
        )}
      </section>

      <section className="lab-conversation-panel">
        <div className="lab-conversation-heading">
          <span>Kamera</span>
          <span role="status">
            {hand.handsVisible.left || hand.handsVisible.right ? "✋ Qo'l ko'rinyapti" : "Qo'l ko'rinmayapti"}
          </span>
        </div>

        <div style={{ padding: 18 }}>
          <div
            style={{
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              background: "#111",
              aspectRatio: "4 / 3",
              maxWidth: 420,
              margin: "0 auto",
            }}
          >
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={hand.videoRef}
              muted
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
            />
            {phase === "countdown" && (
              <Overlay>Tayyorlaning…</Overlay>
            )}
            {phase === "recording" && <Overlay pulse>● Yozilmoqda</Overlay>}
            {phase === "scoring" && <Overlay>Tekshirilmoqda…</Overlay>}
          </div>

          {hand.error && (
            <p className="lab-input-note" role="alert">
              {hand.error}
            </p>
          )}
          {hand.modelLoading && (
            <p className="lab-input-note" role="status">
              Kamera va modelling yuklanmoqda…
            </p>
          )}

          <div className="lab-answer-actions" style={{ justifyContent: "center" }}>
            {!hand.active ? (
              <button type="button" className="lab-button" onClick={() => hand.startCamera()}>
                Kamerani yoqish
              </button>
            ) : phase === "idle" || phase === "result" ? (
              <button
                type="button"
                className="lab-button"
                disabled={!hasReference}
                onClick={record}
              >
                {phase === "result" ? "Qayta urinish" : "Boshlash"}
              </button>
            ) : null}
          </div>

          {phase === "result" && score !== null && (
            <div className="lab-completion" role="status" style={{ marginTop: 16 }}>
              <span className="lab-completion-icon">{score >= PASS_SCORE ? "✦" : "↻"}</span>
              <h2>{score} ball</h2>
              <p>
                {score >= PASS_SCORE
                  ? "To'g'ri! Imo aniq ko'rsatildi."
                  : "Yaqin edi — yana bir bor urinib ko'ring."}
              </p>
            </div>
          )}
        </div>

        <p className="lab-scenario-note">
          Kamera video hech qachon saqlanmaydi va serverga yuborilmaydi — qo&apos;l harakati
          shu sahifada, brauzeringizda tahlil qilinadi.
        </p>
      </section>

      <div className="lab-topic-tabs" style={{ gridColumn: "1 / -1" }} aria-label="So'z tanlash">
        {signWords.map((w: SignWord, i: number) => (
          <button
            key={w.id}
            type="button"
            aria-pressed={i === index}
            onClick={() => selectWord(i)}
          >
            {w.labelUz}
          </button>
        ))}
      </div>
    </div>
  );
}

function Overlay({ children, pulse }: { children: React.ReactNode; pulse?: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
        color: "white",
        fontWeight: 600,
        fontSize: 14,
      }}
      className={pulse ? "coach-thinking-dots" : undefined}
    >
      {children}
    </div>
  );
}
