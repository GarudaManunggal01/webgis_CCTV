import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pantau Jogja — WebGIS CCTV DIY",
  description:
    "Sistem monitoring CCTV Daerah Istimewa Yogyakarta berbasis WebGIS. Pantau kondisi lalu lintas dan wilayah secara real-time melalui 151 titik CCTV.",
  keywords: ["CCTV", "Yogyakarta", "WebGIS", "monitoring", "lalu lintas", "DIY"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
