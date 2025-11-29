import type { Metadata, Viewport } from "next";
import "./globals.css";
import ConditionalHeader from "@/components/shared/ConditionalHeader";
import RacingBackground from "@/components/shared/RacingBackground";
import EnvCheck from "@/components/EnvCheck";

export const metadata: Metadata = {
  title: "Family Karting - Racing Stats & Leaderboards",
  description: "Track your family karting competitions, circuits, drivers, and race results",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0D0D0F",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen">
        <EnvCheck />
        <RacingBackground />
        <ConditionalHeader />
        <main className="relative z-10 pb-mobile-nav">
          {children}
        </main>
      </body>
    </html>
  );
}
