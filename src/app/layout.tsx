import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
 title: "OfferPath — From Search to Signed Offer",
 description:
 "The end-to-end job hunting platform. Discover roles, track your pipeline, build tailored resumes, and ace interviews — all in one place.",
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
 title: "OfferPath — From Search to Signed Offer",
 description:
 "The end-to-end job hunting platform. Discover roles, track your pipeline, build tailored resumes, and ace interviews.",
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
 <MotionProvider>{children}</MotionProvider>
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
