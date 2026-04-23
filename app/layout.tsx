import type { Metadata } from "next";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import "./globals.css";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const metadata: Metadata = {
  title: "BoutBux",
  description: "Loja digital premium",
};

function AuthButton() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  if (!user) {
    return (
      <Link href="/login" style={btnLogin}>
        🔐 Entrar
      </Link>
    );
  }

  return (
    <button onClick={logout} style={btnLogout}>
      🚪 Sair
    </button>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        {/* BOTÃO GLOBAL */}
        <div
          style={{
            position: "fixed",
            top: 15,
            right: 15,
            zIndex: 9999,
          }}
        >
          <AuthButton />
        </div>

        {children}
      </body>
    </html>
  );
}

const btnLogin: React.CSSProperties = {
  background: "linear-gradient(180deg, #a855f7, #6d28d9)",
  padding: "10px 16px",
  borderRadius: 14,
  color: "#fff",
  fontWeight: "bold",
  textDecoration: "none",
  boxShadow: "0 0 25px rgba(168,85,247,0.9)",
  border: "1px solid rgba(255,255,255,0.15)",
  backdropFilter: "blur(10px)",
  cursor: "pointer",
};

const btnLogout: React.CSSProperties = {
  background: "linear-gradient(180deg, #ef4444, #b91c1c)",
  padding: "10px 16px",
  borderRadius: 14,
  color: "#fff",
  fontWeight: "bold",
  border: "none",
  boxShadow: "0 0 20px rgba(239,68,68,0.7)",
  cursor: "pointer",
};