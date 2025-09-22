import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RealtimeProvider } from "@/components/realtime/realtime-provider";
import { AppSettingsProvider } from "@/components/providers/app-settings-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "All Buzz Cleaning - Review Management",
  description: "Professional review management for All Buzz Cleaning. Intelligently route customer feedback based on ratings. High ratings redirect to Google Business reviews, while low ratings collect private feedback.",
  keywords: ["All Buzz Cleaning", "review management", "customer feedback", "cleaning service reviews", "rating system", "vacate cleaning"],
  authors: [{ name: "Alpha Business Digital" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" }
  ]
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
        <RealtimeProvider>
          <AppSettingsProvider>
            {children}
          </AppSettingsProvider>
        </RealtimeProvider>
      </body>
    </html>
  );
}
