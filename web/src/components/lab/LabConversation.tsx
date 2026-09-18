"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { speak, stopSpeaking, useSpeechRecognition } from "@/lib/use-speech";

export type LabMessage = { role: "nomi" | "student"; text: string; tip?: string; success?: boolean };

export function MessageFeed({ messages, busy }: { messages: LabMessage[]; busy: boolean }) {
  const feed = useRef<HTMLDivElement>(null);
  useEffect(() => { if (feed.current) feed.current.scrollTop = feed.current.scrollHeight; }, [messages]);
  useEffect(() => () => stopSpeaking(), []);
  return <div className="lab-messages" ref={feed} role="log" aria-label="Nomi bilan suhbat" aria-live="polite" aria-relevant="additions">
    {messages.map((message, index) => <div key={index} className={`lab-message lab-message--${message.role}${message.success ? " lab-message--success" : ""}`}>
      <div className="lab-message-who"><span>{message.role === "nomi" ? "NOMI" : "SEN"}</span>{message.role === "nomi" && <button type="button" title="Inglizcha tinglash" aria-label="Nomi gapini tinglash" disabled={busy} onClick={() => speak(message.text)}><Icon name="volumeUp" size={16} /></button>}</div>
      <p lang="en">{message.text}</p>{message.tip && <small>{message.tip}</small>}
    </div>)}
  </div>;
}

export function AnswerInput({ onAnswer, onBusy, disabled = false, placeholder = "Inglizcha tushuntir…" }: { onAnswer: (text: string) => void; onBusy: (busy: boolean) => void; disabled?: boolean; placeholder?: string }) {
  const speech = useSpeechRecognition();
  const [text, setText] = useState("");
  const [settling, setSettling] = useState(false);
  const capture = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallback = useRef("");
  useEffect(() => {
    if (capture.current && speech.finalText) setText(speech.finalText.slice(0, 600));
  }, [speech.finalText]);
  useEffect(() => {
    onBusy(speech.listening || settling);
  }, [speech.listening, settling, onBusy]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const stop = () => {
    fallback.current = `${speech.finalText} ${speech.interimText}`.trim().slice(0, 600);
    if (fallback.current) setText(fallback.current);
    speech.stop();
    setSettling(true);
    timer.current = setTimeout(() => { capture.current = false; setSettling(false); }, 450);
  };
  return <form className="lab-answer" aria-busy={disabled} onSubmit={(event) => { event.preventDefault(); if (!text.trim() || speech.listening || settling || disabled) return; stopSpeaking(); onAnswer(text.trim()); }}>
    <label htmlFor="lab-answer-text">Sening navbating <span>· ingliz tilida</span></label>
    <textarea id="lab-answer-text" value={text} maxLength={600} rows={3} readOnly={speech.listening || settling || disabled} onChange={(event) => setText(event.target.value)} placeholder={placeholder} />
    {speech.listening && <p className="lab-listening" role="status">● Tinglayapman… {speech.interimText}</p>}
    {speech.error && <p className="lab-input-note" role="alert">{speech.error} Javobni yozib yuborishing ham mumkin.</p>}
    {!speech.supported && <p className="lab-input-note">Bu brauzerda ovozli kiritish yo‘q. Javobingni yozib yubor.</p>}
    <div className="lab-answer-actions"><button type="button" className={`lab-button lab-button--soft${speech.listening ? " lab-recording" : ""}`} disabled={!speech.supported || settling || disabled} onClick={() => { if (speech.listening) stop(); else { stopSpeaking(); capture.current = true; speech.start(); } }}><Icon name="mic" size={17} />{speech.listening ? "To‘xtatish" : "Gapirish"}</button><span>{text.length}/600</span><button type="submit" className="lab-button" disabled={!text.trim() || speech.listening || settling || disabled}>{disabled ? "O‘ylayapti…" : "Yuborish"} <span aria-hidden="true">↑</span></button></div>
    <p className="lab-input-note">Ovozli kiritish internet talab qiladi. Yuborishdan oldin matnni tekshirib ol.</p>
  </form>;
}
