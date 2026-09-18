"use client";

// Kamera + MediaPipe qo'l kuzatuvi — `use-speech.ts` bilan bir xil shakldagi
// hook (supported/start/stop/error), faqat mikrofon o'rniga kamera.
//
// NEGA CDN'DAN YUKLANADI: `@mediapipe/tasks-vision` npm paketi faqat JS
// o'ramini beradi — WASM ikkilik va model fayli (~10-20MB) alohida, CDN'dan
// olib kelinadi (Google'ning o'zi shunday tavsiya qiladi). Bu ham xuddi Vosk
// modeli kabi: birinchi ochilishda internet kerak, brauzer keshlagach keyingi
// safar tezroq. To'liq offline emas, lekin loyihaning boshqa joylarida ham
// (Vosk, LanguageTool) shu andoza ishlatilgan.
//
// MAXFIYLIK: video kadri hech qachon serverga yuborilmaydi — aniqlash
// to'liq brauzerda (WASM) ishlaydi. Faqat 21 nuqtaning x,y koordinatalari
// xotirada saqlanadi (`hand-landmarks.ts`), ular ham faqat ball chiqarish
// uchun, hech qayerga jo'natilmaydi.

import { useCallback, useEffect, useRef, useState } from "react";
import type { SignFrame, SignSequence } from "./hand-landmarks";

const MEDIAPIPE_VERSION = "1.0.1";
const WASM_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

// `HandLandmarker`ning konstruktori private (faqat createFromOptions orqali
// yaratiladi) — shuning uchun instans turini shu funksiyaning qaytar
// qiymatidan chiqaramiz, `InstanceType<typeof HandLandmarker>` ishlamaydi.
type HandLandmarkerInstance = Awaited<
  ReturnType<typeof import("@mediapipe/tasks-vision").HandLandmarker.createFromOptions>
>;

let landmarkerPromise: Promise<HandLandmarkerInstance> | null = null;

/** Model bir marta yuklanadi, keyin sahifalar orasida qayta ishlatiladi. */
function getHandLandmarker(): Promise<HandLandmarkerInstance> {
  if (!landmarkerPromise) {
    landmarkerPromise = import("@mediapipe/tasks-vision").then(async ({ HandLandmarker, FilesetResolver }) => {
      const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
      return HandLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
        runningMode: "VIDEO",
        numHands: 2,
      });
    });
  }
  return landmarkerPromise;
}

export type HandsVisible = { left: boolean; right: boolean };

export function useHandTracking() {
  const [supported, setSupported] = useState(true);
  const [active, setActive] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [error, setError] = useState("");
  const [handsVisible, setHandsVisible] = useState<HandsVisible>({ left: false, right: false });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarkerInstance | null>(null);
  const rafRef = useRef<number | null>(null);
  const recordingRef = useRef(false);
  const bufferRef = useRef<SignSequence>([]);

  useEffect(() => {
    setSupported(typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia);
  }, []);

  const loop = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    const result = landmarker.detectForVideo(video, performance.now());
    const frame: SignFrame = { left: null, right: null };
    result.landmarks.forEach((points: { x: number; y: number }[], i: number) => {
      // "Left"/"Right" — MediaPipe'ning kadrga nisbatan bergan yorlig'i.
      // Aniq ma'nosi (chap/o'ng) muhim emas — muhimi yozib olish va mashq
      // paytida BIR XIL naqsh ishlatilishi, chunki solishtirish shu bo'yicha.
      const label = result.handedness[i]?.[0]?.categoryName === "Left" ? "left" : "right";
      const hand = points.map((p) => ({ x: p.x, y: p.y }));
      if (label === "left") frame.left = hand;
      else frame.right = hand;
    });
    setHandsVisible({ left: !!frame.left, right: !!frame.right });
    if (recordingRef.current) bufferRef.current.push(frame);

    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const startCamera = useCallback(async () => {
    setError("");
    if (!supported) {
      setError("Bu brauzerda kamera qo'llab-quvvatlanmaydi.");
      return;
    }
    try {
      setModelLoading(true);
      const [stream, landmarker] = await Promise.all([
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false }),
        getHandLandmarker(),
      ]);
      streamRef.current = stream;
      landmarkerRef.current = landmarker;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setModelLoading(false);
      setActive(true);
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      setModelLoading(false);
      setError(
        e instanceof Error && e.name === "NotAllowedError"
          ? "Kameraga ruxsat berilmadi."
          : "Kamerani ochib bo'lmadi. Qayta urinib ko'ring.",
      );
    }
  }, [supported, loop]);

  const stopCamera = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
    setHandsVisible({ left: false, right: false });
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCapture = useCallback(() => {
    bufferRef.current = [];
    recordingRef.current = true;
  }, []);

  const stopCapture = useCallback((): SignSequence => {
    recordingRef.current = false;
    return bufferRef.current;
  }, []);

  return {
    supported,
    active,
    modelLoading,
    error,
    handsVisible,
    videoRef,
    startCamera,
    stopCamera,
    startCapture,
    stopCapture,
  };
}
