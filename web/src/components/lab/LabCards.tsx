import Link from "next/link";
import { Nomi } from "./Nomi";
import { signWords } from "@/lib/sign-content";

export function LabCards() {
  return (
    <div className="lab-cards">
      <Link href="/student/lab/teach" className="lab-feature lab-feature--teach">
        <div className="lab-feature-art"><span className="lab-art-index">01</span><Nomi /><span className="lab-float-note">But… why?</span><span className="lab-art-skill">TUSHUNTIRISH + MANTIQ</span></div>
        <div className="lab-feature-copy">
          <span className="lab-eyebrow">01 / Rollarni almashtiramiz</span>
          <h3>AI’ga sen o‘rgat</h3>
          <div className="lab-feature-meta"><span>3 mavzu</span><span>A1–A2</span><span>Ovoz / matn</span></div>
          <p>Nomi Yer haqida hali ko‘p narsani bilmaydi. Uning xatosini top, tushuntir va unga yangi narsani o‘rgat.</p>
          <span className="lab-card-link">Nomi bilan tanishish <span aria-hidden="true">↗</span></span>
        </div>
      </Link>
      <Link href="/student/lab/room" className="lab-feature lab-feature--room">
        <div className="lab-feature-art lab-mini-room" aria-hidden="true"><span className="lab-art-index">02</span><span className="mini-window" /><span className="mini-shelf" /><span className="mini-plant">🌱</span><span className="mini-table" /><span className="mini-chair" /><span className="lab-float-note">The red one!</span><span className="lab-art-skill">ANIQLIK + MULOQOT</span></div>
        <div className="lab-feature-copy">
          <span className="lab-eyebrow">02 / Gaplaring harakatga aylanadi</span>
          <h3>Tushunmovchilik laboratoriyasi</h3>
          <div className="lab-feature-meta"><span>3 vazifa</span><span>Interaktiv xona</span></div>
          <p>Sen ayt, Nomi joylashtirsin. Noaniq ko‘rsatmani birgalikda aniqlashtirib, xonani o‘zing yarat.</p>
          <span className="lab-card-link">Laboratoriyaga kirish <span aria-hidden="true">↗</span></span>
        </div>
      </Link>
      <Link href="/student/lab/signs" className="lab-feature lab-feature--signs">
        <div className="lab-feature-art" aria-hidden="true"><span className="lab-art-index">03</span><span style={{ fontSize: 64 }}>🤟</span><span className="lab-float-note">Hello!</span><span className="lab-art-skill">IMO-ISHORA</span></div>
        <div className="lab-feature-copy">
          <span className="lab-eyebrow">03 / Ovozsiz ham gapirish mumkin</span>
          <h3>Imo-ishora mashqi</h3>
          <div className="lab-feature-meta"><span>{signWords.length} ta so‘z</span><span>Kamera orqali</span></div>
          <p>So‘zni ko‘r, kamera oldida imo bilan ko‘rsat. Gapira olmasang ham, mashq qilaverasan.</p>
          <span className="lab-card-link">Imo bilan boshlash <span aria-hidden="true">↗</span></span>
        </div>
      </Link>
    </div>
  );
}

export function LabSection() {
  return <section className="lab-section" aria-labelledby="lab-section-title">
    <div className="lab-section-heading"><div><span className="lab-eyebrow">SpeakUp / Yangi tajribalar</span><h2 id="lab-section-title">Bugun nimani kashf qilamiz?</h2></div><span className="lab-tag">Gapir · Tushuntir · Kashf qil</span></div>
    <LabCards />
  </section>;
}
