import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

// ── Viewport must be a separate export in Next.js 14+ ────────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#fe5502",
};

export const metadata: Metadata = {
  title: "Adam Fidélité",
  applicationName: "Adam Fidélité",
  description: "Programme de fidélité pour restaurants",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Adam Fidélité",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/*
          Icon, apple-touch-icon, app title and manifest come from the
          metadata API (see generateMetadata in app/client/dashboard/layout.tsx),
          so each restaurant can serve its own logo. Do not hardcode them here,
          or the browser sees two conflicting sets.
        */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}