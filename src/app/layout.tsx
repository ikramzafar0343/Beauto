import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import "../styles/chat-animations.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-code",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Beauto - AI Agent for Your Apps",
  description: "Now your AI can manage databases, send emails, and automate workflows with Beauto powered by Composio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
        <body
          className={`${inter.variable} ${ibmPlexMono.variable} antialiased font-[family-name:var(--font-display)]`}
        >
          <LanguageProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </LanguageProvider>
          <VisualEditsMessenger />
        </body>
    </html>
  );
}