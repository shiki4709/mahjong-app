import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "🀄 Mahjong Event",
  description: "Sichuan mahjong scoring and leaderboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        <div className="max-w-lg mx-auto px-4 py-6">
          {children}
        </div>
      </body>
    </html>
  );
}
