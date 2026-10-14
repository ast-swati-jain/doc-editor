import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "react-quill-new/dist/quill.snow.css";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Ajaia Doc Editor | Lightweight Collaborative Workspace",
  description: "A fast, modern collaborative document editor inspired by Google Docs. Built for the Ajaia Product Engineer Assessment.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
