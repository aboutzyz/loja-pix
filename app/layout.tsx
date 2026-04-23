import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BoutBux",
  description: "Loja digital premium",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          background: `
            radial-gradient(circle at 20% 30%, rgba(168,85,247,0.25), transparent 30%),
            radial-gradient(circle at 80% 20%, rgba(139,92,246,0.18), transparent 25%),
            linear-gradient(180deg, #020014 0%, #0b041a 50%, #020014 100%)
          `,
          color: "#fff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}