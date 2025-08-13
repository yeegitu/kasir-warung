import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Kasir App",
  description: "Aplikasi kasir sederhana",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex">
        {/* Sidebar di kiri */}
        <Sidebar />

        {/* Konten di kanan */}
        <main className="flex-1 p-6 bg-gray-100 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
