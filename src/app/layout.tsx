import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LearningPacer — Virtual TA for ELEC3120 Computer Networks | HKUST",
  description:
    "LearningPacer (NetTutor AI) is an intelligent virtual teaching assistant for HKUST ELEC3120 Computer Networking. Get help with networking concepts, quiz practice, and knowledge browsing.",
  keywords: [
    "LearningPacer",
    "NetTutor AI",
    "ELEC3120",
    "Computer Networks",
    "HKUST",
    "virtual TA",
    "teaching assistant",
  ],
  authors: [{ name: "Group MZ01b-25" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "LearningPacer — Virtual TA for ELEC3120",
    description: "AI-powered teaching assistant for Computer Networking at HKUST",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
