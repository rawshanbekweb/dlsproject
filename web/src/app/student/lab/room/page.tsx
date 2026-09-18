"use client";
import { useState } from "react";
import Link from "next/link";
import { AnswerInput, MessageFeed, type LabMessage } from "@/components/lab/LabConversation";
import { RoomScene } from "@/components/lab/RoomScene";
import { labMissions, relationLabels, roomObjects, type ObjectId, type Placement } from "@/lib/lab-content";
import { interpretRoom, matchesTarget, type PendingCommand } from "@/lib/lab-engine";
import { saveLabCompletion } from "@/lib/lab-progress";
import { stopSpeaking } from "@/lib/use-speech";
import { useLabCoach } from "@/lib/use-lab-coach";
import { CoachMode } from "@/components/lab/CoachMode";

export default function RoomPage() {
  const [mission, setMission] = useState(0);
  const [session, setSession] = useState(0);
  return <main className="lab-container lab-workspace"><Link href="/student/lab" className="lab-back">← Kashfiyotlarga qaytish</Link><div className="lab-page-heading"><div><span className="lab-eyebrow">02 / Gaplaring harakatga aylanadi</span><h1>Tushunmovchilik laboratoriyasi</h1><p>Buyumni tasvirla. Joyini ayt. Nomi tushunmasa, aniqlashtir.</p></div></div>
    <div className="lab-topic-tabs" aria-label="Xona vazifasini tanlash">{labMissions.map((item, index) => <button key={item.id} aria-pressed={mission === index} onClick={() => { stopSpeaking(); setMission(index); setSession((s) => s + 1); }}>0{index + 1} · {item.title}</button>)}</div>
    <RoomSession key={`${mission}-${session}`} missionIndex={mission} onRestart={() => setSession((s) => s + 1)} onNext={() => { setMission((mission + 1) % labMissions.length); setSession((s) => s + 1); }} />
  </main>;
}
function RoomSession({ missionIndex, onRestart, onNext }: { missionIndex: number; onRestart: () => void; onNext: () => void }) {
  const mission = labMissions[missionIndex];
  const [placements, setPlacements] = useState<Partial<Record<ObjectId, Placement>>>({});
  const [pending, setPending] = useState<PendingCommand>({});
  const [messages, setMessages] = useState<LabMessage[]>([{ role: "nomi", text: "Welcome to my room! Tell me what to move and where to put it.", tip: "Masalan, faqat “Put the chair near the table” deb ko‘r. Nomi qaysi stulni nazarda tutganingni so‘raydi." }]);
  const [turns, setTurns] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState(true);
  const [hint, setHint] = useState(false);
  const coach = useLabCoach();
  const answer = async (text: string) => {
    if (done || coach.pending) return;
    const result = await coach.evaluate({ mode: "room", missionId: mission.id, answer: text, pending, history: messages.slice(-6).map(({ role, text }) => ({ role, text })) }, () => interpretRoom(text, pending));
    if (!result) return;
    const nextTurns = turns + 1;
    let success = false;
    let reply = result.reply;
    let tip = result.tip;
    if (result.kind === "move") {
      setPlacements((old) => ({ ...old, [result.placement.object]: result.placement }));
      const object = roomObjects.find((item) => item.id === result.placement.object)!;
      reply = `I put the ${object.label} ${relationLabels[result.placement.relation]} the ${result.placement.anchor}.`;
      success = matchesTarget(result.placement, mission.target);
      tip = success ? "Aniq tushuntirding! Buyum kerakli joyga yetib bordi." : "Ko‘rsatmani bajardim. Endi vazifadagi buyum va nuqtali maqsad joyini tekshir.";
      if (success) { setDone(true); setSaved(saveLabCompletion("room", mission.id, nextTurns)); }
    }
    setMessages((old) => [...old, { role: "student", text }, { role: "nomi", text: reply, tip, success }]);
    setPending(result.pending); setTurns(nextTurns); setBusy(false);
  };
  return <div className="lab-room-grid"><section><div className="lab-mission"><span className="lab-eyebrow">Sening vazifang / 0{missionIndex + 1}</span><h2>{mission.goal}</h2><p>Maqsadga inglizcha ko‘rsatma berib erish.</p></div><RoomScene placements={placements} target={mission.target} complete={done} /><div className="lab-vocabulary"><h3>Xona lug‘ati</h3><div><span>red chair</span><span>blue chair</span><span>green plant</span><span>red book</span></div><div><span>table</span><span>window</span><span>shelf</span></div><div><span>to the left of</span><span>to the right of</span><span>on</span><span>under</span><span>next to</span></div></div><div className="lab-room-help"><button className="lab-text-link" aria-expanded={hint} onClick={() => setHint(!hint)}>Namunaviy ko‘rsatma {hint ? "−" : "+"}</button><button className="lab-text-link" onClick={onRestart}>Xonani qayta boshlash ↻</button></div>{hint && <p className="lab-hint" lang="en">{mission.example}</p>}</section>
    <section className="lab-conversation-panel"><div className="lab-conversation-heading"><span><span className="lab-nomi-dot" /> Nomi bilan muloqot</span><span>{turns} ta ko‘rsatma</span></div><CoachMode availability={coach.availability} enabled={coach.enabled} onChange={coach.setEnabled} pending={coach.pending || busy} notice={coach.notice} /><MessageFeed messages={messages} busy={busy || coach.pending} />{done ? <div className="lab-completion" role="status"><span className="lab-completion-icon">✦</span><h2>Bir-biringizni tushundingiz!</h2><p>Ko‘rsatmang xonada haqiqiy o‘zgarish qildi.</p><small>{saved ? "Vazifa kashfiyot daftaringga saqlandi." : "Brauzer natijani saqlay olmadi. Vazifa bajarildi."}</small><div><button className="lab-button" onClick={onNext}>Keyingi vazifa →</button><button className="lab-button lab-button--soft" onClick={onRestart}>Qayta sinash</button></div></div> : <AnswerInput key={turns} onAnswer={answer} onBusy={setBusy} disabled={coach.pending} placeholder="Put the…" />}<p className="lab-scenario-note">Har safar bitta buyum. Xona lug‘atidagi ko‘rsatmalar bilan mashq qil.</p></section></div>;
}
