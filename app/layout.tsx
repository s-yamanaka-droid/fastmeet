import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CalBook - スマート日程調整",
  description: "Googleカレンダーと連携したリアルタイム日程調整ツール",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
