import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://fastmeet.vercel.app"),
  title: {
    default: "FASTMeet | Googleカレンダー連携の日程調整SaaS",
    template: "%s | FASTMeet",
  },
  description: "Googleカレンダーとリアルタイム同期。先方にURLを送るだけで日程調整が完了。商談・面接・社内MTG調整の往復メールをゼロに。",
  keywords: ["日程調整", "スケジュール調整", "TimeRex", "Jicoo", "Calendly", "Googleカレンダー", "Google Meet", "Zoom"],
  authors: [{ name: "山中秀斗" }],
  creator: "山中秀斗",
  publisher: "山中秀斗",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/logo-192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/logo-192.png",
  },
  openGraph: {
    title: "FASTMeet | Googleカレンダー連携の日程調整SaaS",
    description: "リアルタイム空き時間共有 + 自動Google Meet/Zoom発行で、商談調整の往復メールをゼロに。",
    url: "https://fastmeet.vercel.app",
    siteName: "FASTMeet",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FASTMeet | Googleカレンダー連携の日程調整SaaS",
    description: "リアルタイム空き時間共有 + 自動Google Meet/Zoom発行",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
