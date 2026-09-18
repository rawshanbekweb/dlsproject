"use client";

import { useEffect, useState } from "react";
import type { ContentPack } from "./content-types";

// Modul darajasidagi kesh — sahifalar orasida yurganda qayta yuklanmasin.
let cached: ContentPack | null = null;

export function useContent() {
  const [pack, setPack] = useState<ContentPack | null>(cached);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cached) return;
    let alive = true;
    fetch("/api/content", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("Kontent yuklanmadi");
        return r.json();
      })
      .then((data: ContentPack) => {
        if (!alive) return;
        if (!Array.isArray(data.modules)) throw new Error("Kontent formati yaroqsiz");
        cached = data;
        setPack(data);
      })
      .catch(() => {
        if (alive) setError("Kontent yuklanmadi. Internetni tekshiring.");
      });
    return () => {
      alive = false;
    };
  }, []);

  return { pack, error };
}
