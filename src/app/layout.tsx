import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "CodeMentor AI — Understand Code. Fix Errors. Learn to Think Like a Programmer.",
  description:
    "AI-powered programming education, step-by-step code explanation, and Socratic debugging platform for beginner computer science and BCA students.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans">
        <AppProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
