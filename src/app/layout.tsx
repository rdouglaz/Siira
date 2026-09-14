import type { Metadata, Viewport } from "next"
import { Providers } from "./providers"
import { SWRegister } from "@/components/SWRegister"
import "./globals.css"

export const metadata: Metadata = {
  title: "Siira — Speak every day.",
  description: "A calm, speech-first language companion that helps you actually speak Mandarin and German through real conversation.",
  manifest: "/manifest.webmanifest",
  metadataBase: new URL("https://siira.chat"),
  openGraph: {
    title: "Siira — Speak every day.",
    description: "A calm, speech-first language companion that helps you actually speak Mandarin and German through real conversation.",
    url: "https://siira.chat",
    siteName: "Siira",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Siira",
  },
}

export const viewport: Viewport = {
  themeColor: "#F97316",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-dvh bg-[#FDFBF7]" suppressHydrationWarning>
        <Providers>{children}</Providers>
        <SWRegister />
      </body>
    </html>
  )
}