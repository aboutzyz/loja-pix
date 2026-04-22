"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

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

export default function CategoriaPage() {
  const params = useParams();
  const categoryId = String(params?.id ?? "");

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showMiniCart, setShowMiniCart] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
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
    if (!categoryId) return;
    loadCategory();
    loadProducts();
    loadCart();
  }, [categoryId]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  async function loadCategory() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", categoryId)
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
      .eq("category_id", categoryId)
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
        background: `
          radial-gradient(circle at 20% 30%, rgba(168,85,247,0.35), transparent 30%),
          radial-gradient(circle at 80% 20%, rgba(139,92,246,0.25), transparent 25%),
          radial-gradient(circle at 50% 80%, rgba(124,58,237,0.25), transparent 30%),
          linear-gradient(180deg, #020014 0%, #0b041a 50%, #020014 100%)
        `,
        color: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(8, 6, 16, 0.62)",
          color: "white",
          padding: isMobile ? "14px 12px" : "16px 20px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
          borderBottom: "1px solid rgba(168, 85, 247, 0.18)",
          backdropFilter: "blur(14px)",
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
              fontSize: isMobile ? 28 : 36,
              letterSpacing: "1px",
              color: "#ffffff",
              textShadow: "0 0 20px rgba(168, 85, 247, 0.75)",
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
              width: isMobile ? "100%" : "auto",
            }}
          >
            <input
              type="text"
              placeholder="Pesquisar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: isMobile ? "9px 10px" : "10px 12px",
                borderRadius: 14,
                border: "1px solid rgba(173, 133, 255, 0.25)",
                minWidth: isMobile ? 0 : 260,
                width: isMobile ? "100%" : 260,
                outline: "none",
                background: "rgba(18, 12, 32, 0.72)",
                color: "#fff",
                backdropFilter: "blur(12px)",
                boxShadow:
                  "inset 0 0 0 1px rgba(255,255,255,0.03), 0 0 16px rgba(124,58,237,0.14)",
              }}
            />

            <Link
              href="/"
              style={{
                background: "linear-gradient(180deg, #a855f7 0%, #6d28d9 100%)",
                color: "white",
                border: "1px solid rgba(196, 181, 253, 0.35)",
                borderRadius: 14,
                padding: isMobile ? "9px 12px" : "10px 14px",
                fontWeight: "bold",
                boxShadow: "0 0 26px rgba(168, 85, 247, 0.78)",
                textDecoration: "none",
                transition: "all 0.25s ease",
              }}
            >
              Voltar
            </Link>

            <div
              style={{
                background: "linear-gradient(180deg, #a855f7 0%, #6d28d9 100%)",
                color: "white",
                border: "1px solid rgba(196, 181, 253, 0.35)",
                borderRadius: 14,
                padding: isMobile ? "9px 12px" : "10px 14px",
                fontWeight: "bold",
                boxShadow: "0 0 26px rgba(168, 85, 247, 0.78)",
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
          padding: isMobile ? 12 : 20,
          position: "relative",
          zIndex: 1,
        }}
      >
        {category && (
          <section
            className="fade-in"
            style={{
              position: "relative",
              border: "1px solid rgba(216, 180, 254, 0.16)",
              borderRadius: 28,
              overflow: "hidden",
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(16px)",
              minHeight: isMobile ? 180 : 240,
              boxShadow: "0 14px 30px rgba(0,0,0,0.30), 0 0 24px rgba(124,58,237,0.16)",
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
                padding: isMobile ? 16 : 24,
                minHeight: isMobile ? 180 : 240,
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
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  backdropFilter: "blur(10px)",
                  color: "#f3e8ff",
                  fontWeight: "bold",
                  fontSize: 12,
                  boxShadow: "0 0 16px rgba(168,85,247,0.18)",
                }}
              >
                Categoria
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: isMobile ? 28 : 42,
                  fontWeight: "bold",
                  color: "#ffffff",
                  lineHeight: 1.05,
                  textShadow:
                    "0 0 22px rgba(168,85,247,0.55), 0 2px 16px rgba(0,0,0,0.55)",
                  wordBreak: "break-word",
                }}
              >
                {category.name}
              </h1>
            </div>
          </section>
        )}

        <section className="fade-in" style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: isMobile ? 24 : 30,
              marginBottom: 8,
              color: "#ffffff",
              textShadow: "0 0 20px rgba(168, 85, 247, 0.68)",
            }}
          >
            Produtos da categoria
          </h2>
          <p style={{ color: "#d1d5db", marginTop: 0, fontSize: isMobile ? 14 : 16 }}>
            Escolha seus produtos e adicione ao carrinho.
          </p>
          <div style={{ color: "#fff", marginTop: 10, fontSize: 14 }}>
            Produtos encontrados: {filteredProducts.length}
          </div>
        </section>

        {filteredProducts.length === 0 ? (
          <section
            className="fade-in"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(168, 85, 247, 0.12)",
              borderRadius: 24,
              padding: 22,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25), 0 0 24px rgba(124,58,237,0.16)",
              color: "#fff",
              fontSize: 18,
            }}
          >
            Nenhum produto encontrado nessa categoria.
          </section>
        ) : (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(2, minmax(0, 1fr))"
                : "repeat(auto-fit, minmax(220px, 1fr))",
              gap: isMobile ? 12 : 18,
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(168, 85, 247, 0.12)",
              borderRadius: 24,
              padding: isMobile ? 12 : 22,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25), 0 0 24px rgba(124,58,237,0.16)",
            }}
          >
            {filteredProducts.map((product) => {
              const cartItem = cart.find((item) => item.id === product.id);
              const quantityInCart = cartItem?.quantity ?? 0;
              const remainingStock = Math.max((product.stock ?? 0) - quantityInCart, 0);

              return (
                <div
                  key={product.id}
                  className="fade-in"
                  style={{
                    width: "100%",
                    minWidth: 0,
                    maxWidth: "100%",
                    background: "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(14px)",
                    borderRadius: isMobile ? 14 : 18,
                    overflow: "hidden",
                    boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
                    border: "1px solid rgba(159, 122, 234, 0.18)",
                    transition: "all 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                      e.currentTarget.style.boxShadow = "0 0 30px rgba(168, 85, 247, 0.8)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "0 14px 30px rgba(0,0,0,0.35)";
                    }
                  }}
                >
                  <div
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(22,14,40,0.95) 0%, rgba(10,8,22,0.98) 100%)",
                      padding: isMobile ? 10 : 12,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: isMobile ? 120 : 190,
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: "100%",
                        maxWidth: isMobile ? 95 : 160,
                        maxHeight: isMobile ? 95 : 160,
                        objectFit: "contain",
                        borderRadius: 12,
                      }}
                    />
                  </div>

                  <div style={{ padding: isMobile ? 10 : 16 }}>
                    <h3
                      style={{
                        margin: "0 0 8px 0",
                        fontSize: isMobile ? 14 : 16,
                        lineHeight: 1.35,
                        minHeight: isMobile ? "auto" : 44,
                        color: "#ffffff",
                        wordBreak: "break-word",
                        display: "-webkit-box",
                        WebkitLineClamp: isMobile ? 4 : 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textShadow: "0 0 14px rgba(168,85,247,0.18)",
                      }}
                    >
                      {product.name}
                    </h3>

                    <p
                      style={{
                        margin: "0 0 12px 0",
                        color: "#d8b4fe",
                        fontSize: isMobile ? 18 : 28,
                        fontWeight: "bold",
                        textShadow: "0 0 18px rgba(168, 85, 247, 0.42)",
                      }}
                    >
                      {formatPrice(Number(product.price))}
                    </p>

                    <p
                      style={{
                        margin: "0 0 8px 0",
                        fontSize: isMobile ? 11 : 12,
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
                            : "linear-gradient(180deg, #a855f7 0%, #6d28d9 100%)",
                        color: "white",
                        border: "1px solid rgba(216, 180, 254, 0.28)",
                        borderRadius: 14,
                        padding: isMobile ? "10px 10px" : "12px 14px",
                        cursor: remainingStock <= 0 ? "not-allowed" : "pointer",
                        fontWeight: "bold",
                        fontSize: isMobile ? 14 : 16,
                        boxShadow:
                          remainingStock <= 0
                            ? "0 0 18px rgba(59,42,85,0.35)"
                            : "0 0 30px rgba(168, 85, 247, 0.9)",
                        letterSpacing: "0.2px",
                        opacity: remainingStock <= 0 ? 0.7 : 1,
                        transition: "all 0.25s ease",
                      }}
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </main>

      {showMiniCart && lastAddedProduct && (
        <div
          className="fade-in"
          style={{
            position: "fixed",
            bottom: 12,
            right: 12,
            background: "linear-gradient(135deg, rgba(109,40,217,0.95), rgba(147,51,234,0.95))",
            color: "white",
            padding: isMobile ? "8px 12px" : "10px 16px",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 0 28px rgba(168,85,247,0.65)",
            zIndex: 999,
            fontSize: 12,
            minWidth: isMobile ? 220 : 260,
            maxWidth: isMobile ? 280 : 320,
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <strong style={{ fontSize: 12, textShadow: "0 0 10px rgba(255,255,255,0.25)" }}>
              🛒 Produto adicionado
            </strong>
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

      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.6s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}