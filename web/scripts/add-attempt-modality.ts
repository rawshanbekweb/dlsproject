// Yozma javob rejimi uchun `attempts.modality` ustunini qo'shadi.
//
// Ishga tushirish (web/ papkasidan):  npx tsx scripts/add-attempt-modality.ts
//
// Xavfsizligi: ustun QO'SHILADI, hech narsa o'chirilmaydi. `IF NOT EXISTS`
// tufayli qayta ishga tushirsa ham zarar yo'q. Mavjud qatorlar standart
// "speech" qiymatini oladi — ular allaqachon ovoz orqali bajarilgan.
//
// MUHIM: bu migratsiya kod deploy qilinishidan OLDIN bajarilishi shart —
// `/api/student/attempts` endi shu ustunga yozadi.

import "../src/db/load-env";
import { sql } from "drizzle-orm";
import { db } from "../src/db";

async function main() {
  console.log("Ustun qo'shilmoqda: attempts.modality …");
  await db.execute(
    sql`ALTER TABLE attempts ADD COLUMN IF NOT EXISTS modality text NOT NULL DEFAULT 'speech'`,
  );

  const check = await db.execute(
    sql`SELECT column_name, data_type, column_default
        FROM information_schema.columns
        WHERE table_name = 'attempts' AND column_name = 'modality'`,
  );
  console.log("Natija:", check.rows);
  console.log("Tayyor. Endi kodni deploy qilish mumkin.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
