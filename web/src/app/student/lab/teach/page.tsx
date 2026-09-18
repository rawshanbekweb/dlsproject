"use client";
import { useState } from "react";
import Link from "next/link";
import { Nomi } from "@/components/lab/Nomi";
import { AnswerInput, MessageFeed, type LabMessage } from "@/components/lab/LabConversation";
import { teachingLessons } from "@/lib/lab-content";
import { evaluateTeaching } from "@/lib/lab-engine";
import { saveLabCompletion } from "@/lib/lab-progress";
import { stopSpeaking } from "@/lib/use-speech";
import { useLabCoach } from "@/lib/use-lab-coach";
import { CoachMode } from "@/components/lab/CoachMode";

export default function TeachPage() {
  const [selected, setSelected] = useState(0);
  const [session, setSession] = useState(0);
  return <main className="lab-container lab-workspace"><Link href="/student/lab" className="lab-back">← Kashfiyotlarga qaytish</Link><div className="lab-page-heading"><div><span className="lab-eyebrow">01 / Sen — o‘qituvchi</span><h1>AI’ga sen o‘rgat</h1><p>Nomi adashishi mumkin. Unga tushuntir, misol keltir va bilimini tekshir.</p></div><span className="lab-tag">3 mavzu · A1–A2</span></div>
    <div className="lab-topic-tabs" aria-label="Mavzuni tanlash">{teachingLessons.map((lesson, index) => <button key={lesson.id} aria-pressed={selected === index} onClick={() => { stopSpeaking(); setSelected(index); setSession((s) => s + 1); }}><span aria-hidden="true">{lesson.icon}</span>{lesson.title}</button>)}</div>
    <TeachingSession key={`${selected}-${session}`} lessonIndex={selected} onRestart={() => setSession((s) => s + 1)} onNext={() => { setSelected((selected + 1) % teachingLessons.length); setSession((s) => s + 1); }} />
  </main>;
}

function TeachingSession({ lessonIndex, onRestart, onNext }: { lessonIndex: number; onRestart: () => void; onNext: () => void }) {
  const lesson = teachingLessons[lessonIndex];
  const [stepIndex, setStepIndex] = useState(0);
  const [messages, setMessages] = useState<LabMessage[]>([{ role: "nomi", text: lesson.steps[0].prompt }]);
  const [turns, setTurns] = useState(0);
  const [hint, setHint] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(true);
  const coach = useLabCoach();
  const done = stepIndex >= lesson.steps.length;
  const step = lesson.steps[Math.min(stepIndex, lesson.steps.length - 1)];
  const answer = async (text: string) => {
    if (done || coach.pending) return;
    const result = await coach.evaluate({ mode: "teach", lessonId: lesson.id, stepIndex, answer: text, history: messages.slice(-6).map(({ role, text }) => ({ role, text })) }, () => evaluateTeaching(step, text));
    if (!result) return;
    const nextTurns = turns + 1;
    const nextStep = stepIndex + (result.understood ? 1 : 0);
    const additions: LabMessage[] = [{ role: "student", text }, { role: "nomi", text: result.reply, tip: result.tip, success: result.understood }];
    if (result.understood && nextStep < lesson.steps.length) additions.push({ role: "nomi", text: lesson.steps[nextStep].prompt });
    if (nextStep === lesson.steps.length) setSaved(saveLabCompletion("teach", lesson.id, nextTurns));
    setMessages((old) => [...old, ...additions]); setTurns(nextTurns); setStepIndex(nextStep); setHint(false); setBusy(false);
  };
  return <div className="lab-teach-grid"><aside className="lab-robot-panel"><span className="lab-status"><i /> {done ? "Yangi bilim o‘zlashtirildi" : busy ? "Nomi seni tinglayapti" : "Nomi o‘rganishga tayyor"}</span><Nomi mood={done ? "happy" : busy ? "listening" : "thinking"} /><h2>Kichik robot.<br />Katta qiziqish.</h2><p>{lesson.description}</p><div className="lab-step-list">{["Xato fikrni tuzat", "Misol yoki sabab keltir", "Yangi vaziyatda tekshir"].map((label, index) => <div key={label} className={stepIndex > index ? "is-complete" : stepIndex === index ? "is-current" : ""}><span>{stepIndex > index ? "✓" : `0${index + 1}`}</span>{label}</div>)}</div><div className="lab-memory"><span className="lab-eyebrow">Nomining bilim daftari</span>{stepIndex === 0 ? <p>Ilk tushuntirishingni kutyapti…</p> : lesson.steps.slice(0, stepIndex).map((item) => <p key={item.rule} lang="en">✓ {item.learned}</p>)}</div></aside>
    <section className="lab-conversation-panel"><div className="lab-conversation-heading"><span>{lesson.icon} {lesson.topic}</span><span>{Math.min(stepIndex + 1, 3)} / 3 bosqich</span></div><CoachMode availability={coach.availability} enabled={coach.enabled} onChange={coach.setEnabled} pending={coach.pending || busy} notice={coach.notice} /><MessageFeed messages={messages} busy={busy || coach.pending} />
      {done ? <div className="lab-completion" role="status"><span className="lab-completion-icon">✦</span><h2>Bugun Nomi sendan o‘rgandi!</h2><p>Sen fikrni tuzatding, tushuntirding va yangi vaziyatda tekshirding.</p><small>{saved ? "Mavzu kashfiyot daftaringga saqlandi." : "Brauzer natijani saqlay olmadi. Mashqni muvaffaqiyatli bajarding."}</small><div><button className="lab-button" onClick={onNext}>Keyingi mavzu →</button><button className="lab-button lab-button--soft" onClick={onRestart}>Qayta o‘rgatish</button></div><Link href="/student/lab/room" className="lab-text-link">Endi ko‘rsatmalaringni laboratoriyada sinab ko‘r →</Link></div> : <><div className="lab-task"><strong>{step.goal}</strong><button type="button" aria-expanded={hint} onClick={() => setHint(!hint)}>{hint ? "Yordamni yopish" : "Kichik yordam ✧"}</button>{hint && <div className="lab-hint"><p>{step.hint}</p><p lang="en">{step.example}</p></div>}</div><AnswerInput key={turns} onAnswer={answer} onBusy={setBusy} disabled={coach.pending} /></>}
      <p className="lab-scenario-note">{coach.enabled ? "Nomi ham adashishi mumkin. Muhimi — fikringni tushuntirish va savol berish." : "Tayyor o‘quv ssenariysi. Nomi tushunmasa, namunaga yaqinroq qilib qayta tushuntir."}</p>
    </section></div>;
}
