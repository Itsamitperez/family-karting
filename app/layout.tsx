import type { Metadata } from "next";
import "./globals.css";
import ConditionalHeader from "@/components/shared/ConditionalHeader";
import EnvCheck from "@/components/EnvCheck";

export const metadata: Metadata = {
  title: "Family Karting - Racing Stats & Leaderboards",
  description: "Track your family karting competitions, circuits, drivers, and race results",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <EnvCheck />
        <ConditionalHeader />
        {children}
      </body>
    </html>
  );
}

