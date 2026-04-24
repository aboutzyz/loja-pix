"use client";

import Header from "@/components/Header";
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

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function CategoryPage() {
  const params = useParams();
  const categoryId = String(params?.id ?? "");

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
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
  }, [categoryId]);

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
      console.error("Erro ao buscar produtos:", error);
      return;
    }

    setProducts((data as Product[]) || []);
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  return (
    <>
      <Header />

      <div className="page">
        <div className="gridBg" />

        <main className="container">
          <section className="top">
            <div>
              <Link href="/" className="back">
                ← Voltar para loja
              </Link>

              <h1>{category?.name || "Categoria"}</h1>

              <p>
                {filteredProducts.length} produto
                {filteredProducts.length === 1 ? "" : "s"} disponível
                {filteredProducts.length === 1 ? "" : "is"}
              </p>
            </div>

            <div className="searchBox">
              <input
                placeholder="Buscar produto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </section>

          {filteredProducts.length === 0 ? (
            <section className="empty">
              <h2>Nenhum produto encontrado</h2>
              <p>Tente pesquisar outro nome ou volte para a loja.</p>
            </section>
          ) : (
            <section
              className="products"
              style={{
                gridTemplateColumns: isMobile
                  ? "repeat(2, minmax(0, 1fr))"
                  : filteredProducts.length === 1
                  ? "minmax(280px, 430px)"
                  : "repeat(auto-fit, minmax(280px, 1fr))",
                justifyContent:
                  filteredProducts.length === 1 ? "center" : "initial",
              }}
            >
              {filteredProducts.map((product) => (
                <Link
                  href={`/produto/${product.id}`}
                  key={product.id}
                  className="card"
                >
                  <div className="imageArea">
                    <img src={product.image} alt={product.name} />
                  </div>

                  <div className="info">
                    <h3>{product.name}</h3>

                    <div className="price">
                      {formatPrice(Number(product.price))}
                    </div>

                    <div className="stock">
                      <span className="stockDot" />
                      {product.stock > 0
                        ? `Estoque disponível: ${product.stock}`
                        : "Produto sem estoque"}
                    </div>

                    <div className="button">Abrir produto</div>
                  </div>
                </Link>
              ))}
            </section>
          )}
        </main>

        <style jsx>{`
          .page {
            min-height: 100vh;
            position: relative;
            overflow: hidden;
            color: #fff;
            background: radial-gradient(
                circle at 25% 20%,
                rgba(168, 85, 247, 0.22),
                transparent 30%
              ),
              radial-gradient(
                circle at 85% 80%,
                rgba(124, 58, 237, 0.2),
                transparent 28%
              ),
              linear-gradient(180deg, #090114 0%, #100022 48%, #0a0117 100%);
          }

          .gridBg {
            position: absolute;
            inset: 0;
            background-image: linear-gradient(
                rgba(179, 77, 255, 0.1) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(179, 77, 255, 0.1) 1px,
                transparent 1px
              );
            background-size: 40px 40px;
            opacity: 0.45;
            pointer-events: none;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 28px 16px;
            position: relative;
            z-index: 1;
          }

          .top {
            display: flex;
            justify-content: space-between;
            gap: 18px;
            align-items: flex-end;
            margin-bottom: 22px;
            padding: 24px;
            border-radius: 30px;
            background: linear-gradient(
              135deg,
              rgba(28, 8, 55, 0.75),
              rgba(10, 4, 26, 0.72)
            );
            border: 1px solid rgba(216, 180, 254, 0.22);
            backdrop-filter: blur(16px);
            box-shadow: 0 14px 30px rgba(0, 0, 0, 0.26),
              0 0 30px rgba(168, 85, 247, 0.18);
          }

          .back {
            display: inline-flex;
            margin-bottom: 14px;
            color: #f3e8ff;
            text-decoration: none;
            font-weight: 900;
            font-size: 14px;
            padding: 10px 14px;
            border-radius: 999px;
            background: linear-gradient(
              180deg,
              rgba(168, 85, 247, 0.22),
              rgba(109, 40, 217, 0.16)
            );
            border: 1px solid rgba(216, 180, 254, 0.28);
            box-shadow: 0 0 18px rgba(168, 85, 247, 0.22);
          }

          h1 {
            margin: 0;
            font-size: 42px;
            line-height: 1;
            font-weight: 900;
            letter-spacing: -1px;
            text-shadow: 0 0 22px rgba(168, 85, 247, 0.45);
          }

          p {
            margin: 10px 0 0;
            color: #d8ccf3;
            font-size: 15px;
            font-weight: 600;
          }

          .searchBox {
            min-width: 280px;
          }

          input {
            width: 100%;
            padding: 13px 15px;
            border-radius: 18px;
            border: 1px solid rgba(216, 180, 254, 0.28);
            background: rgba(18, 12, 32, 0.82);
            color: #fff;
            outline: none;
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04),
              0 0 20px rgba(168, 85, 247, 0.18);
          }

          .products {
            display: grid;
            gap: 24px;
            padding: 24px;
            border-radius: 32px;
            background: linear-gradient(
              135deg,
              rgba(0, 0, 0, 0.45),
              rgba(30, 8, 65, 0.25)
            );
            border: 1px solid rgba(216, 180, 254, 0.22);
            backdrop-filter: blur(14px);
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.035),
              0 20px 50px rgba(0, 0, 0, 0.38),
              0 0 35px rgba(168, 85, 247, 0.12);
          }

          .card {
            position: relative;
            text-decoration: none;
            color: #fff;
            border-radius: 30px;
            padding: 2px;
            overflow: hidden;
            background: linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.34),
              rgba(216, 180, 254, 0.24),
              rgba(168, 85, 247, 0.9),
              rgba(88, 28, 135, 0.35)
            );
            box-shadow: 0 20px 42px rgba(0, 0, 0, 0.48),
              0 0 28px rgba(168, 85, 247, 0.24);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .card::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 30px;
            padding: 2px;
            background: linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.55),
              rgba(192, 132, 252, 0.2),
              rgba(168, 85, 247, 0.75),
              rgba(255, 255, 255, 0.12)
            );
            pointer-events: none;
            opacity: 0.65;
          }

          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 26px 55px rgba(0, 0, 0, 0.54),
              0 0 38px rgba(168, 85, 247, 0.38);
          }

          .imageArea {
            height: 220px;
            position: relative;
            overflow: hidden;
            border-radius: 28px 28px 0 0;
            background: radial-gradient(
                circle at 50% 30%,
                rgba(168, 85, 247, 0.24),
                transparent 42%
              ),
              #08040f;
            border-bottom: 1px solid rgba(216, 180, 254, 0.16);
          }

          .imageArea::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(
              180deg,
              transparent 48%,
              rgba(8, 4, 15, 0.52) 100%
            );
            pointer-events: none;
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .info {
            position: relative;
            z-index: 1;
            padding: 18px;
            border-radius: 0 0 28px 28px;
            background: linear-gradient(
              180deg,
              rgba(24, 10, 52, 0.96),
              rgba(8, 5, 20, 0.98)
            );
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
          }

          h3 {
            margin: 0 0 13px;
            font-size: 17px;
            line-height: 1.3;
            min-height: 44px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-shadow: 0 0 12px rgba(168, 85, 247, 0.18);
          }

          .price {
            font-size: 29px;
            line-height: 1;
            font-weight: 900;
            color: #f3e8ff;
            margin-bottom: 13px;
            text-shadow: 0 0 18px rgba(168, 85, 247, 0.32);
          }

          .stock {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #f0ddff;
            font-size: 12px;
            font-weight: 900;
            padding: 8px 11px;
            border-radius: 999px;
            background: linear-gradient(
              180deg,
              rgba(168, 85, 247, 0.18),
              rgba(88, 28, 135, 0.18)
            );
            border: 1px solid rgba(216, 180, 254, 0.24);
            margin-bottom: 15px;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12),
              0 0 16px rgba(168, 85, 247, 0.14);
          }

          .stockDot {
            width: 7px;
            height: 7px;
            border-radius: 999px;
            background: #c084fc;
            box-shadow: 0 0 12px rgba(192, 132, 252, 0.95);
          }

          .button {
            width: 100%;
            text-align: center;
            padding: 13px;
            border-radius: 18px;
            background: linear-gradient(180deg, #d946ef 0%, #9333ea 48%, #6d28d9 100%);
            border: 1px solid rgba(255, 255, 255, 0.22);
            font-weight: 900;
            color: white;
            box-shadow: 0 0 24px rgba(217, 70, 239, 0.35),
              inset 0 1px 0 rgba(255, 255, 255, 0.22);
          }

          .empty {
            padding: 28px;
            border-radius: 28px;
            background: rgba(20, 6, 40, 0.55);
            border: 1px solid rgba(216, 180, 254, 0.18);
            backdrop-filter: blur(16px);
            text-align: center;
          }

          .empty h2 {
            margin: 0;
            font-size: 24px;
          }

          @media (max-width: 768px) {
            .container {
              padding: 16px 10px;
            }

            .top {
              flex-direction: column;
              align-items: stretch;
              padding: 18px;
              border-radius: 24px;
            }

            h1 {
              font-size: 32px;
            }

            .searchBox {
              min-width: 0;
            }

            .products {
              gap: 14px;
              padding: 14px;
              border-radius: 24px;
            }

            .card {
              border-radius: 22px;
            }

            .imageArea {
              height: 140px;
              border-radius: 20px 20px 0 0;
            }

            .info {
              padding: 11px;
              border-radius: 0 0 20px 20px;
            }

            h3 {
              font-size: 13px;
              min-height: auto;
              -webkit-line-clamp: 3;
              margin-bottom: 9px;
            }

            .price {
              font-size: 19px;
              margin-bottom: 9px;
            }

            .stock {
              font-size: 10px;
              padding: 6px 8px;
              margin-bottom: 10px;
            }

            .button {
              font-size: 13px;
              padding: 10px;
              border-radius: 14px;
            }
          }
        `}</style>
      </div>
    </>
  );
}