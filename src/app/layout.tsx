import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import { Providers } from "@/app/providers";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0b6fb3" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  colorScheme: "light dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  applicationName: "HOME-CELL",
  title: {
    default: "HOME-CELL",
    template: "%s | HOME-CELL",
  },
  description:
    "Home Fellowship attendance and communication management for Salvation Ministries.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/logo.png" }],
    apple: [{ url: "/logo.png" }],
  },
  openGraph: {
    type: "website",
    siteName: "HOME-CELL",
    title: "HOME-CELL",
    description:
      "Home Fellowship attendance and communication management for Salvation Ministries.",
    url: "/",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HOME-CELL",
    description:
      "Home Fellowship attendance and communication management for Salvation Ministries.",
    images: ["/opengraph-image"],
  },
  appleWebApp: {
    capable: true,
    title: "HOME-CELL",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
