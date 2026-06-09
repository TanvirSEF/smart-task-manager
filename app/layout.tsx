import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Smart Task Manager",
  description: "Built with Next.js, Clerk, MongoDB, and OpenAI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} antialiased`} suppressHydrationWarning>{children}</body>
      </html>
    </ClerkProvider>
  );
}