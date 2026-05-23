import type { Metadata } from "next";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://spendlens.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "SpendLens — Free AI Spend Audit",
  description:
    "Find out if you're overpaying for AI tools. Get an instant audit of your Cursor, Claude, ChatGPT, and GitHub Copilot spend.",
  openGraph: {
    title: "SpendLens — Free AI Spend Audit",
    description: "Stop overpaying for AI tools. Free audit in 2 minutes.",
    url: APP_URL,
    siteName: "SpendLens",
    type: "website",
    images: [{ url: `${APP_URL}/og-image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendLens — Free AI Spend Audit",
    description: "Stop overpaying for AI tools. Free audit in 2 minutes.",
    images: [`${APP_URL}/og-image.png`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
