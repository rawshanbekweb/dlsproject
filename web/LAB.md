# SpeakUp Lab

Yangi web tajribasi: yorug‘ laboratoriya dizayni va Nomi robot.

## Ishga tushirish

```powershell
cd web
npm.cmd install
npm.cmd run dev
```

- `/` — yangilangan bosh sahifa; eski mashqlar va o‘qituvchi paneliga havolalar saqlangan.
- `/student/lab` — ikki tajriba va mahalliy kashfiyot daftari.
- `/student/lab/teach` — qushlar, kitlar, o‘simliklar haqida uchta mavzu. Har birida fikrni tuzatish, dalil/misol va yangi vaziyatda qo‘llash bosqichi bor.
- `/student/lab/room` — xona buyumlariga ko‘rsatma berish, aniqlashtirish va uchta vazifa.

Laboratoriya sahifalari standart holatda `.env`, baza yoki model API kaliti kerak emas — "Tayyor
mashq" rejimi mahalliy qoidalar bilan ishlaydi. Ixtiyoriy jonli AI (OpenAI yoki Gemini) sozlansa,
"Jonli AI" tugmasi qo‘shimcha rejim sifatida paydo bo‘ladi; qanday yoqishni `AI.md` da ko‘ring.
Eski kontent, autentifikatsiya, o‘qituvchi/admin panellari avvalgidek backend sozlamalarini talab qiladi.

## Demo

1. Bosh sahifadan **Nomi bilan boshlash** ni bosing.
2. `All birds can fly` deb yozing: Nomi qayta tushuntirishni so‘raydi.
3. `Not all birds can fly.` → `A penguin cannot fly.` → `An ostrich cannot fly, but it can run.`
4. Xona mashqida `Put the chair to the left of the table` deb yozing: Nomi qaysi stul ekanini so‘raydi.
5. `The red one` deb aniqlashtiring: stul siljiydi va vazifa bajariladi.
6. Kashfiyotlar sahifasida bajarilgan mavzu va vazifalar ko‘rinadi, sahifa yangilanganda saqlanadi.

## Hozirgi imkoniyat chegarasi

- Standart holatda Nomi **mahalliy, oldindan yozilgan ssenariylar va qoidalar** bilan ishlaydi (`lab-engine.ts`, cheklangan inglizcha ifodalar; notanish ifodaga aniqlashtirish so‘raydi — umumiy ilmiy yoki grammatik baholash tizimi emas). `.env`da provayder sozlansa (`AI.md`), o‘quvchi "Jonli AI" rejimini tanlab, xuddi shu vazifalarni haqiqiy model orqali sinab ko‘rishi mumkin; xizmat vaqtincha ishlamasa, tizim shu qatorda tavsiflangan tayyor rejimga avtomatik qaytadi.
- Xona bir paytda bitta buyum/joy ko‘rsatmasini qabul qiladi. Lug‘at ekranda beriladi. Noaniq buyum joyidan siljimaydi; ko‘rsatma to‘liq bo‘lganda siljiydi. Aniq, ammo maqsadga mos kelmagan ko‘rsatma ham vizual bajariladi, vazifa esa yakunlanmaydi.
- Ovozli kiritish mavjud Web Speech API orqali; internet va mos brauzer kerak. Tahrirlash mumkin bo‘lgan matnli kiritish har doim mavjud. Robot gaplarini brauzer TTS orqali tinglash mumkin.
- Natijalar `speakup_lab_progress_v1` kaliti ostida shu brauzerda saqlanadi. Nutq matni laboratoriya tomonidan server yoki LLM’ga yuborilmaydi; ovozli kiritish brauzer provayderining xizmatidan foydalanishi mumkin. Bu natijalar hozircha o‘qituvchi paneliga yuborilmaydi va eski speaking ballari/XP bilan aralashtirilmaydi.
- Android uchun yangi mashqlar hali ko‘chirilmagan. Mavjud Kotlin/TypeScript baholash juftliklari o‘zgartirilmadi.

## Tekshiruv

```powershell
npm.cmd test
npx.cmd tsc --noEmit
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

Windows’da o‘rnatilgan Edge’dan foydalanish:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm.cmd run test:e2e
```

Playwright 3100-portda dev serverni o‘zi ochadi. Testlar o‘z brauzer profilidan foydalanadi; foydalanuvchining profiliga yoki production ma’lumotiga tegmaydi. Desktop/mobil skrinshotlar `test-results/` ichida.

## Keyingi rivojlantirish nuqtalari

- `lab-content.ts`: yangi mavzular, ko‘rsatmalar va maqsadlar.
- `lab-engine.ts`: mavzuga xos javob tekshiruvi va xona buyruqlari. Har bir qo‘shimcha qoidaga noto‘g‘ri javoblarni ham tekshiradigan test kerak.
- `lab-progress.ts`: laboratoriya natijalari. Keyingi server integratsiyasida natija turini speaking ballidan alohida saqlash kerak.
- `components/lab/` va `app/lab.css`: Nomi, xona, suhbat va yorug‘ dizayn.
