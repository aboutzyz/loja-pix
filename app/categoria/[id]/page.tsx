"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Product = {
  id: string | number;
  name: string;
  price: number;
  image: string;
  stock: number;
  category_id?: string | number | null;
  created_at?: string;
};

type Category = {
  id: string | number;
  name: string;
  image: string;
  created_at?: string;
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

export default function CategoriaPage({
  params,
}: {
  params: { id: string };
}) {
  const categoryFilterValue = /^\d+$/.test(params.id)
    ? Number(params.id)
    : params.id;
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showMiniCart, setShowMiniCart] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadCategory();
    loadProducts();
    loadCart();
  }, [params.id]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  async function loadCategory() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", categoryFilterValue)
      .single();

    if (error) {
      console.error("Erro ao buscar categoria:", error);
      return;
    }

    setCategory(data as Category);
  }

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", categoryFilterValue)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar produtos da categoria:", error);
      return;
    }

    setProducts((data as Product[]) || []);
  }

  function loadCart() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }

  function addToCart(product: Product) {
    if ((product.stock ?? 0) <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        if (existing.quantity >= (product.stock ?? 0)) {
          return prev;
        }

        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });

    setLastAddedProduct(product);
    setShowMiniCart(true);
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const lastAddedQuantity =
    lastAddedProduct
      ? cart.find((item) => item.id === lastAddedProduct.id)?.quantity ?? 1
      : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 15% 20%, rgba(168,85,247,0.22), transparent 22%), radial-gradient(circle at 85% 22%, rgba(192,132,252,0.18), transparent 20%), radial-gradient(circle at 30% 75%, rgba(91,33,182,0.24), transparent 22%), radial-gradient(circle at 70% 80%, rgba(124,58,237,0.16), transparent 18%), linear-gradient(180deg, #05030b 0%, #12081f 48%, #08040f 100%)",
        color: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(8, 6, 16, 0.88)",
          color: "white",
          padding: "16px 20px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
          borderBottom: "1px solid rgba(168, 85, 247, 0.18)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              margin: 0,
              fontWeight: "bold",
              fontSize: 36,
              letterSpacing: "1px",
              color: "#ffffff",
              textShadow: "0 0 18px rgba(192, 132, 252, 0.35)",
              textDecoration: "none",
            }}
          >
            💎 BtTech
          </Link>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              placeholder="Pesquisar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid rgba(173, 133, 255, 0.25)",
                minWidth: 260,
                outline: "none",
                background: "rgba(18, 12, 32, 0.92)",
                color: "#fff",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
              }}
            />

            <Link
              href="/"
              style={{
                background: "linear-gradient(180deg, #7c3aed 0%, #4c1d95 100%)",
                color: "white",
                border: "1px solid rgba(196, 181, 253, 0.35)",
                borderRadius: 14,
                padding: "10px 14px",
                fontWeight: "bold",
                boxShadow: "0 0 18px rgba(124, 58, 237, 0.45)",
                textDecoration: "none",
              }}
            >
              Voltar
            </Link>

            <div
              style={{
                background: "linear-gradient(180deg, #7c3aed 0%, #4c1d95 100%)",
                color: "white",
                border: "1px solid rgba(196, 181, 253, 0.35)",
                borderRadius: 14,
                padding: "10px 14px",
                fontWeight: "bold",
                boxShadow: "0 0 18px rgba(124, 58, 237, 0.45)",
              }}
            >
              Carrinho ({cartCount})
            </div>
          </div>
        </div>
      </header>

      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: 20,
        }}
      >
        {category && (
          <section
            style={{
              position: "relative",
              border: "1px solid rgba(216, 180, 254, 0.16)",
              borderRadius: 28,
              overflow: "hidden",
              background: "rgba(12, 8, 24, 0.92)",
              minHeight: 240,
              boxShadow: "0 14px 30px rgba(0,0,0,0.30)",
              marginBottom: 28,
            }}
          >
            <img
              src={category.image}
              alt={category.name}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(10,6,20,0.10) 0%, rgba(10,6,20,0.18) 28%, rgba(10,6,20,0.92) 100%)",
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 2,
                padding: 24,
                minHeight: 240,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  width: "fit-content",
                  marginBottom: 10,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(12, 8, 24, 0.58)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  backdropFilter: "blur(8px)",
                  color: "#f3e8ff",
                  fontWeight: "bold",
                  fontSize: 12,
                }}
              >
                Categoria
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 42,
                  fontWeight: "bold",
                  color: "#ffffff",
                  lineHeight: 1.05,
                  textShadow: "0 2px 16px rgba(0,0,0,0.55)",
                  wordBreak: "break-word",
                }}
              >
                {category.name}
              </h1>
            </div>
          </section>
        )}

        <section style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: 30,
              marginBottom: 8,
              color: "#ffffff",
              textShadow: "0 0 12px rgba(168, 85, 247, 0.22)",
            }}
          >
            Produtos da categoria
          </h2>
          <p style={{ color: "#d1d5db", marginTop: 0, fontSize: 16 }}>
            Escolha seus produtos e adicione ao carrinho.
          </p>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 18,
            background: "rgba(10, 8, 20, 0.55)",
            border: "1px solid rgba(168, 85, 247, 0.12)",
            borderRadius: 24,
            padding: 22,
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          }}
        >
          {filteredProducts.map((product) => {
            const cartItem = cart.find((item) => item.id === product.id);
            const quantityInCart = cartItem?.quantity ?? 0;
            const remainingStock = Math.max((product.stock ?? 0) - quantityInCart, 0);

            return (
              <div
                key={product.id}
                style={{
                  width: "100%",
                  minWidth: 0,
                  background: "rgba(12, 8, 24, 0.92)",
                  borderRadius: 18,
                  overflow: "hidden",
                  boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
                  border: "1px solid rgba(159, 122, 234, 0.18)",
                }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(22,14,40,0.95) 0%, rgba(10,8,22,0.98) 100%)",
                    padding: 12,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 190,
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: "100%",
                      maxWidth: 160,
                      maxHeight: 160,
                      objectFit: "contain",
                      borderRadius: 12,
                    }}
                  />
                </div>

                <div style={{ padding: 16 }}>
                  <h3
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: 16,
                      lineHeight: 1.35,
                      minHeight: 44,
                      color: "#ffffff",
                      wordBreak: "break-word",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {product.name}
                  </h3>

                  <p
                    style={{
                      margin: "0 0 12px 0",
                      color: "#d8b4fe",
                      fontSize: 28,
                      fontWeight: "bold",
                      textShadow: "0 0 14px rgba(168, 85, 247, 0.22)",
                    }}
                  >
                    {formatPrice(Number(product.price))}
                  </p>

                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: 12,
                      color: "#d8b4fe",
                      fontWeight: "bold",
                    }}
                  >
                    {remainingStock > 0
                      ? `Estoque disponível: ${remainingStock}`
                      : "Sem estoque"}
                  </p>

                  <button
                    onClick={() => addToCart(product)}
                    disabled={remainingStock <= 0}
                    style={{
                      width: "100%",
                      background:
                        remainingStock <= 0
                          ? "linear-gradient(180deg, #3b2a55 0%, #241635 100%)"
                          : "linear-gradient(180deg, #8b2cf5 0%, #5b21b6 100%)",
                      color: "white",
                      border: "1px solid rgba(216, 180, 254, 0.28)",
                      borderRadius: 14,
                      padding: "12px 14px",
                      cursor: remainingStock <= 0 ? "not-allowed" : "pointer",
                      fontWeight: "bold",
                      fontSize: 16,
                      boxShadow:
                        "0 0 18px rgba(126, 34, 206, 0.38), inset 0 1px 0 rgba(255,255,255,0.12)",
                      letterSpacing: "0.2px",
                      opacity: remainingStock <= 0 ? 0.7 : 1,
                    }}
                  >
                    Comprar
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {showMiniCart && lastAddedProduct && (
        <div
          style={{
            position: "fixed",
            bottom: 10,
            right: 10,
            background: "linear-gradient(135deg, #6d28d9, #9333ea)",
            color: "white",
            padding: "8px 16px",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
            zIndex: 999,
            fontSize: 12,
            minWidth: 260,
            maxWidth: 320,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <strong style={{ fontSize: 12 }}>🛒 Produto adicionado</strong>
            <span style={{ fontSize: 11 }}>
              {lastAddedProduct.name} ({lastAddedQuantity})
            </span>
          </div>

          <button
            onClick={() => setShowMiniCart(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}