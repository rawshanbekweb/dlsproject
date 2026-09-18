import type { Metadata } from "next";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { getSession } from "@/lib/session";
import type { Mnemonic, SpeakingModule } from "@/lib/content-types";
import { Icon, type IconName } from "@/components/Icon";
import ApkHeroButton from "@/components/ApkHeroButton";
import { LabSection } from "@/components/lab/LabCards";
import { DiscoveryArt, LearningJourney } from "@/components/lab/DiscoveryArt";
import { LabNav } from "@/components/lab/LabNav";

export const metadata: Metadata = {
  title: "SpeakUp — Gapir, tushuntir, kashf qil",
  description:
    "Nomiga inglizcha o‘rgat, interaktiv laboratoriyada ko‘rsatmalaringni sinab ko‘r va speaking ko‘nikmalaringni rivojlantir.",
};

/**
 * Landing kontenti bazadan keladi, lekin ochiq bosh sahifa har tashrifda
 * Neon'ni urmasligi kerak — natija keshlanadi. Admin "Publish" qilganidan keyin
 * yangi modullar shu muddat ichida ko'rinadi (mashqlar sahifasi esa doim jonli).
 */
const cachedModules = unstable_cache(
  async () => {
    const { buildContentPack } = await import("@/lib/build-content");
    return (await buildContentPack()).modules;
  },
  ["landing-modules"],
  { revalidate: 600 },
);

/** Baza javob bermasa ham landing ochilishi shart — kontentli bo'limlar shunchaki yashiriladi. */
async function landingModules(): Promise<SpeakingModule[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    return await cachedModules();
  } catch {
    return [];
  }
}

