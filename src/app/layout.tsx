import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "CaptionForge — AI captions & subtitles for short-form video",
    template: "%s · CaptionForge",
  },
  description:
    "CaptionForge turns any short-form video into scroll-stopping captions in one click — 50+ languages, 130+ styles, word-level timing, and 4K export.",
  keywords: [
    "AI captions",
    "subtitle editor",
    "auto captions",
    "Reels captions",
    "TikTok subtitles",
    "Whisper transcription",
  ],
  manifest: "/manifest.webmanifest",
  metadataBase: new URL("https://captionforge.app"),
  openGraph: {
    title: "CaptionForge",
    description: "AI captions & subtitles for short-form creators.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Baloo+2:wght@400..800&family=Noto+Sans+Devanagari:wght@400..900&family=Noto+Sans+Tamil:wght@400..900&family=Noto+Sans+Telugu:wght@400..900&family=Noto+Sans+Malayalam:wght@400..900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
