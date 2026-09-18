import Link from "next/link";
import { SignPractice } from "@/components/lab/SignPractice";

export default function SignsPage() {
  return (
    <main className="lab-container lab-workspace">
      <Link href="/student/lab" className="lab-back">
        ← Kashfiyotlarga qaytish
      </Link>
      <div className="lab-page-heading">
        <div>
          <span className="lab-eyebrow">03 / Ovozsiz ham gapirish mumkin</span>
          <h1>Imo-ishora mashqi</h1>
          <p>
            So&apos;zni ko&apos;ring, kamera oldida imo-ishora bilan ko&apos;rsating. Gapira
            olmasangiz ham, shu tarzda ingliz lug&apos;atini mashq qilaverasiz.
          </p>
        </div>
      </div>
      <SignPractice />
    </main>
  );
}
