import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Interact with websites",
  description: "easy way to interact with websites using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "rgba(30, 30, 30, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#f0f0f0",
              backdropFilter: "blur(6px)",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.4)",
            },
          }}
        />
      </body>
    </html>
  );
}
