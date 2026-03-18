import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mahjong Event",
  description: "Sichuan mahjong scoring and leaderboard",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="max-w-lg mx-auto px-4 pb-8">
          {children}
        </div>
      </body>
    </html>
  );
}