export default async function Landing() {
  const [user, modules] = await Promise.all([getSession(), landingModules()]);

  const panelHref = user?.role === "admin" ? "/admin" : "/teacher";
  const exerciseCount = modules.reduce((n, m) => n + m.exercises.length, 0);
  const dialogCount = modules.reduce((n, m) => n + m.dialogs.length, 0);
  // Mnemonika bo'limi uchun jonli misol. Bosqichlari BOR birinchi mashq
  // olinadi: "Takrorlang" mashqlarida mnemonika yo'q, va ular ro'yxat boshiga
  // tushib qolsa bo'lim bo'sh akronim bilan chiqib qolardi.
  const sampleMnemonic = modules
    .flatMap((m) => m.exercises)
    .find((e) => e.mnemonic.steps.length > 0)?.mnemonic;

  return (
    <div className="lab-page">
      <LabNav panelHref={user ? panelHref : "/login"} panelLabel={user ? "Boshqaruv paneli" : "O‘qituvchi uchun"} />

      <main>
        <div className="lab-container">
          <section className="lab-hero">
            <div><span className="lab-eyebrow lab-hero-label"><span aria-hidden="true">✦</span> Ingliz tili. Bir oz boshqacharoq.</span><h1>Kichik robotga<br />o‘rgat.<br /><em>O‘zing ham o‘rgan.</em></h1><p>Bu safar o‘qituvchi — sen. Nomiga dunyoni tushuntir, gaplaring bilan xonani o‘zgartir va ingliz tilida dadilroq gapir.</p><div className="lab-hero-actions"><Link href="/student/lab/teach" className="lab-button">Nomi bilan boshlash <span aria-hidden="true">↗</span></Link><Link href="/student/lab/room" className="lab-button lab-button--outline">Laboratoriyani ko‘rish →</Link></div><div className="lab-hero-caption"><span>✓</span> Bepul mashqlar <span>·</span> Ovoz yoki matn <span>·</span> O‘z tezligingda</div></div>
            <DiscoveryArt />
          </section>
          <div className="lab-strip"><span><b>01</b> · Tushuntirib o‘rganish</span><span><b>02</b> · Ko‘rsatma berib sinash</span><span><b>03</b> · Mustaqil speaking mashqlari</span></div>
          <LabSection />
          <LearningJourney />
          {modules.length > 0 && <div className="lab-strip"><span><b>{modules.length}</b> nutq moduli</span><span><b>{exerciseCount}</b> mashq</span><span><b>{dialogCount}</b> suhbat ssenariysi</span><Link href="/student" className="lab-text-link">Barcha mashqlar →</Link></div>}
        </div>
        <Section title="Platforma nima beradi">
          <div className="grid border border-line sm:grid-cols-2 lg:grid-cols-4 lab-feature-grid">
            <Feature
              icon="mic"
              title="Nutqni baholash"
              text="Gapirganingiz matnga aylanadi. Ravonlik, so'z boyligi, kalit so'zlar va grammatika bo'yicha 100 ballik baho chiqadi."
            />
            <Feature
              icon="library"
              title="Mnemonik strukturalar"
              text="PETS, GREEN, OCEAN kabi harflar tizimi javobni tartibli qurishga o'rgatadi — bola nima deyishni bilmay qolmaydi."
            />
            <Feature
              icon="chart"
              title="Progress va nishonlar"
              text="Daraja, XP, kunlik seriya va nishonlar. Har mashqning eng yaxshi bali va urinishlar tarixi saqlanadi."
            />
            <Feature
              icon="smartphone"
              title="Internetsiz ishlaydi"
              text="Android ilovada nutq tanish telefonning o'zida bajariladi — internet ham, pullik xizmat ham kerak emas."
            />
          </div>
        </Section>

        <Section title="Qanday ishlaydi" muted>
          <div className="grid gap-4 sm:grid-cols-3">
            <Step
              n="01"
              title="Mavzuni tanlang"
              text="Modul va mashqni tanlaysiz. Savollar, tasvirlar va mnemonik struktura ekranda ko'rinadi, savollarni tinglash ham mumkin."
            />
            <Step
              n="02"
              title="Mikrofonga gapiring"
              text="Belgilangan vaqt ichida javob berasiz. Aytilgan kalit so'zlar jonli ravishda belgilanib boradi."
            />
            <Step
              n="03"
              title="Ball va tavsiya oling"
              text="Ko'rsatkichlar bo'yicha tahlil, transkript va nimani yaxshilash kerakligi. Natija o'qituvchiga ham ko'rinadi."
            />
          </div>
        </Section>

        {sampleMnemonic && <MnemonicSection mnemonic={sampleMnemonic} />}

        {modules.length > 0 && (
          <Section title="Nutq modullari" muted>
            <div className="divide-y divide-line border border-line bg-white lab-module-list">
              {modules.map((m, i) => (
                <ModuleRow key={m.id} index={i + 1} module={m} />
              ))}
            </div>
          </Section>
        )}

        <Section title="Kim uchun">
          <div className="grid gap-4 lg:grid-cols-3">
            <Audience
              icon="user"
              role="O'quvchi"
              text="Brauzerda darhol boshlaysiz — ro'yxatdan o'tish shart emas, faqat ism va sinf. Suhbat mashqlari Android ilovada."
              href="/student"
              cta="Mashqni boshlash"
              primary
            />
            {/* Kirgan xodimga yana "Kirish" taklif qilinmaydi — to'g'ridan-to'g'ri panel. */}
            <Audience
              icon="chart"
              role="O'qituvchi"
              text="Sinf bo'yicha urinishlar, o'rtacha ball va har bir o'quvchining o'sishi bitta boshqaruv sahifasida."
              href={user ? "/teacher" : "/login?next=/teacher"}
              cta={user ? "Progressni ochish" : "Kirish"}
            />
            <Audience
              icon="library"
              role="Admin"
              text="Modul, mashq va suhbatlarni tahrirlaysiz, media yuklaysiz va bir tugma bilan hammaga chiqarasiz."
              href={user?.role === "admin" ? "/admin" : "/login?next=/admin"}
              cta={user?.role === "admin" ? "Kontentni ochish" : "Kirish"}
            />
          </div>
        </Section>

        <section className="hero-navy hero-photo-book text-white lab-cta">
          <div className="mx-auto max-w-5xl px-4 py-14 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Birinchi mashqni hoziroq bajaring</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">
              Mikrofonli mashq Chrome, Edge va Safari brauzerlarida ishlaydi. Internetsiz
              mashq qilish va suhbat modullari uchun Android ilovasini yuklab oling.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/student" className="btn bg-white text-navy hover:bg-surface-muted">
                <Icon name="mic" size={17} />
                Mashqni boshlash
              </Link>
              <ApkHeroButton />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-white lab-footer">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-semibold tracking-[0.12em] text-ink">SPEAKUP</span> · Ingliz
            tili nutq ko&apos;nikmalari platformasi
          </p>
            <div className="flex flex-wrap gap-5">
            <Link href="/student/lab" className="hover:text-navy hover:underline">Laboratoriya</Link>
            <Link href="/student" className="hover:text-navy hover:underline">
              Mashqlar
            </Link>
            <Link href="/student/progress" className="hover:text-navy hover:underline">
              Natijalar
            </Link>
            <Link href="/maxfiylik" className="hover:text-navy hover:underline">
              Maxfiylik
            </Link>
            <Link href="/rasmlar" className="hover:text-navy hover:underline">
              Rasmlar
            </Link>
            <Link href={user ? panelHref : "/login"} className="hover:text-navy hover:underline">
              {user ? "Boshqaruv paneli" : "O'qituvchi / admin"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({
  title,
  muted,
  children,
}: {
  title: string;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`lab-section-block${muted ? " border-y border-line bg-surface-muted/40 lab-section-block--muted" : ""}`}>
      <div className="mx-auto max-w-5xl px-4 py-14">
        <p className="section-title">{title}</p>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

/** Hairline to'r: kartalar chegara chiziqlari bilan ajraladi, soyasiz. */
function Feature({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return (
    <div className="border-b border-line bg-white p-6 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 sm:odd:border-r lg:border-b-0 lg:border-r lg:last:border-r-0 lab-feature-tile">
      <Icon name={icon} size={22} className="text-navy" />
      <h3 className="mt-4 font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{text}</p>
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="card lab-step-card">
      <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-navy text-sm font-bold tracking-wider text-white lab-badge">
        {n}
      </span>
      <h3 className="mt-4 font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{text}</p>
    </div>
  );
}

function MnemonicSection({ mnemonic }: { mnemonic: Mnemonic }) {
  return (
    <Section title={`Mnemonika nima? Misol — ${mnemonic.acronym}`}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-10">
        <p className="text-sm leading-relaxed text-ink-muted">
          Mnemonika — javobning suyagi. Har harf o&apos;quvchiga keyin nima deyishni
          eslatadi, shuning uchun bola &laquo;bilaman, lekin aytolmayman&raquo; holatiga
          tushmaydi. Har mashqning o&apos;z strukturasi bor va u yozish paytida ham ko&apos;rinib
          turadi.
        </p>
        <div className="border border-line bg-white lab-mnemonic-card">
          {mnemonic.steps.map((s) => (
            <div key={s.letter} className="flex items-center gap-4 border-b border-line px-5 py-3.5 last:border-b-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-navy-container text-sm font-bold text-navy-deep lab-badge lab-badge--soft">
                {s.letter}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">{s.en}</span>
                <span className="block text-sm text-ink-muted">{s.uz}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/** Modullar soni toq bo'lishi mumkin — shuning uchun to'r emas, bir ustunli qator. */
function ModuleRow({ index, module }: { index: number; module: SpeakingModule }) {
  const parts = [
    module.exercises.length > 0 && `${module.exercises.length} ta mashq`,
    module.dialogs.length > 0 && `${module.dialogs.length} ta suhbat`,
    // Suhbat modullari web'da yo'q — bu cheklovni shu yerda ochiq aytamiz.
    module.exercises.length === 0 && "faqat Android ilovada",
  ].filter(Boolean);

  return (
    <div className="flex items-start gap-4 p-5 sm:gap-5 sm:p-6 lab-module-row">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-navy text-sm font-bold tracking-wider text-white lab-badge">
        {String(index).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <div className="sm:flex sm:items-baseline sm:gap-2">
          <h3 className="font-semibold text-ink">{module.titleUz}</h3>
          <p className="text-sm text-ink-muted">{module.titleEn}</p>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{module.descriptionUz}</p>
        <p className="mt-2.5 text-overline font-semibold uppercase text-ink-muted">
          {parts.join(" · ")}
        </p>
      </div>
    </div>
  );
}

function Audience({
  icon,
  role,
  text,
  href,
  cta,
  primary,
}: {
  icon: IconName;
  role: string;
  text: string;
  href: string;
  cta: string;
  primary?: boolean;
}) {
  return (
    <div className="card flex flex-col lab-audience-card">
      <div className="flex items-center gap-2.5 border-b border-line pb-4">
        <Icon name={icon} size={18} className="text-navy" />
        <h3 className="font-semibold text-ink">{role}</h3>
      </div>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-muted">{text}</p>
      <Link href={href} className={`mt-5 ${primary ? "btn-primary" : "btn-ghost"}`}>
        {cta}
        <Icon name="chevronRight" size={16} />
      </Link>
    </div>
  );
}
