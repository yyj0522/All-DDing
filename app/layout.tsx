import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import WelcomePopup from "@/components/WelcomePopup"; 
import { ThemeProvider } from "@/components/ThemeProvider";
import AutoCloudSync from "@/components/AutoCloudSync";
import ChannelTalk from "@/components/ChannelTalk";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "올띵 | 가장 편한 띵타이쿤 도우미",
  description: "띵타이쿤 플레이를 위한 최고의 선택, 올띵.",
  openGraph: {
    title: "올띵 | 가장 편한 띵타이쿤 도우미",
    description: "띵타이쿤 플레이를 위한 최고의 선택, 올띵.",
    url: "https://alldding.live",
    siteName: "올띵",
    images: [
      {
        url: "https://alldding.live/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "올띵 수익 계산기 및 스킬 시뮬레이터",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "올띵 | 가장 편한 띵타이쿤 도우미",
    description: "띵타이쿤 플레이를 위한 최고의 선택, 올띵.",
    images: ["https://alldding.live/images/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {!isDev && (
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.addEventListener('contextmenu', function (e) { e.preventDefault(); });
                  window.addEventListener('dragstart', function (e) { e.preventDefault(); });
                  window.addEventListener('keydown', function (e) {
                    if (
                      e.key === 'F12' || 
                      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
                      (e.ctrlKey && e.key === 'U')
                    ) {
                      e.preventDefault();
                    }
                  });
                `,
              }}
            />
          )}
          <AutoCloudSync />
          <WelcomePopup />
          {children}
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
          <ChannelTalk />
        </ThemeProvider>
      </body>
    </html>
  );
}