import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";
<head>
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#fe5502" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
</head>
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Adam  - Restaurant Loyalty Platform",
  description: "Fidelity system for restaurants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}
            <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}