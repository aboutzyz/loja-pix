"use client";

import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function ProdutoPage() {
  const params = useParams();
  const productId = String(params?.id ?? "");

  const [product, setProduct] = useState<Product | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    loadProduct();
  }, []);

  async function loadProduct() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setProduct(data);
  }

  function sendWhatsApp() {
    if (!product) return;

    const msg =
      `Olá, quero comprar:%0A` +
      `${product.name}%0A` +
      `Preço: ${formatPrice(product.price)}`;

    window.open(`https://wa.me/5541996265158?text=${msg}`, "_blank");
  }

  if (!product) {
    return (
      <div style={{ color: "white", padding: 40 }}>
        Carregando...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #020014 0%, #0b041a 50%, #020014 100%)",
        color: "white",
        padding: isMobile ? 12 : 20,
      }}
    >
      {/* TOPO */}
      <div style={{ marginBottom: 20 }}>
        <Link href="/" style={{ color: "#a855f7", fontWeight: "bold" }}>
          ← Voltar
        </Link>
      </div>

      {/* CONTAINER */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 20,
          background: "rgba(255,255,255,0.04)",
          borderRadius: 20,
          padding: isMobile ? 14 : 24,
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(168,85,247,0.2)",
          boxShadow: "0 0 30px rgba(168,85,247,0.25)",
        }}
      >
        {/* IMAGEM */}
        <div
          style={{
            borderRadius: 16,
            overflow: "hidden",
            background: "#0f0a1f",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: isMobile ? 250 : 400,
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* INFO */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h1
            style={{
              fontSize: isMobile ? 22 : 32,
              textShadow: "0 0 15px rgba(168,85,247,0.7)",
            }}
          >
            {product.name}
          </h1>

          <p
            style={{
              fontSize: isMobile ? 22 : 30,
              fontWeight: "bold",
              color: "#d8b4fe",
            }}
          >
            {formatPrice(product.price)}
          </p>

          <p style={{ color: "#d8b4fe", fontWeight: "bold" }}>
            {product.stock > 0
              ? `Estoque disponível: ${product.stock}`
              : "Sem estoque"}
          </p>

          {/* BOTÃO */}
          <button
            onClick={sendWhatsApp}
            style={{
              marginTop: 20,
              width: "100%",
              padding: "14px",
              borderRadius: 14,
              border: "none",
              fontWeight: "bold",
              fontSize: 16,
              cursor: "pointer",
              background:
                "linear-gradient(180deg, #a855f7 0%, #6d28d9 100%)",
              color: "white",
              boxShadow: "0 0 30px rgba(168,85,247,0.9)",
            }}
          >
            Enviar pedido no WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}