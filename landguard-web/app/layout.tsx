import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://landguard.gov.gh";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F59E0B" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "LandGuard – Ghana's Trusted Land Registry Platform",
    template: "%s | LandGuard",
  },
  description:
    "Verify, buy, and protect land ownership with Ghana's most secure digital land registry. Prevent fraud, resolve disputes, and transact with confidence.",
  keywords: [
    "land registry Ghana",
    "land verification Ghana",
    "Ghana land ownership",
    "land title search",
    "property registration Ghana",
    "LandGuard",
  ],
  authors: [{ name: "LandGuard – Government of Ghana" }],
  creator: "LandGuard",
  publisher: "Government of Ghana",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: APP_URL },
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: APP_URL,
    siteName: "LandGuard",
    title: "LandGuard – Ghana's Trusted Land Registry Platform",
    description:
      "Verify, buy, and protect land ownership with Ghana's most secure digital land registry.",
    images: [
      {
        url: `${APP_URL}/img/og-cover.jpg`,
        width: 1200,
        height: 630,
        alt: "LandGuard – Ghana Land Registry",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LandGuard – Ghana's Trusted Land Registry Platform",
    description:
      "Verify, buy, and protect land ownership with Ghana's most secure digital land registry.",
    images: [`${APP_URL}/img/og-cover.jpg`],
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

// JSON-LD structured data for the organisation
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "GovernmentOrganization",
  name: "LandGuard – Ghana Land Registry",
  url: APP_URL,
  logo: `${APP_URL}/img/logo.jpg`,
  description:
    "Ghana's official digital land registry platform for secure land verification and registration.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "GH",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GH"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {/* Register PWA service worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(){});
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans" id="main-content">
        {/* Skip-navigation link for keyboard/screen-reader users */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-white focus:rounded"
        >
          Skip to main content
        </a>
        <main id="main" tabIndex={-1} className="flex-1 flex flex-col outline-none">
          {children}
        </main>
      </body>
    </html>
  );
}
