import type { Metadata } from "next";
import { Newsreader, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
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
    <html lang="en" className="scroll-smooth">
      <head />
      <body className={`${newsreader.variable} ${jetbrainsMono.variable} font-sans antialiased bg-surface-50 text-surface-400`}>
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
