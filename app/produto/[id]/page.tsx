"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";

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

type CartItem = Product & { quantity: number };

function formatPrice(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

export default function ProdutoPage() {
  const { id } = useParams();
  const productId = String(id);

  const [product, setProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [qty, setQty] = useState(1);
  const [showQty, setShowQty] = useState(false);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    loadProduct();
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
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

  function addToCart() {
    if (!product) return;

    const existing = cart.find((i) => i.id === product.id);

    let newCart;

    if (existing) {
      const newQty = Math.min(existing.quantity + qty, product.stock);
      newCart = cart.map((i) =>
        i.id === product.id ? { ...i, quantity: newQty } : i
      );
    } else {
      newCart = [...cart, { ...product, quantity: qty }];
    }

    setCart(newCart);
    setShowQty(false);
    setQty(1);
  }

  function updateQty(id: string, amount: number) {
    setCart((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const newQ = Math.max(1, Math.min(i.quantity + amount, i.stock));
        return { ...i, quantity: newQ };
      })
    );
  }

  function removeItem(id: string) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  const total = useMemo(
    () => cart.reduce((acc, i) => acc + i.price * i.quantity, 0),
    [cart]
  );

  if (!product) return <div style={{ color: "#fff" }}>Carregando...</div>;

  return (
    <div style={bg}>
      <Link href="/" style={back}>← Voltar</Link>

      <div style={grid}>
        {/* IMAGEM */}
        <div style={card}>
          <img src={product.image} style={img} />

          <button style={btn} onClick={() => setShowQty(true)}>
            Adicionar ao carrinho
          </button>
        </div>

        {/* INFO */}
        <div style={card}>
          <h1 style={title}>{product.name}</h1>
          <h2 style={price}>{formatPrice(product.price)}</h2>
          <p>Estoque: {product.stock}</p>

          <div style={descBox}>
            {product.description || "Produto digital com entrega rápida."}
          </div>
        </div>
      </div>

      {/* POPUP QTD */}
      {showQty && (
        <div style={overlay}>
          <div style={popup}>
            <h3>Quantidade</h3>

            <div style={qtyBox}>
              <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span>{qty}</span>
              <button
                onClick={() =>
                  setQty(Math.min(product.stock, qty + 1))
                }
              >
                +
              </button>
            </div>

            <button style={btn} onClick={addToCart}>
              Confirmar
            </button>
          </div>
        </div>
      )}

      {/* BOTÃO CARRINHO */}
      <div style={floating} onClick={() => setShowCart(true)}>
        🛒
        {cart.length > 0 && <span style={badge}>{cart.length}</span>}
      </div>

      {/* CARRINHO LATERAL */}
      <div style={{ ...cartPanel, right: showCart ? 0 : -400 }}>
        <h2>Seu carrinho</h2>

        {cart.map((i) => (
          <div key={i.id} style={item}>
            <img src={i.image} style={miniImg} />

            <div style={{ flex: 1 }}>
              <div>{i.name}</div>
              <div>{formatPrice(i.price)}</div>

              <div style={qtyBoxSmall}>
                <button onClick={() => updateQty(i.id, -1)}>−</button>
                <span>{i.quantity}</span>
                <button onClick={() => updateQty(i.id, 1)}>+</button>
              </div>
            </div>

            <button onClick={() => removeItem(i.id)}>✕</button>
          </div>
        ))}

        <h3>Total: {formatPrice(total)}</h3>

        <button style={btn}>Finalizar pedido</button>
        <button onClick={() => setShowCart(false)}>Fechar</button>
      </div>
    </div>
  );
}

/* 🎨 ESTILO BONITO */
const bg = { background: "#070314", minHeight: "100vh", padding: 20, color: "#fff" };

const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 };

const card = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(12px)",
  borderRadius: 20,
  padding: 20,
};

const img = { width: "100%", borderRadius: 12 };

const btn = {
  marginTop: 10,
  padding: 12,
  borderRadius: 10,
  border: "none",
  background: "#a855f7",
  color: "#fff",
  cursor: "pointer",
};

const title = { fontSize: 28 };
const price = { fontSize: 22, color: "#c084fc" };

const descBox = {
  marginTop: 15,
  background: "rgba(255,255,255,0.04)",
  padding: 10,
  borderRadius: 10,
};

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const popup = {
  background: "#120826",
  padding: 20,
  borderRadius: 10,
};

const qtyBox = {
  display: "flex",
  gap: 10,
  justifyContent: "center",
  alignItems: "center",
};

const floating = {
  position: "fixed" as const,
  bottom: 20,
  right: 20,
  width: 60,
  height: 60,
  borderRadius: "50%",
  background: "#a855f7",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
};

const badge = {
  position: "absolute" as const,
  top: -5,
  right: -5,
  background: "red",
  borderRadius: "50%",
  padding: "4px 6px",
};

const cartPanel = {
  position: "fixed" as const,
  top: 0,
  width: 350,
  height: "100%",
  background: "#120826",
  padding: 20,
  transition: "0.3s",
};

const item = {
  display: "flex",
  gap: 10,
  marginBottom: 10,
};

const miniImg = { width: 50, borderRadius: 8 };

const qtyBoxSmall = {
  display: "flex",
  gap: 5,
  alignItems: "center",
};

const back = { color: "#a855f7", textDecoration: "none" };