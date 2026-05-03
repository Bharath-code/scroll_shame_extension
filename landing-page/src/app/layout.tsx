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
  title: "ScrollShame: Your weekly browser chaos report",
  description: "ScrollShame is a Chrome extension that turns your weekly browser behaviour into a chaos report. Chaos Score, tab stats, and five different narrators who all have opinions. Free. No account.",
  keywords: ["Chrome extension", "productivity", "digital wellbeing", "browser stats", "humor", "weekly report", "chaos score"],
  alternates: {
    canonical: "https://scrollshame.com",
  },
  openGraph: {
    title: "ScrollShame: Your weekly browser chaos report",
    description: "Every tab, every 2am session, every rage-quit tab. Narrated.",
    url: "https://scrollshame.com",
    siteName: "ScrollShame",
    images: [
      {
        url: "/chaos-report-card-preview.png",
        width: 1200,
        height: 630,
        alt: "ScrollShame Chaos Report Card Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScrollShame: Your weekly browser chaos report",
    description: "Every tab, every 2am session, every rage-quit tab. Narrated.",
    images: ["/chaos-report-card-preview.png"],
    creator: "@scrollshame",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ScrollShame",
  "operatingSystem": "ChromeOS, Windows, macOS, Linux",
  "applicationCategory": "BrowserApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "120"
  },
  "description": "ScrollShame turns your weekly browser behaviour into a chaos report with narrations and chaos scores."
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does it actually track my browsing history?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. It tracks aggregate behaviours: peak tab counts, session lengths, scroll velocity events, and night-time activity. It does not read page content or URLs."
      }
    },
    {
      "@type": "Question",
      "name": "Is my data stored online?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Everything is stored locally in Chrome's extension storage. It never leaves your browser."
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-rose-500/30 selection:text-rose-100`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className="bg-zinc-950 text-zinc-200 min-h-[100dvh] flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
