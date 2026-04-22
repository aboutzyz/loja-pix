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

type CartItem = Product & {
  quantity: number;
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showQty, setShowQty] = useState(false);
  const [qty, setQty] = useState(1);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    loadProduct();
    loadCart();
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  async function loadProduct() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    setProduct(data);
  }

  function loadCart() {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }

  function addToCart() {
    if (!product) return;

    setCart((prev) => {
      const exist = prev.find((i) => i.id === product.id);

      if (exist) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }

      return [...prev, { ...product, quantity: qty }];
    });

    setShowQty(false);
    setQty(1);
  }

  function sendWhatsApp() {
    const text = cart
      .map(
        (i) =>
          `${i.name} x${i.quantity} - ${formatPrice(
            i.price * i.quantity
          )}`
      )
      .join("%0A");

    window.open(
      https://wa.me/5541996265158?text=Pedido:%0A${text},
      "_blank"
    );
  }

  const total = cart.reduce(
    (acc, i) => acc + i.price * i.quantity,
    0
  );

  if (!product) return <div style={{ color: "white" }}>Carregando...</div>;

  return (
    <div style={{ padding: 20, color: "white" }}>
      <Link href="/">← Voltar</Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* IMAGEM */}
        <div>
          <img
            src={product.image}
            style={{ width: "100%", borderRadius: 12 }}
          />

          <button
            onClick={() => setShowQty(true)}
            style={{
              marginTop: 10,
              width: "100%",
              padding: 12,
              background: "#7c3aed",
              color: "white",
              borderRadius: 10,
              fontWeight: "bold",
            }}
          >
            Adicionar ao carrinho
          </button>
        </div>

        {/* INFO */}
        <div>
          <h1>{product.name}</h1>
          <h2>{formatPrice(product.price)}</h2>
          <p>Estoque: {product.stock}</p>

          <p style={{ marginTop: 20 }}>
            Produto digital. Entrega rápida via WhatsApp.
          </p>
        </div>
      </div>

      {/* POPUP QUANTIDADE */}
      {showQty && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ background: "#111", padding: 20, borderRadius: 12 }}>
            <h3>Quantidade</h3>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)}>+</button>
            </div>

            <button
              onClick={addToCart}
              style={{ marginTop: 10, background: "#7c3aed", color: "white" }}
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {/* BOTÃO FLUTUANTE */}
      {cart.length > 0 && (
        <button
          onClick={() => setShowCart(!showCart)}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "#7c3aed",
            color: "white",
            fontWeight: "bold",
          }}
        >
          🛒
        </button>
      )}

      {/* CARRINHO */}
      {showCart && (
        <div
          style={{
            position: "fixed",
            right: 20,
            bottom: 90,
            background: "#111",
            padding: 15,
            borderRadius: 12,
            width: 250,
          }}
        >
          <h3>Carrinho</h3>

          {cart.map((i) => (
            <div key={i.id}>
              {i.name} x{i.quantity}
            </div>
          ))}

          <p>Total: {formatPrice(total)}</p>

          <button
            onClick={sendWhatsApp}
            style={{ width: "100%", background: "#22c55e", color: "white" }}
          >
            Finalizar no WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}