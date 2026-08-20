import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/session-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Force dynamic rendering for all pages — avoids prerender issues with auth/supabase
export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "ArduinoHub - Nền tảng chia sẻ mã Arduino",
  description:
    "Chia sẻ, học hỏi và giải quyết lỗi Arduino cùng cộng đồng. Thư viện mã nguồn mở, hướng dẫn chi tiết và hỗ trợ lỗi miễn phí.",
  keywords: ["arduino", "code sharing", "embedded", "IoT", "microcontroller", "mã nguồn"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className={inter.className}>
        <SessionProvider>
          <TooltipProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </TooltipProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
