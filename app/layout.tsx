import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "SafelinkluX — Secure File Sharing & Mission Link Platform", template: "%s | SafelinkluX" },
  description: "Modern secure file sharing and mission link platform. Upload files, create shortlinks, and earn through mission-gated content.",
  keywords: ["file sharing", "safelink", "shortlink", "mission", "download"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"),
  openGraph: { type: "website", title: "SafelinkluX", description: "Secure Modern File Sharing & Mission Link Platform" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-surface text-white antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "#1e293b", color: "#f1f5f9", border: "1px solid #334155" },
            success: { iconTheme: { primary: "#0ea5e9", secondary: "#0f172a" } },
          }}
        />
      </body>
    </html>
  );
}
