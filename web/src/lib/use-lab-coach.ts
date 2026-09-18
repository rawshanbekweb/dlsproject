"use client";
import { useEffect, useRef, useState } from "react";
import { record, validCoachResponse, type CoachAvailability, type CoachRequest, type CoachResponse } from "./lab-ai-contract";
import type { RoomResult, TeachingFeedback } from "./lab-engine";

export function useLabCoach() {
  const [availability, setAvailability] = useState<CoachAvailability>({ available: false, provider: null });
  const [enabled, setEnabled] = useState(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const mounted = useRef(false);
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    fetch("/api/lab/coach", { signal: controller.signal, cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) return;
        const data: unknown = await r.json();
        if (mounted.current && record(data) && typeof data.available === "boolean" && (data.provider === null || data.provider === "OpenAI" || data.provider === "Google Gemini")) setAvailability({ available: data.available, provider: data.provider });
      }).catch(() => {}).finally(() => clearTimeout(timer));
    return () => { mounted.current = false; clearTimeout(timer); controller.abort(); requestRef.current?.abort(); };
  }, []);

  async function evaluate<T extends TeachingFeedback | RoomResult>(request: CoachRequest, fallback: () => T): Promise<T | null> {
    if (requestRef.current) return null;
    if (!enabled || !availability.available) return fallback();
    const controller = new AbortController();
    requestRef.current = controller;
    setPending(true); setNotice("");
    const timer = setTimeout(() => controller.abort(), 12_000);
    try {
      const response = await fetch("/api/lab/coach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request), signal: controller.signal });
      if (!response.ok) throw new Error("Coach unavailable");
      const data: unknown = await response.json();
      if (!validCoachResponse(data, request.mode)) throw new Error("Invalid feedback");
      return mounted.current ? (data as CoachResponse).feedback as T : null;
    } catch {
      if (!mounted.current) return null;
      setNotice("Jonli aloqa vaqtincha uzildi. Javobingni tayyor mashq rejimida tekshirdim.");
      return fallback();
    } finally {
      clearTimeout(timer); requestRef.current = null;
      if (mounted.current) setPending(false);
    }
  }
  return { availability, enabled, setEnabled, pending, notice, evaluate };
}
