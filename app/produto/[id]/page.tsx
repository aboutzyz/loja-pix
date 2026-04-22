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

type CartItem = Product & { quantity: number };

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

  function saveCart(newCart: CartItem[]) {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  }

  function addToCart() {
    if (!product) return;

    const existing = cart.find((i) => i.id === product.id);

    let newCart;

    if (existing) {
      newCart = cart.map((i) =>
        i.id === product.id
          ? { ...i, quantity: i.quantity + qty }
          : i
      );
    } else {
      newCart = [...cart, { ...product, quantity: qty }];
    }

    saveCart(newCart);
    setShowQty(false);
    setQty(1);
  }

  function changeQty(id: string, amount: number) {
    const newCart = cart.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + amount) }
        : item
    );
    saveCart(newCart);
  }

  function removeItem(id: string) {
    saveCart(cart.filter((i) => i.id !== id));
  }

  function checkout() {
    const text = cart
      .map(
        (i) =>
          `🛒 ${i.name}%0AQuantidade: ${i.quantity}%0ATotal: R$${i.price *
            i.quantity}%0A------`
      )
      .join("%0A");

    window.open(
      `https://wa.me/5541996265158?text=🔥 Pedido:%0A${text}`,
      "_blank"
    );
  }

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (!product) return <div style={{ color: "white" }}>Carregando...</div>;

  return (
    <div style={bg}>
      <Link href="/" style={voltar}>← Voltar</Link>

      <div style={container}>
        {/* IMAGEM */}
        <div style={card}>
          <img src={product.image} style={img} />

          <button onClick={() => setShowQty(true)} style={btnMain}>
            💜 Adicionar ao carrinho
          </button>
        </div>

        {/* INFO */}
        <div style={card}>
          <h1 style={title}>{product.name}</h1>
          <h2 style={price}>R$ {product.price}</h2>
          <p style={stock}>Estoque: {product.stock}</p>
        </div>
      </div>

      {/* POPUP QTD */}
      {showQty && (
        <div style={overlay}>
          <div style={popup}>
            <h2>Quantidade</h2>

            <div style={qtyBox}>
              <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)}>+</button>
            </div>

            <button onClick={addToCart} style={btnMain}>
              Confirmar
            </button>
          </div>
        </div>
      )}

      {/* BOTÃO FLUTUANTE */}
      <div style={floating} onClick={() => setShowCart(true)}>
        🛒
        {cart.length > 0 && <span style={badge}>{cart.length}</span>}
      </div>

      {/* CARRINHO */}
      {showCart && (
        <div style={overlay}>
          <div style={cartBox}>
            <h2>Seu Carrinho</h2>

            {cart.map((item) => (
              <div key={item.id} style={itemBox}>
                <strong>{item.name}</strong>

                <div>
                  <button onClick={() => changeQty(item.id, -1)}>-</button>
                  {item.quantity}
                  <button onClick={() => changeQty(item.id, 1)}>+</button>
                </div>

                <button onClick={() => removeItem(item.id)}>❌</button>
              </div>
            ))}

            <h3>Total: R$ {total}</h3>

            <button onClick={checkout} style={btnMain}>
              Finalizar no WhatsApp
            </button>

            <button onClick={() => setShowCart(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* 🎨 ESTILO ULTRA */

const bg = {
  background: "linear-gradient(180deg,#020014,#0b041a)",
  minHeight: "100vh",
  padding: 20,
  color: "white",
};

const container = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
};

const card = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(15px)",
  borderRadius: 20,
  padding: 20,
  boxShadow: "0 0 25px rgba(168,85,247,0.4)",
};

const img = {
  width: "100%",
  borderRadius: 15,
};

const btnMain = {
  marginTop: 15,
  padding: 14,
  width: "100%",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(180deg,#a855f7,#6d28d9)",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 0 20px #a855f7",
};

const title = {
  fontSize: 28,
  textShadow: "0 0 15px #a855f7",
};

const price = {
  fontSize: 24,
  color: "#c084fc",
};

const stock = {
  opacity: 0.7,
};

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const popup = {
  background: "#120826",
  padding: 30,
  borderRadius: 15,
  boxShadow: "0 0 25px #a855f7",
};

const qtyBox = {
  display: "flex",
  justifyContent: "center",
  gap: 10,
  marginBottom: 10,
};

const floating = {
  position: "fixed" as const,
  bottom: 20,
  right: 20,
  width: 65,
  height: 65,
  borderRadius: "50%",
  background: "#a855f7",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: 26,
  boxShadow: "0 0 25px #a855f7",
  cursor: "pointer",
};

const badge = {
  position: "absolute" as const,
  top: -5,
  right: -5,
  background: "red",
  borderRadius: "50%",
  padding: "4px 8px",
};

const cartBox = {
  background: "#120826",
  padding: 20,
  borderRadius: 15,
  width: 320,
};

const itemBox = {
  marginBottom: 10,
};

const voltar = {
  color: "#a855f7",
  textDecoration: "none",
};