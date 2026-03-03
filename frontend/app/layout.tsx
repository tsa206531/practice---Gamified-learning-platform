import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "水球潘 - 遊戲化線上學習平台(面試作品)",
  description: "透過遊戲化學習方式，挑戰道館、獲得徽章、提升技能等級",
  generator: "Next16",
  icons: {
    icon: "/new-icon.png",
  },
  openGraph: {
    title: "水球潘 - 遊戲化線上學習平台(面試作品)",
    description: "透過遊戲化學習方式，挑戰道館、獲得徽章、提升技能等級",
    url: "https://your-project.vercel.app",
    siteName: "水球潘學習平台",
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "水球潘 - 遊戲化線上學習平台(面試作品)",
    description: "透過遊戲化學習方式，挑戰道館、獲得徽章、提升技能等級",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast:
                  "text-[36px] px-10 py-8 bg-transparent shadow-none border-0 rounded-none backdrop-blur-0",
                title: "text-[36px] font-extrabold tracking-wide",
                description: "text-2xl opacity-90",
                actionButton: "text-lg px-5 py-3 rounded-xl",
                cancelButton: "text-lg px-5 py-3 rounded-xl",
              },
            }}
          />
        </ThemeProvider>
        <Script src="https://accounts.google.com/gsi/client" async defer />
        <Analytics />
      </body>
    </html>
  );
}
