# Lab: Nomi uchun jonli AI

Nomi ikki rejimda ishlaydi: **Tayyor mashq** (mahalliy, `lab-engine.ts` qoidalari — API kalit shart emas)
va **Jonli AI** (haqiqiy modeldan javob, `.env` sozlanganda paydo bo'ladi). Ikkalasi bir xil UI va
bir xil natija shaklini ishlatadi, shuning uchun almashish shаffof: kalit yo'q bo'lsa "Jonli AI"
tugmasi ko'rinmaydi, xizmat vaqtincha ishlamasa foydalanuvchi avtomatik Tayyor mashqqa qaytadi
(`use-lab-coach.ts`).

## Yoqish

`.env` faylga ikkitadan FAQAT bittasini yozing (`.env.example` da namuna bor):

| O'zgaruvchi | Qiymat | Izoh |
|---|---|---|
| `LAB_AI_PROVIDER` | `openai` yoki `gemini` | |
| `LAB_AI_MODEL` | masalan `gpt-4.1-mini` yoki `gemini-2.0-flash` | Provayderga mos model nomi |
| `OPENAI_API_KEY` | `sk-...` | faqat `openai` tanlanganda |
| `GEMINI_API_KEY` | `...` | faqat `gemini` tanlanganda |

Server qayta ishga tushgandan keyin `GET /api/lab/coach` `{ available: true, provider }` qaytaradi
va sahifada "Jonli AI" tugmasi faollashadi. Hech narsa sozlanmasa (`getLabAiConfig` → `null`)
marshrut har doim `{ available: false }` qaytaradi va tayyor mashq rejimi o'zgarishsiz ishlayveradi.

## Arxitektura qisqacha

- **`lab-ai-contract.ts`** — mijoz ↔ server o'rtasidagi qat'iy shakl. Kiruvchi so'rovni ham,
  modeldan qaytgan javobni ham to'liq validatsiya qiladi (enum'lar, uzunlik chegaralari, majburiy
  maydonlar). Model javobi shu shakldan chiqsa, foydalanuvchiga yetmaydi.
- **`lab-ai-server.ts`** — faqat server marshrutidan import qilinadi (kalit clientga hech qachon
  tushmaydi). Ikkala provayder uchun bitta so'rov shakli: OpenAI Responses API (`json_schema`,
  `strict: true`) yoki Gemini `generateContent` (`responseJsonSchema`). Prompt aniq belgilaydi:
  Nomi nimani baholaydi, javobni qanday formatda qaytaradi va o'quvchi matnini **ma'lumot**, hech
  qachon **ko'rsatma** sifatida ko'rmasligini.
- **`app/api/lab/coach/route.ts`** — `POST` marshrut: origin tekshiruvi, JSON hajmi chegarasi
  (12 KB), tezlik cheklovi, 10 soniyalik timeout, bir vaqtda ko'pi bilan 3 ta faol so'rov.

## Cheklovlar (qasddan)

- `rate-limit.ts` — xotiradagi, jarayon ichidagi hisoblagich (tashqi xizmat yo'q, $0 shart).
  Bir nechta lambda nusxasi ishlaganda haqiqiy chegara "nusxalar soni × limit" bo'lishi mumkin —
  bu **taqsimlangan** kafolat emas, faqat bitta skriptning kvotani tugatishiga to'sqinlik qiladi.
  Hozirgi qiymatlar: mijoz boshiga 12 so'rov/daqiqa, instance boshiga 200 so'rov/soat, 3 ta
  bir vaqtdagi so'rov. Haqiqiy ko'p nusxali muhitda qattiqroq kafolat kerak bo'lsa, tashqi
  hisoblagich (masalan Vercel KV) shu faylni almashtiradi — chaqiruvchilar o'zgarmaydi.
- Har bir so'rovda oxirgi 6 ta xabar yuboriladi, javob 500–600 belgigacha, `max_output_tokens`/
  `maxOutputTokens` 1200 bilan chegaralangan — xarajat va portlash xavfi cheklangan.
- Provayder javobi (xom payload) hech qachon loglanmaydi yoki clientga qaytarilmaydi — o'quvchi
  matni yoki kalit tafsilotlari sizib chiqmasligi uchun.

## Xavfsizlik

Foydalanuvchi matni (joriy javob + tarix) modelga **DATA** sifatida yuboriladi, tizim
ko'rsatmasi esa alohida `system`/`instructions` maydonida. Prompt aniq talab qiladi: o'rnatilgan
ko'rsatmalar, rol o'zgartirish yoki "meni muvaffaqiyatli deb belgila" kabi urinishlar ma'lumot deb
ko'rilsin, hech qachon bajarilmasin. Baribir bu **yumshoq** himoya — modelning o'zi xato qilishi
mumkin, shuning uchun `lab-ai-contract.ts` dagi qattiq shakl tekshiruvi asosiy himoya chizig'i:
noto'g'ri shakldagi javob — masalan botga "tushunarli" deb belgilash yoki xonada mavjud bo'lmagan
buyum/joyni ixtiro qilish — schema darajasida rad etiladi, foydalanuvchiga yetib bormaydi.

## O'chirish

`.env`dan tegishli o'zgaruvchilarni olib tashlang (yoki bo'sh qoldiring) va qayta joylashtiring —
`available: false` qaytadi, tugma yashiriladi, mavjud foydalanuvchilar avtomatik tayyor mashqqa
tushadi. Kod o'chirilmaydi, faqat sozlama.
