import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/i18n";
import MotionProvider from "@/components/providers/MotionProvider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
 subsets: ["latin"],
 variable: "--font-jakarta",
 display: "swap",
 weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
 subsets: ["latin"],
 variable: "--font-playfair",
 display: "swap",
 weight: ["400", "500", "600"],
 style: ["normal"],
});

const jetbrainsMono = JetBrains_Mono({
 subsets: ["latin"],
 variable: "--font-jetbrains",
 display: "swap",
 weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
 metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://offerpath.cc.cd"),
 title: "OfferPath — From search to offer",
 description:
 "Discover roles, track applications, build tailored resumes, and prepare for interviews — in one workspace.",
 keywords: [
 "job search",
 "resume builder",
 "interview prep",
 "job tracker",
 "career tools",
 "AI resume",
 "job application tracker",
 ],
 authors: [{ name: "OfferPath" }],
 openGraph: {
 title: "OfferPath — From search to offer",
 description:
 "Discover roles, track applications, build tailored resumes, and prepare for interviews — in one workspace.",
 type: "website",
 },
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en" className={`scroll-smooth ${jakarta.variable} ${playfair.variable} ${jetbrainsMono.variable}`}>
 <head />
 <body className="font-sans antialiased bg-surface-50 text-surface-400">
 <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-md focus:bg-surface-400 focus:text-white focus:text-sm">
 Skip to main content
 </a>
 <LanguageProvider>
 <MotionProvider>{children}</MotionProvider>
 </LanguageProvider>
 <Toaster
 position="top-right"
 toastOptions={{
 style: {
 background: "var(--color-surface-0)",
 color: "var(--color-surface-400)",
 border: "1px solid var(--color-surface-200)",
 borderRadius: "8px",
 },
 }}
 />
 </body>
 </html>
 );
}
