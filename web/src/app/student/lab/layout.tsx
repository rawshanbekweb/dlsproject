import type { Metadata } from "next";
import Link from "next/link";
import { LabNav } from "@/components/lab/LabNav";
export const metadata: Metadata = { title: "SpeakUp Lab — Nomi bilan kashf qil", description: "Robotga inglizcha o‘rgat va gaplaring bilan interaktiv xonani o‘zgartir." };
export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <div className="lab-page"><LabNav />{children}<footer className="lab-footer"><span>SpeakUp Studio · Kichik savollar, katta kashfiyotlar.</span><Link href="/maxfiylik">Maxfiylik</Link></footer></div>;
}
