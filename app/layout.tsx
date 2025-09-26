import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RealtimeProvider } from "@/components/realtime/realtime-provider";
import { AppSettingsProvider } from "@/components/providers/app-settings-provider";
import { PWAProvider } from "@/components/pwa/pwa-provider";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ErrorMonitor } from "@/components/ui/error-monitor";
import { DebugInfo } from "@/components/ui/debug-info";

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
    icon: [
      { url: "/logo/favicon.ico", sizes: "any" },
      { url: "/logo/icons8-logo-ios-17-outlined-16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo/icons8-logo-ios-17-outlined-32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/icons8-logo-ios-17-outlined-50.png", sizes: "50x50", type: "image/png" },
      { url: "/logo/icons8-logo-ios-17-outlined-57.png", sizes: "57x57", type: "image/png" },
      { url: "/logo/icons8-logo-ios-17-outlined-60.png", sizes: "60x60", type: "image/png" },
      { url: "/logo/icons8-logo-ios-17-outlined-70.png", sizes: "70x70", type: "image/png" },
      { url: "/logo/icons8-logo-ios-17-outlined-72.png", sizes: "72x72", type: "image/png" }
    ],
    shortcut: "/logo/favicon.ico",
    apple: [
      { url: "/logo/icons8-logo-ios-17-outlined-57.png", sizes: "57x57", type: "image/png" },
      { url: "/logo/icons8-logo-ios-17-outlined-60.png", sizes: "60x60", type: "image/png" },
      { url: "/logo/icons8-logo-ios-17-outlined-72.png", sizes: "72x72", type: "image/png" }
    ],
  },
  other: {
    "msapplication-TileColor": "#000000",
    "msapplication-TileImage": "/logo/icons8-logo-ios-17-outlined-50.png",
    "theme-color": "#000000"
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
      <head>
        <link rel="icon" href="/logo/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo/icons8-logo-ios-17-outlined-16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/logo/icons8-logo-ios-17-outlined-32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/logo/icons8-logo-ios-17-outlined-50.png" type="image/png" sizes="50x50" />
        <link rel="icon" href="/logo/icons8-logo-ios-17-outlined-57.png" type="image/png" sizes="57x57" />
        <link rel="icon" href="/logo/icons8-logo-ios-17-outlined-60.png" type="image/png" sizes="60x60" />
        <link rel="icon" href="/logo/icons8-logo-ios-17-outlined-70.png" type="image/png" sizes="70x70" />
        <link rel="icon" href="/logo/icons8-logo-ios-17-outlined-72.png" type="image/png" sizes="72x72" />
        <link rel="apple-touch-icon" href="/logo/icons8-logo-ios-17-outlined-57.png" />
        <link rel="apple-touch-icon" href="/logo/icons8-logo-ios-17-outlined-60.png" sizes="60x60" />
        <link rel="apple-touch-icon" href="/logo/icons8-logo-ios-17-outlined-72.png" sizes="72x72" />
        <link rel="shortcut icon" href="/logo/favicon.ico" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-TileImage" content="/logo/icons8-logo-ios-17-outlined-50.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <PWAProvider>
            <RealtimeProvider>
              <AppSettingsProvider>
                <ErrorMonitor />
                {children}
                <Toaster />
                <DebugInfo />
              </AppSettingsProvider>
            </RealtimeProvider>
          </PWAProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
