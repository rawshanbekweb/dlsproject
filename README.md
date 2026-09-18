# SpeakUp (mnemonika)

**Yangi: SpeakUp Lab (web)** — Nomiga o‘rgatish va interaktiv xona laboratoriyasi qo‘shildi.
Ishga tushirish, demo va imkoniyat chegaralari: [web/LAB.md](web/LAB.md).

5–6-sinf o'quvchilari uchun ingliz tilida **gapirish (speaking)** ko'nikmasini rivojlantiruvchi platforma. O'quvchi mnemonik strukturalar (PETS, GREEN, OCEAN, ACTORS, QUEST, WORLD) va rasmlar yordamida gapiradi, ilova nutqni tanib olib ball va maslahat beradi.

Platforma ikki qismdan iborat:

- **Android ilovasi** — o'quvchi uchun asosiy tajriba. Nutqni tanish **qurilmaning o'zida, internetsiz** ishlaydi (Vosk).
- **Web (Next.js)** — landing sahifa, o'quvchi uchun brauzer versiyasi, admin paneli (kontent boshqaruvi) va o'qituvchi paneli (progress kuzatuvi) + butun backend API.

**Jonli:** <https://mnemonika.vercel.app> · APK: `/api/apk` orqali sayt ichida yuklab olinadi.

---

## Mundarija

