"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { loadLabProgress, type LabCompletion } from "@/lib/lab-progress";
import { labMissions, teachingLessons } from "@/lib/lab-content";
import { signWords } from "@/lib/sign-content";

export function LabProgress() {
  const [progress, setProgress] = useState<LabCompletion[]>([]);
  useEffect(() => {
    const update = () => setProgress(loadLabProgress());
    update();
    window.addEventListener("speakup-lab-progress", update);
    window.addEventListener("storage", update);
    return () => { window.removeEventListener("speakup-lab-progress", update); window.removeEventListener("storage", update); };
  }, []);
  const taught = teachingLessons.filter((lesson) => progress.some((p) => p.mode === "teach" && p.missionId === lesson.id)).length;
  const built = labMissions.filter((mission) => progress.some((p) => p.mode === "room" && p.missionId === mission.id)).length;
  const signed = signWords.filter((word) => progress.some((p) => p.mode === "sign" && p.missionId === word.id)).length;
  return <section className="lab-progress-card" aria-label="Laboratoriya natijalari">
    <span className="lab-eyebrow">Kashfiyot daftaring</span>
    <h2>Har tushuntirish — yangi qadam.</h2>
    <div className="lab-progress-numbers"><div><strong>{taught}<small> / {teachingLessons.length}</small></strong><span>Nomiga o‘rgatilgan mavzu</span></div><div><strong>{built}<small> / {labMissions.length}</small></strong><span>Bajarilgan xona vazifasi</span></div><div><strong>{signed}<small> / {signWords.length}</small></strong><span>O‘rganilgan imo-ishora</span></div></div>
    <div className="lab-progress-trail" aria-label="Bajarilgan kashfiyotlar">{[...teachingLessons.map((item) => ({ ...item, mode: "teach" })), ...labMissions.map((item) => ({ ...item, mode: "room", icon: "⌘" })), ...signWords.map((item) => ({ id: item.id, title: item.labelUz, icon: "✋", mode: "sign" }))].map((item) => { const complete = progress.some((p) => p.mode === item.mode && p.missionId === item.id); return <div key={`${item.mode}-${item.id}`} className={complete ? "is-complete" : ""}><span aria-hidden="true">{complete ? "✓" : item.icon}</span><small>{item.title}</small><span className="sr-only">{complete ? "Bajarilgan" : "Hali bajarilmagan"}</span></div>; })}</div>
    <p>Natijalar shu brauzerda saqlanadi.</p>
    <Link href="/student/lab" className="lab-text-link">Kashf etishni davom ettirish →</Link>
  </section>;
}
