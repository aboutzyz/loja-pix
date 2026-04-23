"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert("Erro: " + error.message);
    } else {
      window.location.href = "/";
    }
  }

  async function handleRegister() {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert("Erro: " + error.message);
    } else {
      alert("Conta criada! Agora faça login.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #020014, #0b041a)",
      }}
    >
      <div
        style={{
          width: 350,
          padding: 30,
          borderRadius: 20,
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(15px)",
          border: "1px solid rgba(168,85,247,0.3)",
          boxShadow: "0 0 40px rgba(168,85,247,0.4)",
          display: "flex",
          flexDirection: "column",
          gap: 15,
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#fff",
            textShadow: "0 0 15px #a855f7",
          }}
        >
          🔐 Login
        </h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleLogin} style={btnLogin}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <button onClick={handleRegister} style={btnRegister}>
          Criar conta
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "12px",
  borderRadius: 10,
  border: "1px solid rgba(168,85,247,0.3)",
  background: "rgba(20,10,40,0.7)",
  color: "#fff",
};

const btnLogin: React.CSSProperties = {
  padding: "12px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(180deg, #a855f7, #6d28d9)",
  color: "#fff",
  fontWeight: "bold",
  boxShadow: "0 0 20px #a855f7",
  cursor: "pointer",
};

const btnRegister: React.CSSProperties = {
  padding: "12px",
  borderRadius: 12,
  border: "1px solid rgba(168,85,247,0.4)",
  background: "transparent",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};