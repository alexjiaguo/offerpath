import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
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
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "white",
              color: "#111111",
              border: "1px solid #EAEAEA",
              borderRadius: "8px",
            },
          }}
        />
      </body>
    </html>
  );
}
