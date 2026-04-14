import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else if (localStorage.theme === 'light') {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${outfit.variable} ${plusJakarta.variable} font-sans antialiased bg-surface-0 text-zinc-800 dark:text-zinc-100`}>
        {children}
      </body>
    </html>
  );
}
