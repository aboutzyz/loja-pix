"use client";

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
  created_at?: string;
};

type CartItem = Product & {
  quantity: number;
};

const PRODUCTS_PER_PAGE = 6;

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [complement, setComplement] = useState("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    loadProducts();
    loadCart();
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  async function loadProducts() {
    const { data } = await supabase.from("products").select("*");
    setProducts((data as Product[]) || []);
  }

  function loadCart() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setShowCart(true);
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }

  function decreaseQuantity(productId: string) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function increaseQuantity(productId: string) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function clearCart() {
    setCart([]);
    localStorage.removeItem("cart");
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const cartTotal = cart.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0
  );

  function goToCheckout() {
    if (cart.length === 0) return alert("Carrinho vazio");
    setShowCheckout(true);
    setShowCart(false);
  }

  function finishOrder() {
    const message = `Pedido%0ATotal: ${formatPrice(cartTotal)}`;
    window.open(`https://wa.me/5541996265158?text=${message}`, "_blank");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#07050d,#120a22,#0a0614)",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(8,6,16,0.9)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(160,120,255,0.2)",
          padding: "16px 20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: 32 }}>💎 BOUT TEC</h1>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              placeholder="Pesquisar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: 10,
                borderRadius: 12,
                background: "#1a1333",
                color: "#fff",
                border: "1px solid #444",
              }}
            />

            <button
              onClick={() => setShowCart(!showCart)}
              style={{
                background: "linear-gradient(#7e22ce,#4c1d95)",
                color: "#fff",
                borderRadius: 12,
                padding: 10,
              }}
            >
              Carrinho ({cartCount})
            </button>
          </div>
        </div>
      </header>

      <main style={{ padding: 20 }}>
        <div style={{ display: "grid", gap: 20 }}>
          {paginatedProducts.map((p) => (
            <div
              key={p.id}
              style={{
                background: "#120a22",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <img src={p.image} style={{ maxWidth: 150 }} />
              <h3>{p.name}</h3>
              <p style={{ color: "#d8b4fe" }}>{formatPrice(p.price)}</p>

              <button
                onClick={() => addToCart(p)}
                style={{
                  background: "linear-gradient(#7e22ce,#4c1d95)",
                  color: "#fff",
                  borderRadius: 12,
                  padding: 10,
                  width: "100%",
                }}
              >
                Comprar
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}