import type { CoachAvailability } from "@/lib/lab-ai-contract";

export function CoachMode({ availability, enabled, onChange, pending, notice }: { availability: CoachAvailability; enabled: boolean; onChange: (enabled: boolean) => void; pending: boolean; notice: string }) {
  return <div className="coach-mode">
    <div className="coach-mode-row"><span className="coach-mode-label"><span aria-hidden="true">✦</span> Nomi bilan mashq</span><div className="coach-mode-options" role="group" aria-label="Nomi rejimi"><button type="button" aria-pressed={!enabled} disabled={pending} onClick={() => onChange(false)}>Tayyor mashq</button><button type="button" aria-pressed={enabled} disabled={!availability.available || pending} onClick={() => onChange(true)}>Jonli AI <span aria-hidden="true">✧</span></button></div></div>
    <p>{enabled ? `Jonli rejimda javobing va oxirgi 6 ta xabar ${availability.provider} xizmatiga yuboriladi. Istalgan payt tayyor mashqqa qaytishing mumkin.` : availability.available ? "O‘zingga mos rejimni tanla. Jonli AI turlicha ifodalangan fikrlarni ham tushunishga yordam beradi." : "Nomi bilan tayyor mashqlar ishlayapti. Jonli suhbat hozircha mavjud emas."}</p>
    {notice && <p className="coach-fallback" role="status">{notice}</p>}
    {pending && <div className="coach-thinking" role="status"><span className="coach-thinking-dots" aria-hidden="true">● ● ●</span> Nomi tushuntirishing haqida o‘ylayapti…</div>}
  </div>;
}
