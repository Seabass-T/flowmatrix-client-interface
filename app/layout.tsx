import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

/**
 * Inter font configuration (PRD Section 8.2)
 * - Primary font for the entire application
 * - Includes OpenType features for better typography
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FlowMatrix AI Client Interface",
  description: "Track your automation ROI metrics and project progress with FlowMatrix AI",
  keywords: ["automation", "ROI", "analytics", "FlowMatrix AI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
