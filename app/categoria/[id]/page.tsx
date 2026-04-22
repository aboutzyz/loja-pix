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
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  category_id?: string | null;
  created_at?: string;
};

type Category = {
  id: string;
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
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateLayout = () => setIsMobile(window.innerWidth <= 768);
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

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `
          radial-gradient(circle at 25% 20%, rgba(170, 60, 255, 0.22), transparent 30%),
          radial-gradient(circle at 85% 82%, rgba(208, 80, 255, 0.2), transparent 25%),
          linear-gradient(180deg, #090114 0%, #100022 48%, #0a0117 100%)
        `,
        color: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(179, 77, 255, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(179, 77, 255, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          opacity: 0.6,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

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
              fontSize: isMobile ? 24 : 36,
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
                  "inset 0 0 0 1px rgba(255,255,255,0.03), 0 0 16px rgba(124,58,237,0.18)",
              }}
            />

            <div
              style={{
                background: "linear-gradient(180deg, #a855f7 0%, #6d28d9 100%)",
                color: "white",
                border: "1px solid rgba(196, 181, 253, 0.35)",
                borderRadius: 14,
                padding: isMobile ? "9px 12px" : "10px 14px",
                fontWeight: "bold",
                boxShadow: "0 0 26px rgba(168, 85, 247, 0.82)",
                width: isMobile ? "100%" : "auto",
                textAlign: "center",
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
            style={{
              position: "relative",
              border: "1px solid rgba(216, 180, 254, 0.16)",
              borderRadius: 28,
              overflow: "hidden",
              background: "rgba(20, 6, 40, 0.7)",
              backdropFilter: "blur(16px)",
              minHeight: isMobile ? 190 : 240,
              boxShadow:
                "0 14px 30px rgba(0,0,0,0.30), 0 0 24px rgba(124,58,237,0.16)",
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
                  "linear-gradient(180deg, rgba(10,6,20,0.08) 0%, rgba(10,6,20,0.15) 28%, rgba(10,6,20,0.92) 100%)",
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 2,
                padding: isMobile ? 18 : 24,
                minHeight: isMobile ? 190 : 240,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: isMobile ? 30 : 42,
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

        <section style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: isMobile ? 22 : 30,
              marginBottom: 8,
              color: "#ffffff",
              textShadow: "0 0 12px rgba(168, 85, 247, 0.22)",
            }}
          >
            Produtos
          </h2>
          <p
            style={{
              color: "#d1d5db",
              marginTop: 0,
              fontSize: isMobile ? 15 : 16,
            }}
          >
            Clique no produto para abrir a página dele.
          </p>
          <div style={{ color: "#fff", marginTop: 10, fontSize: 14 }}>
            Produtos encontrados: {filteredProducts.length}
          </div>
        </section>

        {filteredProducts.length === 0 ? (
          <section
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(168, 85, 247, 0.12)",
              borderRadius: 24,
              padding: 22,
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.25), 0 0 24px rgba(124,58,237,0.16)",
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
                : "repeat(3, minmax(0, 1fr))",
              gap: isMobile ? 12 : 18,
              background: "rgba(10, 8, 20, 0.55)",
              border: "1px solid rgba(168, 85, 247, 0.12)",
              borderRadius: isMobile ? 18 : 24,
              padding: isMobile ? 12 : 22,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              backdropFilter: "blur(14px)",
            }}
          >
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/produto/${product.id}`}
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,
                  background: "rgba(12, 8, 24, 0.92)",
                  borderRadius: isMobile ? 14 : 18,
                  overflow: "hidden",
                  boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
                  border: "1px solid rgba(159, 122, 234, 0.18)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow =
                    "0 0 30px rgba(168, 85, 247, 0.45)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 14px 30px rgba(0,0,0,0.35)";
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
                      maxWidth: isMobile ? 92 : 160,
                      maxHeight: isMobile ? 92 : 160,
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
                      WebkitLineClamp: isMobile ? 5 : 3,
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
                      fontSize: isMobile ? 18 : 28,
                      fontWeight: "bold",
                      textShadow: "0 0 14px rgba(168, 85, 247, 0.22)",
                    }}
                  >
                    {formatPrice(Number(product.price))}
                  </p>

                  <p
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: isMobile ? 11 : 12,
                      color: "#d8b4fe",
                      fontWeight: "bold",
                    }}
                  >
                    {product.stock > 0
                      ? `Estoque disponível: ${product.stock}`
                      : "Sem estoque"}
                  </p>

                  <div
                    style={{
                      width: "100%",
                      background:
                        "linear-gradient(180deg, #8b2cf5 0%, #5b21b6 100%)",
                      color: "white",
                      border: "1px solid rgba(216, 180, 254, 0.28)",
                      borderRadius: isMobile ? 12 : 14,
                      padding: isMobile ? "10px 10px" : "12px 14px",
                      fontWeight: "bold",
                      fontSize: isMobile ? 14 : 16,
                      boxShadow:
                        "0 0 18px rgba(126, 34, 206, 0.38), inset 0 1px 0 rgba(255,255,255,0.12)",
                      letterSpacing: "0.2px",
                      textAlign: "center",
                    }}
                  >
                    Abrir produto
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}