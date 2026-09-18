import { LabSection } from "@/components/lab/LabCards";
import { LabProgress } from "@/components/lab/LabProgress";
import { Nomi } from "@/components/lab/Nomi";
import Link from "next/link";

export default function LabHome() {
  return <main className="lab-container"><section className="lab-welcome"><div><span className="lab-eyebrow">Sening kashfiyot studiyang</span><h1>Har savol —<br /><em>yangi boshlanish.</em></h1><p>Men Nomi. Yerga endigina keldim. Inglizcha gaplashib, menga bu dunyoni tushunishga yordam berasanmi?</p><Link href="/student/lab/teach" className="lab-button">Birga boshlaymiz ↗</Link></div><div className="lab-welcome-orbit"><span aria-hidden="true">✧</span><Nomi className="lab-welcome-robot" /><span className="lab-welcome-note">Bugun sendan nima o‘rganaman?</span></div></section><LabSection /><LabProgress /></main>;
}
