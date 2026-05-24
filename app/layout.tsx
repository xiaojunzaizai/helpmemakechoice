import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Geist, Geist_Mono } from "next/font/google";
import "antd/dist/reset.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? "/helpmemakechoice" : "";

export const metadata: Metadata = {
  title: "Help Me Make Choice!!!",
  description: "A fun wheel to help you make a choice",
  icons: {
    icon: [
      {
        url: `${basePath}/spin.png`,
        type: "image/png",
        sizes: "1024x1024",
      },
      {
        url: `${basePath}/spin_180.png`,
        type: "image/png",
        sizes: "180x180",
      },
    ], 
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
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
