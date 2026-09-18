import type { Metadata } from "next";
import "./globals.css";
import "./lab.css";
import "./studio.css";

export const metadata: Metadata = {
  title: "SpeakUp — Boshqaruv paneli",
  description: "SpeakUp kontent va o'quvchilar progressini boshqarish",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
