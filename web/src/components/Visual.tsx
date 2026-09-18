"use client";

import { useState } from "react";

/**
 * Mashqning vizual ishorasi — Android'dagi VisualTile bilan bir xil mantiq.
 * IKKALASI DOIM BIRGA O'ZGARTIRILADI (loyihadagi mavjud qoida: SpeechAnalyzer,
 * Coach, Mascot juftliklari kabi).
 *
 * `token` — emoji (yoki eski kontentda to'g'ridan-to'g'ri rasm URL'i).
 * `imageUrl` — `visualImages` dan kelgan fotosurat; bo'sh bo'lishi mumkin.
 *
 * ZAXIRA SHART: tasvir BEZAK emas, mashqning mazmuni — bola aynan shu narsa
 * haqida gapiradi. Rasm yuklanmasa (internet yo'q, URL o'chgan) bola bo'sh
 * kvadrat emas, emojini ko'rishi kerak. Shuning uchun `onError` da emojiga
 * qaytamiz.
 */
export function Visual({
  token,
  imageUrl = "",
  size = 88,
}: {
  token: string;
  imageUrl?: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  // Eski kontentda URL to'g'ridan-to'g'ri `visuals` ichida bo'lishi mumkin.
  const tokenIsUrl = token.startsWith("http://") || token.startsWith("https://");
  const src = imageUrl || (tokenIsUrl ? token : "");
  const showImage = Boolean(src) && !failed;

  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded border border-line bg-surface-muted"
      style={{ width: size, height: size }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          // Rasm mazmun (bola shu haqida gapiradi), bezak emas — shuning
          // uchun `alt=""` YARAMAYDI: ko'r o'quvchi ekran o'qigichda
          // mashqning O'ZINI eshitmay qoladi. Alohida matnli tavsif hali
          // yo'q, shuning uchun emoji-token ishlatiladi — ko'p ekran
          // o'qigichlar (VoiceOver/NVDA/JAWS) emojini so'z bilan o'qiydi.
          alt={tokenIsUrl ? "" : token}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span style={{ fontSize: size * 0.42, lineHeight: 1 }}>
          {tokenIsUrl ? "🖼️" : token}
        </span>
      )}
    </span>
  );
}
