import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Gowun_Dodum, Jua } from "next/font/google";
import "./globals.css";

const headingFont = Jua({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
});

const bodyFont = Gowun_Dodum({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "패밀리 플레이그라운드",
  description: "부모와 아이가 함께 즐기는 가족용 게임 공간",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
