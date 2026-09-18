"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";

export function LabNav({ panelHref, panelLabel }: { panelHref?: string; panelLabel?: string }) {
  const path = usePathname();
  const items = [{ href: "/student/lab", label: "Kashfiyotlar", icon: "compass" as const }, { href: "/student", label: "Mashqlar", icon: "library" as const }, { href: "/student/progress", label: "Natijalarim", icon: "chart" as const }];
  return <header className="lab-nav"><Link href="/" className="lab-brand" aria-label="SpeakUp bosh sahifa"><span className="lab-brand-symbol" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M8 9h13a5 5 0 0 1 0 10H11l-5 5V11a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2.5" /><circle cx="13" cy="14" r="1.5" fill="currentColor" /><circle cx="20" cy="14" r="1.5" fill="currentColor" /></svg></span><span>speakup<span className="lab-brand-sub">LEARNING STUDIO</span></span></Link><nav aria-label="Asosiy navigatsiya">{items.map((item) => { const active = item.href === "/student/lab" ? path.startsWith(item.href) : path === item.href; return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}><Icon name={item.icon} size={16} />{item.label}</Link>; })}</nav>{panelHref ? <Link href={panelHref} className="lab-nav-panel">{panelLabel || "O‘qituvchi uchun"} <span aria-hidden="true">↗</span></Link> : <span className="lab-nav-note"><i /> Kichik qadam. Katta o‘sish.</span>}</header>;
}
