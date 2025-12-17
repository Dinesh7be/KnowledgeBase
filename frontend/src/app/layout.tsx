import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { GoogleAuthProvider } from "@/lib/google-auth";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Chat Base - Knowledge Base Assistant",
  description: "Private Knowledge Base Chatbot powered by RAG",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body
        className={`${sourceSans.variable} antialiased`}
        style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
      >
        <GoogleAuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
