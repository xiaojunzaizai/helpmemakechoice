import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Help Me Make Choice!!!",
  description: "A fun wheel to help you make a choice",
  icons: {
    // icon: "/转盘1.png",   // 👈 你的图标路径
    icon: [
      {
        url: "/spin.png",
        type: "image/png",
        sizes: "1024x1024",
      },
      {
        url: "/spin_180.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],   // 👈 你的图标路径
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
