"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Header() {
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

  return (
    <header style={headerStyle}>
      {/* LOGO */}
      <div style={logoBox}>
        <div style={logoIcon}></div>
        <span style={logoText}>BoutBux</span>
      </div>

      {/* BOTÕES */}
      <div style={{ display: "flex", gap: 10 }}>
        {!user ? (
          <Link href="/login" style={loginBtn}>
            Entrar
          </Link>
        ) : (
          <button onClick={logout} style={logoutBtn}>
            Sair
          </button>
        )}
      </div>
    </header>
  );
}

const headerStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 999,
  padding: "14px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(10, 5, 30, 0.65)",
  backdropFilter: "blur(14px)",
  borderBottom: "1px solid rgba(168,85,247,0.2)",
  boxShadow: "0 0 25px rgba(124,58,237,0.25)",
};

const logoBox: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const logoIcon: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 10,
  background: "linear-gradient(135deg, #a855f7, #6d28d9)",
  boxShadow: "0 0 20px rgba(168,85,247,0.8)",
};

const logoText: React.CSSProperties = {
  fontSize: 20,
  fontWeight: "bold",
  color: "#fff",
  textShadow: "0 0 15px rgba(168,85,247,0.6)",
};

const loginBtn: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 12,
  background: "linear-gradient(180deg, #a855f7, #6d28d9)",
  color: "#fff",
  textDecoration: "none",
  fontWeight: "bold",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 0 20px rgba(168,85,247,0.8)",
  transition: "0.2s",
};

const logoutBtn: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 12,
  background: "linear-gradient(180deg, #ef4444, #b91c1c)",
  color: "#fff",
  border: "none",
  fontWeight: "bold",
  boxShadow: "0 0 20px rgba(239,68,68,0.6)",
  cursor: "pointer",
};