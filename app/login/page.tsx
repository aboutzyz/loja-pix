"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 VERIFICA SE JÁ LOGOU AO VOLTAR DO EMAIL
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        window.location.href = "/";
      }
    };

    checkUser();
  }, []);

  async function handleLogin() {
    if (!email) {
      setMessage("Digite um email válido.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // 🔥 ESSA LINHA É O SEGREDO
        emailRedirectTo: window.location.origin + "/login",
      },
    });

    setLoading(false);

    if (error) {
      setMessage("Erro ao enviar email. Tente novamente.");
    } else {
      setMessage("EMAIL_SENT");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `
          radial-gradient(circle at 25% 20%, rgba(170, 60, 255, 0.25), transparent 30%),
          radial-gradient(circle at 80% 80%, rgba(200, 80, 255, 0.2), transparent 25%),
          linear-gradient(180deg, #090114 0%, #100022 50%, #0a0117 100%)
        `,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* GRID */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(179, 77, 255, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(179, 77, 255, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          opacity: 0.6,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 420,
          padding: 28,
          borderRadius: 26,
          background: "rgba(20, 6, 40, 0.75)",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(168,85,247,0.2)",
          boxShadow: "0 0 40px rgba(168,85,247,0.25)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: 36,
            marginBottom: 8,
            fontWeight: 900,
            textShadow: "0 0 20px rgba(168,85,247,0.6)",
          }}
        >
          BoutBux
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#d8b4fe",
            marginBottom: 22,
            fontSize: 14,
          }}
        >
          Acesse sua conta com rapidez
        </p>

        <input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: 14,
            border: "1px solid rgba(168,85,247,0.25)",
            background: "rgba(18, 12, 32, 0.8)",
            color: "#fff",
            outline: "none",
            marginBottom: 16,
          }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 14,
            border: "1px solid rgba(216, 180, 254, 0.3)",
            background: "linear-gradient(180deg, #a855f7 0%, #6d28d9 100%)",
            color: "#fff",
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer",
            boxShadow: "0 0 30px rgba(168,85,247,0.8)",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Enviando..." : "Entrar / Registrar"}
        </button>

        {/* 🔥 MENSAGEM */}
        {message === "EMAIL_SENT" && (
          <div
            style={{
              marginTop: 18,
              padding: 16,
              borderRadius: 16,
              background:
                "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(109,40,217,0.2))",
              border: "1px solid rgba(168,85,247,0.4)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 26 }}>📩</div>
            <strong>Verifique seu email</strong>
            <p style={{ marginTop: 6, fontSize: 13 }}>
              Clique no link enviado para entrar automaticamente.
            </p>
          </div>
        )}

        {message && message !== "EMAIL_SENT" && (
          <p style={{ marginTop: 14, color: "#f87171", textAlign: "center" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}