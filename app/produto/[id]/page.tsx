"use client";

import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

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

export default function ProdutoPage() {
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [openCart, setOpenCart] = useState(false);

  useEffect(() => {
    load();
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

  function changeQty(id: string, type: "add" | "remove") {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                type === "add"
                  ? item.quantity + 1
                  : Math.max(1, item.quantity - 1),
            }
          : item
      )
    );
  }

  function removeItem(id: string) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (!product) return <div style={{ color: "white" }}>Carregando...</div>;

  return (
    <div style={bg}>
      <div style={container}>
        {/* IMAGEM */}
        <div style={imageBox}>
          <img src={product.image} style={image} />
        </div>

        {/* INFO */}
        <div style={infoBox}>
          <h1 style={title}>{product.name}</h1>

          <div style={stock}>
            {product.stock > 0
              ? `${product.stock}+ em estoque`
              : "Sem estoque"}
          </div>

          <h2 style={price}>R$ {product.price}</h2>

          <button style={buyBtn}>
            Comprar agora
          </button>

          <button
            style={cartBtn}
            onClick={() => addToCart(product)}
          >
            + Adicionar ao carrinho
          </button>
        </div>

        {/* LADO DIREITO */}
        <div style={sideBox}>
          <div style={sideCard}>
            ⚡ Entrega imediata
            <p>Receba automaticamente</p>
          </div>

          <div style={sideCard}>
            🔒 Segurança total
            <p>Dados protegidos</p>
          </div>

          <div style={sideCard}>
            💳 Pagamento
            <p>Pix disponível</p>
          </div>
        </div>
      </div>

      {/* DESCRIÇÃO */}
      <div style={descBox}>
        <h2>Descrição</h2>
        <p>
          {product.description ||
            "Produto digital com entrega rápida."}
        </p>
      </div>

      {/* BOTÃO FLUTUANTE */}
      <div
        onClick={() => setOpenCart(true)}
        style={floatingBtn}
      >
        🛒
      </div>

      {/* CARRINHO */}
      {openCart && (
        <div style={cartBox}>
          <h2>Carrinho</h2>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {cart.map((item) => (
              <div key={item.id} style={itemRow}>
                <img src={item.image} style={itemImg} />

                <div style={{ flex: 1 }}>
                  <p>{item.name}</p>
                  <p style={{ color: "#c084fc" }}>
                    R$ {item.price}
                  </p>
                </div>

                <div style={qtyBox}>
                  <button
                    onClick={() => changeQty(item.id, "remove")}
                    style={qtyBtn}
                  >
                    -
                  </button>

                  <div>{item.quantity}</div>

                  <button
                    onClick={() => changeQty(item.id, "add")}
                    style={qtyBtn}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  style={removeBtn}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div>
            <p>Total: R$ {total.toFixed(2)}</p>

            <button style={finishBtn}>
              Finalizar compra
            </button>
          </div>

          <button
            onClick={() => setOpenCart(false)}
            style={closeBtn}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

/* ESTILO */

const bg = {
  background: "linear-gradient(180deg,#020014,#0b041a)",
  minHeight: "100vh",
  padding: 20,
  color: "white",
};

const container = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr 0.8fr",
  gap: 20,
};

const imageBox = {
  background: "#1a0d2e",
  padding: 10,
  borderRadius: 12,
};

const image = { width: "100%", borderRadius: 10 };

const infoBox = {
  background: "#1a0d2e",
  padding: 20,
  borderRadius: 12,
};

const title = { fontSize: 26 };

const stock = {
  background: "#6d28d9",
  padding: "4px 10px",
  borderRadius: 10,
  display: "inline-block",
};

const price = { fontSize: 28, color: "#c084fc" };

const buyBtn = {
  marginTop: 15,
  width: "100%",
  padding: 14,
  background: "#a855f7",
  border: "none",
  borderRadius: 10,
  color: "white",
  cursor: "pointer",
};

const cartBtn = {
  marginTop: 10,
  width: "100%",
  padding: 14,
  border: "1px solid #a855f7",
  background: "transparent",
  borderRadius: 10,
  color: "#fff",
  cursor: "pointer",
};

const sideBox = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 10,
};

const sideCard = {
  background: "#1a0d2e",
  padding: 15,
  borderRadius: 10,
};

const descBox = {
  marginTop: 30,
  background: "#120622",
  padding: 20,
  borderRadius: 12,
};

const floatingBtn = {
  position: "fixed" as const,
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

const cartBox = {
  position: "fixed" as const,
  top: 0,
  right: 0,
  width: 350,
  height: "100%",
  background: "#0b041a",
  padding: 20,
  display: "flex",
  flexDirection: "column" as const,
};

const itemRow = {
  display: "flex",
  gap: 10,
  marginBottom: 15,
  alignItems: "center",
};

const itemImg = { width: 50 };

const qtyBox = {
  display: "flex",
  gap: 5,
  alignItems: "center",
};

const qtyBtn = {
  width: 28,
  height: 28,
  background: "#6d28d9",
  border: "none",
  color: "#fff",
  cursor: "pointer",
};

const removeBtn = {
  background: "#ef4444",
  border: "none",
  color: "white",
  cursor: "pointer",
};

const finishBtn = {
  width: "100%",
  padding: 14,
  background: "#a855f7",
  border: "none",
  color: "white",
  borderRadius: 10,
  cursor: "pointer",
};

const closeBtn = {
  position: "absolute" as const,
  top: 10,
  right: 10,
  background: "transparent",
  border: "none",
  color: "white",
  fontSize: 20,
  cursor: "pointer",
};