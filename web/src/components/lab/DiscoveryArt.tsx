import { Nomi } from "./Nomi";

export function DiscoveryArt() {
  return <div className="discovery-art">
    <div className="discovery-orbit discovery-orbit--outer" aria-hidden="true" /><div className="discovery-orbit discovery-orbit--inner" aria-hidden="true" />
    <div className="discovery-planet" aria-hidden="true"><span>✦</span><span>+</span><span>✧</span></div>
    <div className="discovery-question"><span className="discovery-avatar" aria-hidden="true">N</span><div><small>NOMI · SENING QIZIQUVCHAN DO‘STING</small><p lang="en">“All birds can fly… right?”</p></div><span aria-hidden="true">?</span></div>
    <Nomi mood="thinking" />
    <div className="discovery-answer"><span aria-hidden="true">↳</span><div><small>BU SAFAR O‘QITUVCHI — SEN</small><p lang="en">“Not all of them, Nomi!”</p></div></div>
    <div className="discovery-fact"><span aria-hidden="true">🪶</span><div><strong>Bilim almashamiz.</strong><small>Xato qilish — o‘rganishning bir qismi.</small></div></div>
    <span className="discovery-star" aria-hidden="true">✳</span>
  </div>;
}

export function LearningJourney() {
  return <section className="learning-journey" aria-label="O‘rganish yo‘li"><div><span className="lab-eyebrow">Bizning usul</span><h2>Bilishdan<br />tushuntirishgacha.</h2></div><ol><li><span>01</span><div><strong>Qiziqib ko‘r.</strong><p>Bir savol yoki kichik vazifadan boshla.</p></div></li><li><span>02</span><div><strong>O‘z so‘zing bilan ayt.</strong><p>Gapir, izohla, misol keltir. Yordam yoningda.</p></div></li><li><span>03</span><div><strong>Natijani ko‘r.</strong><p>Nomi o‘rganadi. Xona o‘zgaradi. Sen o‘sasan.</p></div></li></ol></section>;
}
