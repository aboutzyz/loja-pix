"use client";

import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { CSSProperties } from "react";

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
  description?: string;
};

type CartItem = Product & { quantity: number };

export default function ProdutoPage() {
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [openCart, setOpenCart] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    load();

    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  async function load() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    setProduct(data);
  }

  function addToCart(product: Product) {
    setCart((prev) => {
      const exist = prev.find((i) => i.id === product.id);

      if (exist) {
        if (exist.quantity >= product.stock) return prev;

        return prev.map((i) =>
          i.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });

    setOpenCart(true);
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;

          const newQty = item.quantity + delta;

          if (newQty > item.stock) return item;

          return {
            ...item,
            quantity: Math.max(0, newQty),
          };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (!product) return <div style={{ color: "#fff" }}>Carregando...</div>;

  return (
    <div style={bg}>
      <div style={isMobile ? mobileContainer : container}>
        {/* IMAGEM */}
        <div style={glass}>
          <img src={product.image} style={img} />
        </div>

        {/* INFO */}
        <div style={glass}>
          <h1 style={title}>{product.name}</h1>

          <div style={stock}>
            {product.stock > 0
              ? `${product.stock}+ em estoque`
              : "Sem estoque"}
          </div>

          <h2 style={price}>R$ {product.price}</h2>

          <button style={buyBtn}>💸 Pagar com Pix</button>

          <button style={cartBtn} onClick={() => addToCart(product)}>
            + Adicionar ao carrinho
          </button>
        </div>

        {/* LADO */}
        <div style={sideBox}>
          <div style={glass}>⚡ Entrega imediata</div>
          <div style={glass}>🔒 Segurança</div>
          <div style={glass}>💳 Pix disponível</div>
        </div>
      </div>

      {/* DESCRIÇÃO */}
      <div style={glass}>
        <h2>Descrição</h2>
        <p>{product.description || "Entrega rápida após pagamento."}</p>
      </div>

      {/* BOTÃO FLUTUANTE */}
      <div style={floating} onClick={() => setOpenCart(true)}>
        🛒
      </div>

      {/* OVERLAY */}
      {openCart && <div style={overlay} onClick={() => setOpenCart(false)} />}

      {/* CARRINHO */}
      <div
        style={{
          ...cartPanel,
          right: openCart ? 0 : "-100%",
          width: isMobile ? "100%" : 380,
        }}
      >
        <h2>🛒 Carrinho</h2>

        <div style={{ flex: 1, overflowY: "auto", marginTop: 20 }}>
          {cart.map((item) => (
            <div key={item.id} style={itemBox}>
              <img src={item.image} style={itemImg} />

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold" }}>{item.name}</div>
                <div style={{ color: "#c084fc" }}>
                  R$ {item.price}
                </div>
                <div style={{ fontSize: 12 }}>
                  Estoque: {item.stock}
                </div>
              </div>

              <div style={qtyBox}>
                <button
                  style={qtyBtn}
                  onClick={() => updateQty(item.id, -1)}
                >
                  −
                </button>

                <span style={qtyNumber}>{item.quantity}</span>

                <button
                  style={{
                    ...qtyBtn,
                    opacity: item.quantity >= item.stock ? 0.4 : 1,
                    cursor:
                      item.quantity >= item.stock
                        ? "not-allowed"
                        : "pointer",
                  }}
                  disabled={item.quantity >= item.stock}
                  onClick={() => updateQty(item.id, 1)}
                >
                  +
                </button>
              </div>

              <button
                style={removeBtn}
                onClick={() => updateQty(item.id, -999)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div style={footer}>
          <div style={totalStyle}>
            Total: R$ {total.toFixed(2)}
          </div>

          <button style={finishBtn}>Finalizar compra</button>
        </div>
      </div>
    </div>
  );
}

/* 🎨 ESTILOS TIPADOS */

const bg: CSSProperties = {
  minHeight: "100vh",
  padding: 20,
  color: "#fff",
  background: "linear-gradient(180deg,#020014,#0b041a)",
};

const container: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr 0.8fr",
  gap: 20,
};

const mobileContainer: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 15,
};

const glass: CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(16px)",
  borderRadius: 16,
  padding: 20,
};

const img: CSSProperties = {
  width: "100%",
  maxHeight: 300,
  objectFit: "contain",
};

const title: CSSProperties = { fontSize: 24 };

const stock: CSSProperties = {
  background: "#6d28d9",
  padding: "4px 10px",
  borderRadius: 10,
  display: "inline-block",
};

const price: CSSProperties = {
  fontSize: 26,
  color: "#c084fc",
};

const buyBtn: CSSProperties = {
  marginTop: 15,
  padding: 14,
  borderRadius: 12,
  background: "#22c55e",
  border: "none",
  fontWeight: "bold",
};

const cartBtn: CSSProperties = {
  marginTop: 10,
  padding: 14,
  borderRadius: 12,
  background: "#a855f7",
  border: "none",
  color: "#fff",
};

const sideBox: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const floating: CSSProperties = {
  position: "fixed",
  bottom: 20,
  right: 20,
  width: 60,
  height: 60,
  borderRadius: "50%",
  background: "#a855f7",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 24,
  cursor: "pointer",
};

const overlay: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
};

const cartPanel: CSSProperties = {
  position: "fixed",
  top: 0,
  height: "100%",
  background: "#120826",
  padding: 20,
  display: "flex",
  flexDirection: "column",
  transition: "0.3s",
};

const itemBox: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 16,
  padding: 14,
  borderRadius: 16,
  background: "rgba(255,255,255,0.04)",
};

const itemImg: CSSProperties = {
  width: 60,
  height: 60,
  borderRadius: 10,
};

const qtyBox: CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
};

const qtyBtn: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 10,
  background: "#6d28d9",
  border: "none",
  color: "#fff",
  fontSize: 18,
};

const qtyNumber: CSSProperties = {
  minWidth: 30,
  textAlign: "center",
  fontWeight: "bold",
};

const removeBtn: CSSProperties = {
  background: "#ef4444",
  border: "none",
  color: "#fff",
  borderRadius: 8,
  padding: "6px 10px",
};

const footer: CSSProperties = {
  borderTop: "1px solid rgba(255,255,255,0.1)",
  paddingTop: 10,
};

const totalStyle: CSSProperties = {
  fontSize: 20,
  marginBottom: 10,
  color: "#c084fc",
};

const finishBtn: CSSProperties = {
  width: "100%",
  padding: 14,
  borderRadius: 12,
  background: "#22c55e",
  border: "none",
  fontWeight: "bold",
};