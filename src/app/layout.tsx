
import "../styles/globals.css";

import { Inter } from "next/font/google";
import { Providers } from "~/components/providers";
import ServiceWorkerRegistration from "~/components/ServiceWorkerRegistration";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Fundación Biodiversidad",
  description: "Herramienta de seguimiento de indicadores",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport: "width=device-width, initial-scale=1",
  keywords: "biodiversidad, conservación, indicadores, dashboard, fundación",
  authors: [{ name: "FundBio SaaS Team" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    title: "Fundación Biodiversidad - Dashboard",
    description: "Sistema de gestión de indicadores de biodiversidad",
    siteName: "FundBio Dashboard",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FundBio Dashboard" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <ServiceWorkerRegistration />
        </Providers>
      </body>
    </html>
  );
}