- [Loyihaning asosiy cheklovi: $0 byudjet](#loyihaning-asosiy-cheklovi-0-byudjet)
- [Foydalanilgan texnologiyalar](#foydalanilgan-texnologiyalar)
- [Arxitektura](#arxitektura)
- [Repozitoriy tuzilishi](#repozitoriy-tuzilishi)
- [Ma'lumotlar bazasi](#malumotlar-bazasi)
- [API endpointlari](#api-endpointlari)
- [Kontent quvuri (generatorlar)](#kontent-quvuri-generatorlar)
- [Qurish va ishga tushirish](#qurish-va-ishga-tushirish)
- [Testlar](#testlar)
- [Maxfiylik va xavfsizlik](#maxfiylik-va-xavfsizlik)
- [Hozirgi holat va ma'lum kamchiliklar](#hozirgi-holat-va-malum-kamchiliklar)

---

## Loyihaning asosiy cheklovi: $0 byudjet

Loyihada **pullik bulut xizmati ishlatilmaydi**. Bu bitta qaror qolgan hamma texnik tanlovni belgilagan:

| Odatiy yechim | Bu loyihada | Sabab |
|---|---|---|
| Cloud ASR (Azure/Google Speech) | **Vosk** — qurilmada, offline | Pullik; ustiga bolalar ovozi tashqariga chiqmaydi |
| LLM bilan jonli suhbat | **Tarmoqlanuvchi suhbat daraxti** (offline) | 5 daqiqalik suhbat ≈ 12–15 so'rov; bepul kvota kuniga 20 |
| LLM bilan jonli baholash | **Qoidaga asoslangan tahlil** (`SpeechAnalyzer`, `Coach`) | Kvota + bolalar transkriptini yuborib bo'lmaydi |
| Pullik TTS | **Qurilma TTS'i** + oldindan yaratilgan audio kliplar | Klip bir marta yaratiladi, keyin bepul tarqatiladi |
| Upstash/Redis rate limit | **Xotiradagi qat'iy oyna** | Tashqi xizmatsiz |

**AI (Gemini) faqat kontent tayyorlash vaqtida, lokal skriptlarda ishlatiladi** — mashq vaqtida hech qachon. Ya'ni o'quvchi ma'lumoti hech qanday model provayderiga bormaydi va dars vaqtida kvota/internet kerak emas.

---

## Foydalanilgan texnologiyalar

### Android ilovasi

| Texnologiya | Versiya | Vazifasi |
|---|---|---|
| **Kotlin** | 2.1.10 | Asosiy til |
| **Jetpack Compose** | BOM 2025.01.00 | Butun UI (XML layout yo'q) |
| **Material 3** | Compose BOM ichida | Dizayn tizimi asosi |
| **Compose Navigation** | 2.8.6 | Ekranlar orasida navigatsiya |
| **AndroidX Lifecycle** (runtime-ktx, viewmodel-compose, runtime-compose) | 2.8.7 | ViewModel, lifecycle hodisalari |
| **Activity Compose** | 1.10.0 | `setContent`, ruxsat so'rash |
| **Kotlin Coroutines** | 1.9.0 | Asinxron ish, audio oqimi |
| **kotlinx.serialization** | 1.7.3 | Kontent JSON'ini o'qish |
| **Room** | 2.6.1 | Mahalliy progress bazasi (KSP bilan) |
| **KSP** | 2.1.10-1.0.29 | Room kod generatsiyasi |
| **Vosk Android** | 0.3.47 | **Offline nutqni tanish (ASR)** |
| **JNA** | 5.13.0 (`@aar`) | Vosk'ning native kutubxonasiga ko'prik |
| **Coil** | 2.7.0 | Kontentdagi rasm URL'larini yuklash |
| **Android TextToSpeech** | Platforma API | Savollarni ovoz bilan o'qish (`Speaker.kt`) |
| **AudioRecord + NoiseSuppressor + AutomaticGainControl** | Platforma API | O'z audio quvurimiz (Vosk `SpeechService` o'rniga) |
| **JUnit 4** | 4.13.2 | Sof mantiq testlari (24 ta) |
| **R8 + shrinkResources** | AGP 8.9.2 | Release'da kod/resurs qisqartirish (43.6 → 27.6 MB) |
| **Gradle** | 8.11.1 (wrapper) | Qurish tizimi, version catalog (`libs.versions.toml`) |

- `minSdk 24`, `targetSdk 36`, `compileSdk 36`, JVM target 17
- ABI: `arm64-v8a`, `armeabi-v7a`, `x86_64`
- **Tashqi rasm/ikon kutubxonasi yo'q** — personajlar (`Mascot.kt`) va fon naqshlari Canvas'da chiziladi, APK hajmini oshirmaydi

### Web va backend

| Texnologiya | Versiya | Vazifasi |
|---|---|---|
| **Next.js** (App Router) | 15.5 | Frontend + API routes (backend) |
| **React** | 19 | UI |
| **TypeScript** | 5.7 | Butun web kod |
| **Tailwind CSS** | 3.4 | Uslublar |
| **PostCSS + Autoprefixer** | 8.4 / 10.4 | CSS quvuri |
| **Neon (Serverless Postgres)** | `@neondatabase/serverless` 0.10 | Ma'lumotlar bazasi |
| **Drizzle ORM** | 0.38 | Sxema va so'rovlar (type-safe) |
| **Drizzle Kit** | 0.30 | `db:push`, `db:studio` |
| **jose** | 5.9 | JWT sessiya tokenlari |
| **bcryptjs** | 2.4 | Parol xeshlash |
| **Vercel Blob** | `@vercel/blob` 0.27 | APK, audio kliplar, rasmlar saqlash |
| **@google/genai** | 2.13 | Gemini — **faqat lokal generator skriptlarida** |
| **tsx** | 4.19 | Skriptlarni TypeScript'da ishga tushirish |
| **Web Speech API** | Brauzer | Web'da nutqni tanish + TTS (Chrome; Firefox'da yo'q) |

- Node **v24**, npm **11**
- Hosting: **Vercel** (root dir = `web`)
- **Ikon kutubxonasi yo'q** — `components/Icon.tsx` ichida 25 ta SVG

### Tashqi (bepul) xizmatlar

| Xizmat | Nima uchun | Qayerda |
|---|---|---|
| **Vosk model** `vosk-model-en-us-0.22-lgraph` (~130 MB) | Offline ASR modeli | `alphacephei.com` dan birinchi ochilishda yuklanadi |
| **LanguageTool API** | Grammatika tekshiruvi | Android'dan to'g'ridan-to'g'ri; web'da `/api/grammar` proxy (CORS) |
| **Wikimedia Commons API** | Mashq rasmlari (kalitsiz, bepul) | `npm run gen:images` |
| **Google Gemini** (bepul tarif) | Kontent/maslahat/audio generatsiyasi | Faqat lokal skriptlar, ishlab chiqarishda emas |

### Ishlab chiqish vositalari

Git · Android Studio JBR (OpenJDK 21) · Android SDK 36 + build-tools 36.1.0 · `apksigner` (imzo tekshiruvi) · PowerShell (yordamchi skriptlar, masalan `render-mascot.ps1` — qurilmasiz vizual tekshiruv)

---

## Arxitektura

```
┌──────────────────────────┐        ┌──────────────────────────────────┐
│   Android (Kotlin)       │        │   Web (Next.js @ Vercel)         │
│                          │        │                                  │
│  Compose UI              │        │  /              landing          │
│  ├ Home / Module         │        │  /student       o'quvchi (web)   │
│  ├ Exercise  ─┐          │        │  /admin         kontent CRUD     │
│  ├ Dialog     │ Vosk ASR │        │  /teacher       progress         │
│  └ Conversation          │        │  /rasmlar       litsenziyalar    │
│                          │        │  /maxfiylik     siyosat          │
│  analysis/               │        │                                  │
│  ├ SpeechAnalyzer (ball) │◄─port─►│  lib/speech-analyzer.ts          │
│  ├ Coach (maslahat)      │◄─port─►│  lib/coach.ts                    │
│  ├ KeywordMatcher        │◄─port─►│  lib/keyword-matcher.ts          │
│  ├ Gamification          │◄─port─►│  lib/gamification.ts             │
│  └ ConversationEngine    │        │                                  │
│                          │        │  /api/*  ───────┐                │
│  Room (mahalliy progress)│        └─────────────────┼────────────────┘
│  assets/modules.json ────┼── offline zaxira         │
└──────────┬───────────────┘                          ▼
           │  /api/content (sync)              ┌─────────────┐
           │  /api/attempts (natija)           │ Neon        │
           └──────────────────────────────────►│ Postgres    │
                                               └─────────────┘
                                               ┌─────────────┐
                                               │ Vercel Blob │ APK, audio, rasm
                                               └─────────────┘
```

### Muhim arxitektura qarorlari

1. **Offline-first.** Kontent APK ichida (`assets/content/modules.json`) bundled holda keladi; ilova ochilganda `/api/content?since=<versiya>` bilan yangilanishni tekshiradi. Internet yo'q bo'lsa hech narsa buzilmaydi.
2. **Aynan portlar.** `SpeechAnalyzer` / `Coach` / `KeywordMatcher` / `Gamification` / `ReadAloud` / `Mascot` — Kotlin va TypeScript'da bir xil mantiq. **Ular doim birga o'zgartiriladi**, aks holda ikkala platformadagi ball mos kelmay qoladi. (Kotlin `Int` bo'linishi butun sonli bo'lgani uchun TS tomonda hamma joyda `Math.floor`.)
3. **Progress mahalliy hisoblanadi** — Android'da Room'dan, web'da localStorage'dan. Serverdan o'qilmaydi, chunki bu autentifikatsiyasiz endpoint talab qilardi va bolaning ballari/transkriptlarini ID'ni bilgan har kimga ochardi.
4. **AI faqat build vaqtida** — yuqoridagi jadvalga qarang.
5. **Dizayn ataylab ikki xil**: Android bolalarcha (yorqin ranglar, personajlar, animatsiya), web paneli akademik (to'q ko'k/oltin, gradientsiz) — panellar kattalar uchun.

---

## Repozitoriy tuzilishi

```
mproject/
├── app/                              # Android ilovasi
│   ├── src/main/java/uz/speakingapp/
│   │   ├── analysis/                 # Ball, murabbiy, suhbat dvigateli, gamifikatsiya
│   │   ├── data/                     # ContentRepository, AttemptUploader, ProfileStore
│   │   │   ├── db/                   # Room (entity, DAO, migratsiya)
│   │   │   └── model/                # Kontent modellari (kotlinx.serialization)
│   │   ├── speech/                   # Vosk, model yuklash, TTS, audio klip keshi
│   │   └── ui/                       # Compose ekranlari + theme/ (Brand, Mascot, Motion)
│   ├── src/main/assets/content/      # Offline zaxira kontent (modules.json)
│   ├── src/test/                     # JUnit testlari
│   ├── build.gradle.kts              # Versiya tarixi izohlarda
│   └── proguard-rules.pro            # Vosk/JNA keep qoidalari (R8 uchun SHART)
│
├── web/                              # Next.js — frontend + backend
│   ├── src/app/                      # App Router sahifalari va /api marshrutlari
│   ├── src/components/               # Sidebar, Icon, Mascot, Visual…
│   ├── src/db/                       # Drizzle sxema, seed, create-admin
│   ├── src/lib/                      # Portlar, auth, kontent yig'ish, rate limit
│   ├── scripts/                      # Generatorlar va testlar
│   └── public/hero/                  # Fon fotosuratlari + CREDITS.md
│
├── gradle/libs.versions.toml         # Android bog'liqliklari (version catalog)
├── keystore/                         # Release imzo kaliti (git-ignored)
├── local.properties(.example)        # SDK yo'li, API_BASE_URL, imzo parollari
└── LOYIHA-REJA.md                    # To'liq roadmap
```

---

## Ma'lumotlar bazasi

Neon Postgres, Drizzle ORM (`web/src/db/schema.ts`) — **14 jadval**:

| Jadval | Vazifasi |
|---|---|
| `modules` | 6 modul (munozara, rolli o'yin, hikoya, intervyu, rasmli hikoya, erkin suhbat) |
| `exercises` | Mashqlar: savollar, mnemonika, kalit so'zlar, vaqt, tasvirlar |
| `dialogs` / `dialog_turns` | Skript bo'yicha dialoglar va ularning navbatlari |
| `conversations` / `conversation_nodes` | Erkin suhbat daraxtlari (tarmoqlanuvchi) |
| `audio_clips` | Yaratilgan talaffuz audiosi (**matn xeshi** bo'yicha, ID bo'yicha emas) |
| `visual_images` | Wikimedia Commons rasmlari + muallif/litsenziya |
| `exercise_tips` | Mashqqa xos murabbiy maslahatlari (mnemonika bosqichi bo'yicha) |
| `media` | Admin yuklagan fayllar |
| `app_meta` | Kontent versiyasi (publish shu yerni oshiradi) |
| `users` | Admin / o'qituvchi (bcrypt parol) |
| `students` | O'quvchi (qurilma ID, ism, sinf) |
| `attempts` | Har urinish: ball, ko'rsatkichlar, transkript |

> **Diqqat:** loyihada migratsiya tarixi yo'q. Yangi jadval `add-*-table.ts` skriptlari orqali `CREATE TABLE IF NOT EXISTS` bilan qo'shiladi. `drizzle-kit generate` mavjud jadvallar uchun ham "boshlang'ich" migratsiya yasab chalg'itadi — **ishlatmang**.

---

## API endpointlari

### Ochiq
| Endpoint | Izoh |
|---|---|
| `GET /api/content?since=<v>` | Butun kontent paketi; versiya yangi bo'lmasa `{upToDate:true}` |
| `GET /api/content/version` | Faqat joriy versiya |
| `GET /api/apk` | Blob'dagi eng yangi APK (yangi APK yuklaganda redeploy kerak emas) |
| `POST /api/grammar` | LanguageTool proxy (60/soat) |
| `POST /api/student/attempts` | Web o'quvchi natijasi — **tokensiz**, faqat `web_` ID (120/soat) |
| `POST /api/attempts` | Android natijasi, `x-ingest-token` bilan (300/soat) |

### Autentifikatsiya bilan
| Endpoint | Rol |
|---|---|
| `POST /api/auth/login` · `/logout` | 10/10daq IP + 10/30daq email |
| `/api/admin/{modules,exercises,dialogs,media,full}` | admin (CRUD) |
| `POST /api/admin/publish` | admin — kontent versiyasini oshiradi |
| `GET /api/teacher/progress?class=&days=` | teacher — filtrlar **SQL darajasida** |
| `GET /api/teacher/student/[id]` | teacher — bitta o'quvchi tafsiloti |

---

## Kontent quvuri (generatorlar)

Barchasi `web/` ichida, `npm run …` bilan. **Skriptlar lokal ishlaydi — Vercel'da bu kalitlar kerak emas.**

| Buyruq | Nima qiladi | Kvota |
|---|---|---|
| `gen:content` | Yangi mashq/dialog matnlari (reja `content-plan.ts` da qat'iy) | Gemini ~20/kun |
| `gen:conversation` | Erkin suhbat daraxti (shakl skeletda qat'iy) | Gemini ~20/kun |
| `gen:tips` | Mashqqa xos murabbiy maslahatlari | Gemini ~20/kun |
| `gen:audio` | Talaffuz namunasi (TTS → WAV → Blob) | Gemini TTS ~10/kun |
| `gen:images` | Wikimedia Commons rasmlari | **Cheksiz** (bepul) |
| `seed:readaloud` | Talaffuz mashqlari — **qo'lda yozilgan, modelsiz** | Yo'q |
| `seed:conversations` | Daraxtni bazaga yozadi (validatsiya bilan) | Yo'q |
| `publish:content` | Kontent versiyasini oshiradi | Yo'q |
| `export:content` | Bazani APK ichidagi `modules.json` ga eksport qiladi | Yo'q |
| `upload:apk` | Release APK'ni Blob'ga yuklaydi (eng yangi 3 tasi qoladi) | Yo'q |

**Tartib muhim:** generatsiya → `publish:content` → `export:content` → APK'ni qayta yig'ish → `upload:apk`. `publish` qilinmasa bola keshdagi eski kontentni ko'raveradi; `export` qilinmasa internetsiz o'rnatgan bola eski kontentni ko'radi.

**Generatorlarning umumiy tamoyili:** *tuzilma kodda qat'iy, model faqat MATN yozadi.* Daraxt havolalari, mnemonika akronimlari, mashq ID'lari model javobidan olinmaydi — shuning uchun model qanday javob bersa ham graf/struktura buzilmaydi.

---

## Qurish va ishga tushirish

### Talablar
- JDK 17+ (Android Studio JBR mos keladi), Android SDK 36
- Node 20+ (sinalgani: v24)

### Web

```bash
cd web
npm install
cp .env.example .env      # yoki qo'lda yarating
npm run dev               # http://localhost:3000
```

`.env` (git-ignored) uchun kerakli kalitlar: `DATABASE_URL` (Neon), `AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`, `ATTEMPTS_INGEST_TOKEN`, `GEMINI_API_KEY` (faqat generatorlar uchun).

```bash
npm run db:push          # sxemani Neon'ga yozish
npm run seed             # boshlang'ich kontent
npm run create-admin     # admin foydalanuvchi
```

> `npm run build` ni `npm run dev` ishlab turganda ishga tushirmang — ikkalasi bitta `.next` papkasidan foydalanadi va dev serveri buzuq sahifa bera boshlaydi.

### Android

`JAVA_HOME` PATH'da bo'lmasligi mumkin, shuning uchun har build oldidan:

```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
.\gradlew.bat assembleDebug      # app/build/outputs/apk/debug/
.\gradlew.bat assembleRelease    # ~3 daqiqa (R8), 27.6 MB
```

`local.properties` (git-ignored) ga qo'shing:

```properties
sdk.dir=C:\\Users\\<user>\\AppData\\Local\\Android\\Sdk
API_BASE_URL=https://mnemonika.vercel.app
ATTEMPTS_TOKEN=<ATTEMPTS_INGEST_TOKEN bilan bir xil>
RELEASE_STORE_FILE=keystore/speakup-release.jks
RELEASE_STORE_PASSWORD=…
RELEASE_KEY_ALIAS=speakup
RELEASE_KEY_PASSWORD=…
```

`API_BASE_URL` bo'sh bo'lsa ilova faqat bundled kontentdan ishlaydi (online sync o'chiq). Imzo kaliti topilmasa build yiqilmaydi — imzosiz APK beradi va ogohlantirish yozadi.

> **Imzo kaliti va parollari zaxiralanmasa, loyihaga boshqa hech qachon yangilanish chiqarib bo'lmaydi.**
> Imzoni tekshirish: `<SDK>\build-tools\36.1.0\apksigner.bat verify --verbose <apk>` (v2+v3 kutiladi).

---

## Testlar

```bash
cd web && npm test               # 8 to'plam, tsx orqali
.\gradlew.bat testDebugUnitTest  # 24 ta JUnit testi
npx tsc --noEmit                 # tiplarni tekshirish
```

| To'plam | Nimani qo'riqlaydi |
|---|---|
| `test:matcher` | Kalit so'z solishtirish — "house"≠"horse", "dog"→"dock" ASR xatosi |
| `test:coach` | Murabbiy maslahatlari va maslahat banki |
| `test:gamification` | XP, daraja, seriya, nishonlar |
| `test:readaloud` | Talaffuz mashqi baholash |
| `test:nextpath` | Ochiq redirect himoyasi (`//evil.com` va h.k.) |
| `test:plan` | Kontent rejasi mnemonika nomlariga mos |
| `test:tree` | Suhbat daraxti: yetim havola, chiqish yo'li, erishiluvchanlik |
| `test:ratelimit` | Rate limit oynasi va `Retry-After` |
| Android JUnit | `ConversationEngine`, `ConversationCoach` |

---

## Maxfiylik va xavfsizlik

- **Ovoz fayl sifatida saqlanmaydi** — hech qayerda.
- Android'da nutqni tanish **qurilmaning o'zida** (Vosk) — audio tashqariga chiqmaydi.
- Web'da **Web Speech API tovushni brauzer ishlab chiqaruvchisiga (Google) yuboradi** — bu bizning nazoratimizdan tashqarida va `/maxfiylik` sahifasida ochiq yozilgan.
- LanguageTool'ga faqat transkript **matni** boradi (identifikatorsiz).
- `allowBackup="false"` + `fullBackupContent="false"` + `data_extraction_rules.xml` — transkript Google Drive'ga tushmaydi (Android 12+ da qurilmadan qurilmaga ko'chirish uchun ikkalasi ham kerak).
- Rate limit hamma ochiq endpointlarda (xotirada, tashqi xizmatsiz). **Halol cheklov:** Vercel'da har lambda nusxasi o'z xotirasiga ega, ya'ni amaldagi chegara "nusxa soni × limit" bo'lishi mumkin — bu kafolat emas, suiiste'molni qimmatlashtirish.
- Maxfiylik siyosati: `/maxfiylik` (Play Families uchun shart). **Kod bilan mos turishi shart** — analitika yoki crash reporting qo'shilsa ro'yxat yangilanadi.
- Sirlar `local.properties` va `web/.env` da, ikkalasi ham git-ignored.

---

## Hozirgi holat va ma'lum kamchiliklar

**Versiyalar:** APK **0.2.0** (versionCode 11) · kontent versiyasi **11** · APK hajmi 27.6 MB (imzo v2+v3)

**Kontent:** 6 modul · 40 mashq (shundan 19 talaffuz) · 13 dialog · 6 erkin suhbat (123 tugun) · 169 tasvirdan 124 tasi haqiqiy foto

### Ochiq kamchiliklar

1. **Qurilmada sinalmagan — eng katta xavf.** Audio quvuri, 130 MB model yuklash, Room v1→v2 migratsiyasi, pauza mexanizmi va R8 dan keyingi Vosk/JNA faqat kompilyatsiya darajasida tekshirilgan. Bular kompilyatsiyada bilinmaydigan, faqat real telefonda chiqadigan turdagi xatolar.
2. **`/api/content` sovuq startda ~90 soniya** (keyin ~1.7s), `ContentRepository` timeout'i esa 12s — kun davomida birinchi ochgan foydalanuvchining sync'i uziladi. Bundled `modules.json` versiyasi 10, jonli baza 11.
3. **Audio qamrovi 43%** (77 slotdan 33). Talaffuz mashqlarining 19 tasidan 9 tasida namuna audio bor; qolgani qurilma TTS'iga qaytadi.
4. **Maslahat banki 40 mashqdan 6 tasida** — qolganida murabbiy umumiy matn beradi.
5. CI yo'q · crash reporting yo'q · o'qituvchi↔sinf bog'lanishi yo'q (har o'qituvchi hamma o'quvchining transkriptini ko'radi).
6. Mikrofon ruxsati butunlay rad etilsa mashq ekrani boshi berk ko'chaga aylanadi.

### Muhim tuzoqlar (kod bilan ishlashdan oldin o'qing)

- **Port juftliklarini doim birga o'zgartiring:** `SpeechAnalyzer.kt` ↔ `speech-analyzer.ts`, `Coach.kt` ↔ `coach.ts`, `KeywordMatcher.kt` ↔ `keyword-matcher.ts`, `Gamification.kt` ↔ `gamification.ts`, `Mascot.kt` ↔ `Mascot.tsx`, `Visual.kt` ↔ `Visual.tsx`.
- **Vosk `Recognizer` va `AudioRecord` faqat "vosk-audio" oqimida yaratiladi, o'qiladi va yopiladi.** Bular native obyektlar, oqim-xavfsiz emas — main oqimidan yopish SIGSEGV beradi va `try/catch` uni ushlamaydi.
- **R8 uchun `proguard-rules.pro` dagi Vosk/JNA `-keep` qoidalari shart.** Ularsiz kompilyatsiya o'tadi, ilova ishga tushganda yiqiladi.
- **Wikimedia Commons rasmlarini avtomatik tanlovga ishonib bo'lmaydi** — odamni tavsiflab qidirmang (harakatni nomlang), natijani albatta ko'zdan kechiring.
- **`.table-report thead th` `globals.css` da utilities'dan keyin turadi** — `text-right` ishlamaydi, `!text-right` kerak.
- **CSV eksportida ajratgich nuqtali vergul va BOM shart** — aks holda Excel o'zbek lokalida ustunlarni buzadi.

---

## Litsenziya va atributlar

- Rasm mualliflari va litsenziyalari: **`/rasmlar`** sahifasi (CC-BY atributni foydalanuvchi ko'radigan joyda talab qiladi).
- Fon fotosuratlari: `web/public/hero/CREDITS.md`.
- Vosk modeli: [Alpha Cephei](https://alphacephei.com/vosk/models) (Apache 2.0).
