import type { Metadata } from "next";
import { inter, jetbrainsMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Get Staked",
  description: "Social accountability PWA where users stake SOL on habits",
  manifest: "/manifest.json",
  themeColor: "#06060A",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
        style={{
          fontFamily: 'var(--font-inter)',
          colorScheme: 'dark',
        }}
      >
        {children}
      </body>
    </html>
  );
}
