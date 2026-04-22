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

    const text = `${product.name} - ${formatPrice(Number(product.price))}`;

    // ✅ CORRIGIDO (com crase)
    window.open(
      `https://wa.me/5541996265158?text=Pedido:%0A${text}`,
      "_blank"
    );
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
        }}
      >
        Carregando...
      </div>
    );
  }

  const productDescription =
    product.description?.trim() ||
    "Produto digital disponível para envio rápido. Após o pagamento, o pedido será combinado pelo WhatsApp.";

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #020014 0%, #0b041a 50%, #020014 100%)",
        color: "white",
        padding: isMobile ? 12 : 20,
        fontFamily: "Arial",
      }}
    >
      <Link
        href="/"
        style={{
          color: "#c084fc",
          fontWeight: "bold",
          textDecoration: "none",
        }}
      >
        ← Voltar
      </Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 20,
          marginTop: 20,
          background: "rgba(255,255,255,0.04)",
          borderRadius: 20,
          padding: 20,
          backdropFilter: "blur(10px)",
        }}
      >
        {/* IMAGEM */}
        <div>
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: "100%",
              height: isMobile ? 250 : 500,
              objectFit: "cover",
              borderRadius: 16,
            }}
          />

          {/* BOTÃO EMBAIXO DA IMAGEM */}
          <button
            onClick={sendWhatsApp}
            style={{
              width: "100%",
              marginTop: 12,
              padding: 14,
              borderRadius: 12,
              border: "none",
              fontWeight: "bold",
              fontSize: 16,
              background:
                "linear-gradient(180deg, #a855f7 0%, #6d28d9 100%)",
              color: "white",
              boxShadow: "0 0 20px rgba(168,85,247,0.8)",
              cursor: "pointer",
            }}
          >
            Enviar pedido no WhatsApp
          </button>
        </div>

        {/* INFO DIREITA */}
        <div>
          <h1 style={{ fontSize: 32 }}>{product.name}</h1>

          <p
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#d8b4fe",
            }}
          >
            {formatPrice(product.price)}
          </p>

          <p>
            {product.stock > 0
              ? `Estoque: ${product.stock}`
              : "Sem estoque"}
          </p>

          {/* DESCRIÇÃO */}
          <div
            style={{
              marginTop: 20,
              padding: 16,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 12,
            }}
          >
            <h3>Descrição</h3>
            <p>{productDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
}