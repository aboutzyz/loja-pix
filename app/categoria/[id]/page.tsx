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
                ← Voltar
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
                  : "repeat(3, minmax(0, 1fr))",
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

                    <strong>{formatPrice(Number(product.price))}</strong>

                    <span>
                      {product.stock > 0
                        ? `Estoque: ${product.stock}`
                        : "Sem estoque"}
                    </span>

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
                rgba(168, 85, 247, 0.2),
                transparent 30%
              ),
              radial-gradient(
                circle at 85% 80%,
                rgba(124, 58, 237, 0.16),
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
            padding: 22px;
            border-radius: 24px;
            background: rgba(20, 6, 40, 0.55);
            border: 1px solid rgba(216, 180, 254, 0.14);
            backdrop-filter: blur(16px);
            box-shadow: 0 14px 30px rgba(0, 0, 0, 0.22);
          }

          .back {
            display: inline-block;
            margin-bottom: 14px;
            color: #d8b4fe;
            text-decoration: none;
            font-weight: 700;
            font-size: 14px;
          }

          h1 {
            margin: 0;
            font-size: 42px;
            line-height: 1;
            font-weight: 900;
            letter-spacing: -1px;
          }

          p {
            margin: 10px 0 0;
            color: #cfc6e8;
            font-size: 15px;
          }

          .searchBox {
            min-width: 280px;
          }

          input {
            width: 100%;
            padding: 12px 14px;
            border-radius: 14px;
            border: 1px solid rgba(216, 180, 254, 0.18);
            background: rgba(18, 12, 32, 0.78);
            color: #fff;
            outline: none;
          }

          .products {
            display: grid;
            gap: 16px;
            padding: 18px;
            border-radius: 24px;
            background: rgba(10, 8, 20, 0.52);
            border: 1px solid rgba(168, 85, 247, 0.1);
            backdrop-filter: blur(14px);
          }

          .card {
            text-decoration: none;
            color: #fff;
            background: rgba(12, 8, 24, 0.92);
            border: 1px solid rgba(216, 180, 254, 0.12);
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 12px 26px rgba(0, 0, 0, 0.28);
            transition: border-color 0.2s ease, box-shadow 0.2s ease,
              background 0.2s ease;
          }

          .card:hover {
            border-color: rgba(216, 180, 254, 0.28);
            box-shadow: 0 16px 32px rgba(0, 0, 0, 0.34);
            background: rgba(18, 10, 34, 0.96);
          }

          .imageArea {
            min-height: 180px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            background: linear-gradient(
              180deg,
              rgba(22, 14, 40, 0.95),
              rgba(10, 8, 22, 0.98)
            );
          }

          img {
            width: 100%;
            max-width: 155px;
            max-height: 155px;
            object-fit: contain;
          }

          .info {
            padding: 16px;
          }

          h3 {
            margin: 0 0 10px;
            font-size: 16px;
            line-height: 1.35;
            min-height: 44px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          strong {
            display: block;
            font-size: 25px;
            color: #d8b4fe;
            margin-bottom: 8px;
          }

          span {
            display: block;
            color: #bda9e9;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 12px;
          }

          .button {
            width: 100%;
            text-align: center;
            padding: 11px;
            border-radius: 13px;
            background: linear-gradient(180deg, #8b2cf5 0%, #5b21b6 100%);
            border: 1px solid rgba(216, 180, 254, 0.22);
            font-weight: 800;
            box-shadow: 0 0 16px rgba(126, 34, 206, 0.28);
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
              gap: 12px;
              padding: 12px;
              border-radius: 18px;
            }

            .imageArea {
              min-height: 120px;
              padding: 10px;
            }

            img {
              max-width: 92px;
              max-height: 92px;
            }

            .info {
              padding: 10px;
            }

            h3 {
              font-size: 13px;
              min-height: auto;
              -webkit-line-clamp: 3;
            }

            strong {
              font-size: 18px;
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