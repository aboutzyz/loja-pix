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
                  ? "minmax(280px, 420px)"
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
            border-radius: 24px;
            background: rgba(20, 6, 40, 0.62);
            border: 1px solid rgba(216, 180, 254, 0.18);
            backdrop-filter: blur(16px);
            box-shadow: 0 14px 30px rgba(0, 0, 0, 0.26),
              0 0 24px rgba(168, 85, 247, 0.14);
          }

          .back {
            display: inline-flex;
            margin-bottom: 14px;
            color: #f3e8ff;
            text-decoration: none;
            font-weight: 800;
            font-size: 14px;
            padding: 9px 13px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(216, 180, 254, 0.18);
            box-shadow: 0 0 16px rgba(168, 85, 247, 0.16);
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
            border-radius: 15px;
            border: 1px solid rgba(216, 180, 254, 0.25);
            background: rgba(18, 12, 32, 0.82);
            color: #fff;
            outline: none;
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03),
              0 0 18px rgba(124, 58, 237, 0.15);
          }

          .products {
            display: grid;
            gap: 22px;
            padding: 22px;
            border-radius: 26px;
            background: rgba(0, 0, 0, 0.35);
            border: 1px solid rgba(168, 85, 247, 0.18);
            backdrop-filter: blur(14px);
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03),
              0 18px 45px rgba(0, 0, 0, 0.34);
          }

          .card {
            text-decoration: none;
            color: #fff;
            background: linear-gradient(
              180deg,
              rgba(18, 10, 40, 0.98),
              rgba(8, 5, 20, 0.98)
            );
            border: 1px solid rgba(168, 85, 247, 0.28);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45),
              0 0 18px rgba(168, 85, 247, 0.18);
            transition: border-color 0.2s ease, box-shadow 0.2s ease,
              transform 0.2s ease;
          }

          .card:hover {
            transform: translateY(-4px);
            border-color: rgba(216, 180, 254, 0.42);
            box-shadow: 0 24px 50px rgba(0, 0, 0, 0.5),
              0 0 28px rgba(168, 85, 247, 0.28);
          }

          .imageArea {
            height: 220px;
            position: relative;
            overflow: hidden;
            background: radial-gradient(
                circle at 50% 30%,
                rgba(168, 85, 247, 0.2),
                transparent 42%
              ),
              #08040f;
            border-bottom: 1px solid rgba(216, 180, 254, 0.12);
          }

          .imageArea::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(
              180deg,
              transparent 48%,
              rgba(8, 4, 15, 0.5) 100%
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
            padding: 18px;
            background: linear-gradient(
              180deg,
              rgba(20, 10, 42, 0.72),
              rgba(8, 5, 20, 0.92)
            );
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
            color: #e9d5ff;
            font-size: 12px;
            font-weight: 800;
            padding: 8px 11px;
            border-radius: 999px;
            background: rgba(168, 85, 247, 0.11);
            border: 1px solid rgba(216, 180, 254, 0.18);
            margin-bottom: 15px;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
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
            border-radius: 15px;
            background: linear-gradient(180deg, #b65cff 0%, #7c2bd9 100%);
            border: 1px solid rgba(216, 180, 254, 0.3);
            font-weight: 900;
            box-shadow: 0 0 20px rgba(126, 34, 206, 0.38),
              inset 0 1px 0 rgba(255, 255, 255, 0.16);
          }

          .empty {
            padding: 28px;
            border-radius: 22px;
            background: rgba(20, 6, 40, 0.55);
            border: 1px solid rgba(216, 180, 254, 0.14);
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
              border-radius: 20px;
            }

            h1 {
              font-size: 32px;
            }

            .searchBox {
              min-width: 0;
            }

            .products {
              gap: 13px;
              padding: 13px;
              border-radius: 20px;
            }

            .imageArea {
              height: 140px;
            }

            .info {
              padding: 11px;
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
            }
          }
        `}</style>
      </div>
    </>
  );
}