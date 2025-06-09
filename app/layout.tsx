import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata, Viewport } from "next";
import Script from 'next/script';

import { Providers } from "./providers";

import { Fira_Code as FontMono, Inter as FontSans, Manrope, UnifrakturMaguntia, Barlow_Condensed } from "next/font/google";
import NavBar from "@/components/NavBar";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-barlow-condensed",
  weight: "700",
});


export const metadata: Metadata = {
  title: "HeyGen Custom RAG",
  description: "HeyGen Custom RAG",
  icons: {
    icon: '/favicon.ico',
  },
  keywords: 'HeyGen Custom RAG',
  openGraph: {
    title: "HeyGen Custom RAG",
    description: "HeyGen Custom RAG",
    images: [],
  },
  twitter: {
    card: 'summary_large_image',
    title: "HeyGen Custom RAG",
    description: "HeyGen Custom RAG"
  },
};



export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable} ${manrope.className} ${barlowCondensed.className}`}
    >
      <head>
       <Script async src="https://www.googletagmanager.com/gtag/js?id=G-MZG150102B"></Script>
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-MZG150102B');`}
        </Script>
      </head>
      <body
        suppressHydrationWarning
        className={clsx("min-h-screen bg-background antialiased")}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <main className="relative flex flex-col h-screen w-screen">
            {/* <NavBar /> */}
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
