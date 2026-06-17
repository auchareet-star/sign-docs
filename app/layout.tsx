import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ระบบออกหนังสือ | Doc-Approve",
  description: "ระบบจัดทำและลงนามหนังสือจาก Google Sheet",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
