import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartBudget",
  description: "Control financiero personal"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
