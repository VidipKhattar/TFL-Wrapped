import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TFL Wrapped",
  description: "Your TFL journey insights, wrapped",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
