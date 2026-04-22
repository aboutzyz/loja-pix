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
  description?: string | null;
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
    function updateLayout() {
      setIsMobile(window.innerWidth <= 768);
    }

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  useEffect(() => {
    if (!productId) return;
    loadProduct();
  }, [productId]);

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
      `Preço: ${formatPrice(Number(product.price))}`;

    window.open(`https://wa.me/5541996265158?text=${msg}`, "_blank");
  }

  if (!product) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #020014 0%, #0b041a 50%, #020014 100%)",
          color: "white",
          padding: 40,
          fontFamily: "Arial, sans-serif",
        }}
      >
        Carregando...
      </div>
    );
  }

  const productDescription =
    product.description?.trim() ||
    "Produto digital disponível para envio rápido. Após o pagamento, o pedido será combinado pelo WhatsApp. Se tiver dúvidas, chame no atendimento antes de finalizar.";

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #020014 0%, #0b041a 50%, #020014 100%)",
        color: "white",
        padding: isMobile ? 12 : 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/"
          style={{
            color: "#c084fc",
            fontWeight: "bold",
            textDecoration: "none",
            textShadow: "0 0 12px rgba(168,85,247,0.5)",
          }}
        >
          ← Voltar
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.05fr 1fr",
          gap: 20,
          background: "rgba(255,255,255,0.04)",
          borderRadius: 24,
          padding: isMobile ? 14 : 24,
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(168,85,247,0.2)",
          boxShadow: "0 0 30px rgba(168,85,247,0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              borderRadius: 18,
              overflow: "hidden",
              background: "#0f0a1f",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: isMobile ? 260 : 520,
              boxShadow: "0 0 20px rgba(168,85,247,0.18)",
            }}
          >
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>

          <button
            onClick={sendWhatsApp}
            style={{
              width: "100%",
              padding: isMobile ? "14px 14px" : "16px 18px",
              borderRadius: 16,
              border: "none",
              fontWeight: "bold",
              fontSize: isMobile ? 15 : 18,
              cursor: "pointer",
              background: "linear-gradient(180deg, #a855f7 0%, #6d28d9 100%)",
              color: "white",
              boxShadow: "0 0 30px rgba(168,85,247,0.9)",
            }}
          >
            Enviar pedido no WhatsApp
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            justifyContent: "flex-start",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: isMobile ? 24 : 40,
              lineHeight: 1.1,
              textShadow: "0 0 15px rgba(168,85,247,0.7)",
              wordBreak: "break-word",
            }}
          >
            {product.name}
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: isMobile ? 24 : 34,
              fontWeight: "bold",
              color: "#d8b4fe",
              textShadow: "0 0 16px rgba(168,85,247,0.45)",
            }}
          >
            {formatPrice(Number(product.price))}
          </p>

          <p
            style={{
              margin: 0,
              color: "#d8b4fe",
              fontWeight: "bold",
              fontSize: isMobile ? 15 : 18,
            }}
          >
            {product.stock > 0
              ? `Estoque disponível: ${product.stock}`
              : "Sem estoque"}
          </p>

          <div
            style={{
              marginTop: 10,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              padding: isMobile ? 14 : 18,
              backdropFilter: "blur(10px)",
              boxShadow: "0 0 18px rgba(168,85,247,0.1)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 10,
                fontSize: isMobile ? 18 : 22,
                color: "#ffffff",
                textShadow: "0 0 12px rgba(168,85,247,0.4)",
              }}
            >
              Descrição
            </h2>

            <p
              style={{
                margin: 0,
                color: "#d1d5db",
                lineHeight: 1.6,
                fontSize: isMobile ? 14 : 16,
                whiteSpace: "pre-line",
              }}
            >
              {productDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}