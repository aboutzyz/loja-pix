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
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("id", categoryId)
      .single();

    setCategory(data as Category);
  }

  async function loadProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false });

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
              <p>Tente pesquisar outro nome.</p>
            </section>
          ) : (
            <section
              className="products"
              style={{
                gridTemplateColumns: isMobile
                  ? "repeat(2, 1fr)"
                  : "repeat(auto-fit, minmax(260px, 1fr))",
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

                    <strong>{formatPrice(product.price)}</strong>

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
            color: #fff;
            background: linear-gradient(180deg, #090114, #0a0117);
          }

          .gridBg {
            position: absolute;
            inset: 0;
            background-size: 40px 40px;
            opacity: 0.3;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }

          .top {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }

          .products {
            display: grid;
            gap: 18px;
          }

          /* 🔥 CARD V5 */
          .card {
            border-radius: 20px;
            overflow: hidden;
            background: rgba(15, 10, 30, 0.9);
            border: 1px solid rgba(168, 85, 247, 0.15);
            box-shadow: 0 0 25px rgba(124, 58, 237, 0.25);
            transition: all 0.25s ease;
          }

          .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 0 35px rgba(168, 85, 247, 0.6);
          }

          /* IMAGEM FULL */
          .imageArea {
            height: 200px;
            overflow: hidden;
            background: #000;
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: cover; /* 🔥 PREENCHE 100% */
            transition: transform 0.3s ease;
          }

          .card:hover img {
            transform: scale(1.05);
          }

          .info {
            padding: 16px;
          }

          h3 {
            font-size: 15px;
            margin-bottom: 8px;
          }

          strong {
            font-size: 22px;
            color: #c084fc;
          }

          span {
            font-size: 12px;
            opacity: 0.7;
          }

          .button {
            margin-top: 12px;
            padding: 10px;
            text-align: center;
            border-radius: 12px;
            background: linear-gradient(180deg, #8b2cf5, #5b21b6);
            font-weight: bold;
          }
        `}</style>
      </div>
    </>
  );
}