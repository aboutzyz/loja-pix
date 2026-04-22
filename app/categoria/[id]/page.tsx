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
};

type Category = {
  id: string | number;
  name: string;
  image: string;
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
    setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", () =>
      setIsMobile(window.innerWidth <= 768)
    );
  }, []);

  useEffect(() => {
    loadCategory();
    loadProducts();
    loadCart();
  }, [categoryId]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  async function loadCategory() {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("id", categoryId)
      .single();

    setCategory(data);
  }

  async function loadProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", categoryId);

    setProducts(data || []);
  }

  function loadCart() {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }

  function addToCart(product: Product) {
    if ((product.stock ?? 0) <= 0) return;

    setCart((prev) => {
      const exist = prev.find((i) => i.id === product.id);
      if (exist) {
        if (exist.quantity >= product.stock) return prev;
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `
          radial-gradient(circle at 25% 20%, rgba(170,60,255,0.2), transparent),
          linear-gradient(180deg,#090114,#100022)
        `,
        position: "relative",
      }}
    >
      {/* QUADRICULADO */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(179,77,255,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(179,77,255,0.12) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          opacity: 0.5,
        }}
      />

      {/* HEADER */}
      <header
        style={{
          padding: "15px",
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(168,85,247,0.2)",
        }}
      >
        <Link href="/" style={{ color: "#fff", fontWeight: "bold" }}>
          ← Início
        </Link>
      </header>

      <main style={{ padding: 20 }}>
        <h1 style={{ color: "#fff" }}>
          {category?.name || "Categoria"}
        </h1>

        <input
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 12,
            marginTop: 10,
            background: "rgba(255,255,255,0.05)",
            color: "#fff",
            border: "1px solid rgba(168,85,247,0.3)",
          }}
        />

        <div
          style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)",
            gap: 15,
          }}
        >
          {filteredProducts.map((product) => {
            const inCart =
              cart.find((i) => i.id === product.id)?.quantity || 0;
            const estoque = product.stock - inCart;

            return (
              <div
                key={product.id}
                style={{
                  background: "rgba(20,6,40,0.7)",
                  border: "1px solid rgba(168,85,247,0.3)",
                  borderRadius: 18,
                  padding: 10,
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 0 20px rgba(168,85,247,0.2)",
                }}
              >
                <img
                  src={product.image}
                  style={{
                    width: "100%",
                    height: 120,
                    objectFit: "contain",
                  }}
                />

                <h3 style={{ color: "#fff", fontSize: 14 }}>
                  {product.name}
                </h3>

                <p style={{ color: "#d8b4fe", fontWeight: "bold" }}>
                  {formatPrice(product.price)}
                </p>

                <p style={{ color: "#aaa", fontSize: 12 }}>
                  {estoque > 0
                    ? `Estoque: ${estoque}`
                    : "Sem estoque"}
                </p>

                <button
                  onClick={() => addToCart(product)}
                  disabled={estoque <= 0}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 12,
                    background:
                      estoque <= 0
                        ? "#333"
                        : "linear-gradient(#a855f7,#6d28d9)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Comprar
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}