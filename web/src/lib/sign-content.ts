// Imo-ishora mashqi lug'ati — `lab-content.ts` bilan bir xil naqsh: kod
// ichidagi statik ro'yxat, baza YO'Q (Lab bo'limi umuman DB'ga tegmaydi).
//
// `landmarks` (referens qo'l harakati) bu yerda TO'LDIRILMAGAN — buni hech kim
// (jumladan bu kodni yozgan AI ham) o'zi "o'ylab topa olmaydi": bu haqiqiy
// odam tomonidan ko'rsatilgan imo-ishoraning yozib olingan raqamli nusxasi.
// Uni `/admin/signs` orqali o'zingiz yozib olasiz, keyin o'sha sahifadagi
// "Export" tugmasi pastdagi `signReferences`ni TO'LIQ ALMASHTIRADIGAN tayyor
// kodni beradi (o'sha vaqtgacha yozib olingan hammasi bir joyda) — shuni
// nusxalab, quyidagi bo'sh massiv o'rniga qo'ying.

import type { SignSequence } from "./hand-landmarks";

export type SignWord = {
  id: string;
  labelUz: string;
  labelEn: string;
  category: string;
};

/**
 * Boshlang'ich lug'at — ~20 ta. Kattaroq (masalan 50 ta) emas: birinchi
 * navbatda quvurni sinash uchun kichik va sinf hayotiga yaqin so'zlar
 * tanlandi (LOYIHA-REJA.md 6-bo'limdagi sinf buyruqlari/salomlashuvga mos).
 * Yangi so'z qo'shish — shu ro'yxatga bitta qator qo'shish, boshqa hech narsa.
 */
export const signWords: SignWord[] = [
  { id: "hello", labelUz: "Salom", labelEn: "Hello", category: "Salomlashuv" },
  { id: "goodbye", labelUz: "Xayr", labelEn: "Goodbye", category: "Salomlashuv" },
  { id: "please", labelUz: "Iltimos", labelEn: "Please", category: "Salomlashuv" },
  { id: "thank-you", labelUz: "Rahmat", labelEn: "Thank you", category: "Salomlashuv" },
  { id: "sorry", labelUz: "Kechirasiz", labelEn: "Sorry", category: "Salomlashuv" },
  { id: "yes", labelUz: "Ha", labelEn: "Yes", category: "Javob" },
  { id: "no", labelUz: "Yo'q", labelEn: "No", category: "Javob" },
  { id: "help", labelUz: "Yordam", labelEn: "Help", category: "Sinf" },
  { id: "stop", labelUz: "To'xta", labelEn: "Stop", category: "Sinf" },
  { id: "wait", labelUz: "Kut", labelEn: "Wait", category: "Sinf" },
  { id: "again", labelUz: "Yana", labelEn: "Again", category: "Sinf" },
  { id: "good", labelUz: "Yaxshi", labelEn: "Good", category: "Baho" },
  { id: "bad", labelUz: "Yomon", labelEn: "Bad", category: "Baho" },
  { id: "friend", labelUz: "Do'st", labelEn: "Friend", category: "Odamlar" },
  { id: "teacher", labelUz: "O'qituvchi", labelEn: "Teacher", category: "Odamlar" },
  { id: "book", labelUz: "Kitob", labelEn: "Book", category: "Buyumlar" },
  { id: "water", labelUz: "Suv", labelEn: "Water", category: "Buyumlar" },
  { id: "eat", labelUz: "Ovqatlanish", labelEn: "Eat", category: "Harakat" },
  { id: "drink", labelUz: "Ichish", labelEn: "Drink", category: "Harakat" },
  { id: "love", labelUz: "Sevaman", labelEn: "Love", category: "His" },
];

export type SignReference = {
  wordId: string;
  landmarks: SignSequence;
  /** Bir nechta urinishdan qaysi biri saqlanganini bilish uchun — audit izi, ekranda ko'rsatilmaydi. */
  recordedAt: string;
};

/**
 * TO'LDIRILISHI KERAK. Bo'sh boshlanadi — `/admin/signs`da yozib olib,
 * "Export" orqali chiqqan massivni shu yerga joylashtiring.
 */
export const signReferences: SignReference[] = [];
