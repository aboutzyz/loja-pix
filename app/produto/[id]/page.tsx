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
  const [showPopup, setShowPopup] = useState(false);
  const [quantity, setQuantity] = useState(1);
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
          ? { ...i, quantity: i.quantity + quantity }
          : i
      );
    } else {
      newCart = [...cart, { ...product, quantity }];
    }

    saveCart(newCart);
    setShowPopup(false);
    setQuantity(1);
  }

  function removeItem(id: string) {
    const newCart = cart.filter((i) => i.id !== id);
    saveCart(newCart);
  }

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (!product) return <div>Carregando...</div>;

  return (
    <div style={{ padding: 20, color: "white", background: "#0b041a", minHeight: "100vh" }}>
      
      <Link href="/">← Voltar</Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
        
        {/* IMAGEM */}
        <div>
          <img src={product.image} style={{ width: "100%", borderRadius: 16 }} />

          <button
            onClick={() => setShowPopup(true)}
            style={{
              marginTop: 10,
              width: "100%",
              padding: 14,
              borderRadius: 12,
              background: "#9333ea",
              color: "white",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
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
        </div>
      </div>

      {/* POPUP QUANTIDADE */}
      {showPopup && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999,
        }}>
          <div style={{ background: "#111", padding: 20, borderRadius: 12 }}>
            <h3>Quantidade</h3>

            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={1}
              max={product.stock}
              style={{ width: 80, padding: 8 }}
            />

            <div style={{ marginTop: 10 }}>
              <button onClick={addToCart}>Confirmar</button>
              <button onClick={() => setShowPopup(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* BOTÃO CARRINHO */}
      <div
        onClick={() => setShowCart(true)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "#9333ea",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 24,
          cursor: "pointer",
        }}
      >
        🛒
        {cart.length > 0 && (
          <span style={{
            position: "absolute",
            top: -5,
            right: -5,
            background: "red",
            borderRadius: "50%",
            padding: "4px 8px",
            fontSize: 12,
          }}>
            {cart.length}
          </span>
        )}
      </div>

      {/* POPUP CARRINHO */}
      {showCart && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          zIndex: 999,
        }}>
          <div style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: 300,
            height: "100%",
            background: "#111",
            padding: 20,
          }}>
            <h2>Carrinho</h2>

            {cart.map((item) => (
              <div key={item.id}>
                {item.name} x{item.quantity}
                <button onClick={() => removeItem(item.id)}>X</button>
              </div>
            ))}

            <h3>Total: {formatPrice(total)}</h3>

            <button onClick={() => setShowCart(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}