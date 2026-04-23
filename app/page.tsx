"use client";

import Header from "@/components/Header";
import Link from "next/link";
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

const PRODUCTS_PER_PAGE = 9;

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showMiniCart, setShowMiniCart] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(null);

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

  const [columns, setColumns] = useState(3);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadCart();
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    function updateLayout() {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setColumns(mobile ? 2 : 3);
    }

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar produtos:", error);
      return;
    }

    setProducts((data as Product[]) || []);
  }

  async function loadCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar categorias:", error);
      return;
    }

    setCategories((data as Category[]) || []);
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
      prev.map((item) => {
        if (item.id !== productId) return item;

        const currentProduct = products.find((product) => product.id === productId);
        const availableStock = currentProduct?.stock ?? item.stock ?? 0;

        if (item.quantity >= availableStock) {
          return item;
        }

        return { ...item, quantity: item.quantity + 1 };
      })
    );
  }

  function clearCart() {
    setCart([]);
    localStorage.removeItem("cart");
    setShowMiniCart(false);
  }

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        !product.category_id &&
        product.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const cartTotal = cart.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0
  );

  const lastAddedQuantity =
    lastAddedProduct
      ? cart.find((item) => item.id === lastAddedProduct.id)?.quantity ?? 1
      : 0;

  function goToCheckout() {
    if (cart.length === 0) {
      alert("Seu carrinho está vazio.");
      return;
    }

    setShowCheckout(true);
    setShowCart(false);
    setShowMiniCart(false);

    setTimeout(() => {
      const checkoutSection = document.getElementById("checkout");
      checkoutSection?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function openCartArea() {
    setShowCart(true);
    setShowCheckout(false);
    setShowMiniCart(false);

    setTimeout(() => {
      const cartSection = document.getElementById("cart-area");
      cartSection?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function finishOrder() {
    if (
      !customerName ||
      !customerPhone ||
      !address ||
      !number ||
      !district ||
      !city ||
      !stateName
    ) {
      alert("Preencha os campos obrigatórios do endereço.");
      return;
    }

    const itemsText = cart
      .map(
        (item) =>
          `- ${item.name} | Qtd: ${item.quantity} | ${formatPrice(
            Number(item.price) * item.quantity
          )}`
      )
      .join("%0A");

    const message =
      `Novo pedido%0A%0A` +
      `Nome: ${customerName}%0A` +
      `Telefone: ${customerPhone}%0A` +
      `Email: ${customerEmail || "Não informado"}%0A%0A` +
      `Endereço:%0A` +
      `${address}, ${number}%0A` +
      `Bairro: ${district}%0A` +
      `Cidade: ${city} - ${stateName}%0A` +
      `CEP: ${cep || "Não informado"}%0A` +
      `Complemento: ${complement || "Não informado"}%0A` +
      `Referência: ${reference || "Não informado"}%0A%0A` +
      `Itens:%0A${itemsText}%0A%0A` +
      `Total: ${formatPrice(cartTotal)}`;

    window.open(`https://wa.me/5541996265158?text=${message}`, "_blank");
  }

  return (
    <>
      <Header />

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

        <section
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1200,
            margin: "0 auto",
            padding: isMobile ? "24px 12px 18px 12px" : "40px 20px 24px 20px",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.05fr 0.95fr",
            gap: isMobile ? 16 : 24,
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              background: "rgba(20, 6, 40, 0.58)",
              border: "1px solid rgba(168, 85, 247, 0.16)",
              borderRadius: isMobile ? 22 : 28,
              padding: isMobile ? 22 : 30,
              backdropFilter: "blur(16px)",
              boxShadow:
                "0 14px 30px rgba(0,0,0,0.28), 0 0 24px rgba(124,58,237,0.14)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minHeight: isMobile ? "auto" : 320,
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? 38 : 62,
                lineHeight: 0.96,
                fontWeight: 900,
                color: "#ffffff",
                textShadow:
                  "0 0 24px rgba(168,85,247,0.42), 0 2px 16px rgba(0,0,0,0.34)",
              }}
            >
              BoutBux
            </h1>

            <p
              style={{
                marginTop: 14,
                marginBottom: 0,
                fontSize: isMobile ? 16 : 20,
                lineHeight: 1.5,
                color: "#e9ddff",
                maxWidth: 580,
                fontWeight: 600,
              }}
            >
              Escolha sua categoria e compre com rapidez.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gap: 14,
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              alignContent: "stretch",
            }}
          >
            <div
              style={{
                ...heroMiniCard,
                gridColumn: isMobile ? "auto" : "1 / span 2",
              }}
            >
              <div style={miniIcon}>⚡</div>
              <div>
                <div style={miniTitle}>Pix imediato</div>
                <div style={miniText}>Pagamento rápido e visual moderno na loja.</div>
              </div>
            </div>

            <div style={heroMiniCard}>
              <div style={miniIcon}>🛡️</div>
              <div>
                <div style={miniTitle}>Compra segura</div>
                <div style={miniText}>Fluxo simples e organizado para comprar.</div>
              </div>
            </div>

            <div style={heroMiniCard}>
              <div style={miniIcon}>🚀</div>
              <div>
                <div style={miniTitle}>Entrega rápida</div>
                <div style={miniText}>Escolha produtos digitais com acesso fácil.</div>
              </div>
            </div>
          </div>
        </section>

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
            <h1
              style={{
                margin: 0,
                fontWeight: "bold",
                fontSize: isMobile ? 24 : 36,
                letterSpacing: "1px",
                color: "#ffffff",
                textShadow: "0 0 20px rgba(168, 85, 247, 0.75)",
              }}
            >
              💎 BoutBux
            </h1>

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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
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

              <button
                onClick={() => {
                  setShowCart(!showCart);
                  setShowCheckout(false);
                  setShowMiniCart(false);
                }}
                style={{
                  background: "linear-gradient(180deg, #a855f7 0%, #6d28d9 100%)",
                  color: "white",
                  border: "1px solid rgba(196, 181, 253, 0.35)",
                  borderRadius: 14,
                  padding: isMobile ? "9px 12px" : "10px 14px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  boxShadow: "0 0 26px rgba(168, 85, 247, 0.82)",
                  width: isMobile ? "100%" : "auto",
                  transition: "all 0.25s ease",
                }}
              >
                Carrinho ({cartCount})
              </button>
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
          {!showCheckout && (
            <>
              {categories.length > 0 && (
                <section id="categorias-home" className="fade-in" style={{ marginBottom: 28 }}>
                  <section style={{ marginBottom: 18 }}>
                    <h2
                      style={{
                        fontSize: isMobile ? 22 : 30,
                        marginBottom: 8,
                        color: "#ffffff",
                        textShadow: "0 0 12px rgba(168, 85, 247, 0.22)",
                      }}
                    >
                      Categorias
                    </h2>
                    <p style={{ color: "#d1d5db", marginTop: 0, fontSize: isMobile ? 15 : 16 }}>
                      Navegue pelas categorias com o mesmo estilo premium da loja.
                    </p>
                  </section>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "1fr"
                        : "repeat(auto-fit, minmax(260px, 1fr))",
                      gap: 16,
                    }}
                  >
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/categoria/${category.id}`}
                        className="fade-in"
                        style={{
                          position: "relative",
                          border: "1px solid rgba(216, 180, 254, 0.16)",
                          borderRadius: 24,
                          overflow: "hidden",
                          padding: 0,
                          cursor: "pointer",
                          background: "rgba(20, 6, 40, 0.7)",
                          backdropFilter: "blur(16px)",
                          minHeight: isMobile ? 180 : 220,
                          textAlign: "left",
                          boxShadow: "0 0 25px rgba(168, 85, 247, 0.25)",
                          transition: "all 0.25s ease",
                          textDecoration: "none",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-6px) scale(1.015)";
                          e.currentTarget.style.boxShadow = "0 0 30px rgba(168, 85, 247, 0.75)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = "0 0 25px rgba(168, 85, 247, 0.25)";
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
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-end",
                            padding: isMobile ? 16 : 18,
                          }}
                        >
                          <div
                            style={{
                              fontSize: isMobile ? 24 : 30,
                              fontWeight: "bold",
                              color: "#ffffff",
                              lineHeight: 1.05,
                              textShadow:
                                "0 0 22px rgba(168,85,247,0.55), 0 2px 16px rgba(0,0,0,0.55)",
                              wordBreak: "break-word",
                            }}
                          >
                            {category.name}
                          </div>

                          <div
                            style={{
                              marginTop: 10,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              width: "fit-content",
                              padding: "8px 12px",
                              borderRadius: 12,
                              background: "rgba(255,255,255,0.10)",
                              color: "#ffffff",
                              fontWeight: "bold",
                              fontSize: 13,
                              backdropFilter: "blur(10px)",
                              boxShadow: "0 0 18px rgba(168, 85, 247, 0.28)",
                            }}
                          >
                            Abrir categoria
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {filteredProducts.length > 0 && (
                <>
                  <section id="produtos-home" style={{ marginBottom: 24 }}>
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
                    <p style={{ color: "#d1d5db", marginTop: 0, fontSize: isMobile ? 15 : 16 }}>
                      Escolha seus produtos e adicione ao carrinho.
                    </p>
                  </section>

                  <section
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                      gap: isMobile ? 12 : 18,
                      background: "rgba(10, 8, 20, 0.55)",
                      border: "1px solid rgba(168, 85, 247, 0.12)",
                      borderRadius: isMobile ? 18 : 24,
                      padding: isMobile ? 12 : 22,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                      backdropFilter: "blur(14px)",
                    }}
                  >
                    {paginatedProducts.map((product) => {
                      const cartItem = cart.find((item) => item.id === product.id);
                      const quantityInCart = cartItem?.quantity ?? 0;
                      const remainingStock = Math.max((product.stock ?? 0) - quantityInCart, 0);

                      return (
                        <div
                          key={product.id}
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
                                    : "linear-gradient(180deg, #8b2cf5 0%, #5b21b6 100%)",
                                color: "white",
                                border: "1px solid rgba(216, 180, 254, 0.28)",
                                borderRadius: isMobile ? 12 : 14,
                                padding: isMobile ? "10px 10px" : "12px 14px",
                                cursor: remainingStock <= 0 ? "not-allowed" : "pointer",
                                fontWeight: "bold",
                                fontSize: isMobile ? 14 : 16,
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

                  <section
                    style={{
                      marginTop: 28,
                      display: "flex",
                      justifyContent: "center",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: isMobile ? "9px 12px" : "10px 14px",
                        borderRadius: 12,
                        border: "1px solid rgba(196, 181, 253, 0.22)",
                        background:
                          currentPage === 1
                            ? "rgba(60, 60, 70, 0.6)"
                            : "rgba(18, 12, 32, 0.92)",
                        color: "#fff",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      }}
                    >
                      Página anterior
                    </button>

                    <div
                      style={{
                        padding: isMobile ? "9px 12px" : "10px 14px",
                        borderRadius: 12,
                        background: "linear-gradient(180deg, #1b102f 0%, #0f0a1f 100%)",
                        color: "white",
                        fontWeight: "bold",
                        border: "1px solid rgba(168, 85, 247, 0.18)",
                      }}
                    >
                      Página {currentPage} de {totalPages}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      style={{
                        padding: isMobile ? "9px 12px" : "10px 14px",
                        borderRadius: 12,
                        border: "1px solid rgba(196, 181, 253, 0.22)",
                        background:
                          currentPage === totalPages
                            ? "rgba(60, 60, 70, 0.6)"
                            : "rgba(18, 12, 32, 0.92)",
                        color: "#fff",
                        cursor:
                          currentPage === totalPages ? "not-allowed" : "pointer",
                      }}
                    >
                      Próxima página
                    </button>
                  </section>
                </>
              )}
            </>
          )}

          {showCart && !showCheckout && (
            <section
              id="cart-area"
              className="fade-in"
              style={{
                marginTop: 30,
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(16px)",
                borderRadius: 20,
                padding: 20,
                boxShadow: "0 10px 32px rgba(0,0,0,0.28), 0 0 24px rgba(124,58,237,0.16)",
                border: "1px solid rgba(168, 85, 247, 0.16)",
              }}
            >
              <h2 style={{ marginTop: 0, color: "#fff", textShadow: "0 0 16px rgba(168,85,247,0.5)" }}>
                Seu Carrinho
              </h2>

              {cart.length === 0 ? (
                <p style={{ color: "#d1d5db" }}>Seu carrinho está vazio.</p>
              ) : (
                <>
                  <div style={{ display: "grid", gap: 14 }}>
                    {cart.map((item) => {
                      const currentProduct = products.find((product) => product.id === item.id);
                      const availableStock = currentProduct?.stock ?? item.stock ?? 0;
                      const reachedStockLimit = item.quantity >= availableStock;

                      return (
                        <div
                          key={item.id}
                          className="fade-in"
                          style={{
                            display: "flex",
                            gap: 14,
                            alignItems: "center",
                            justifyContent: "space-between",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 16,
                            padding: 14,
                            flexWrap: "wrap",
                            background: "rgba(255,255,255,0.03)",
                            backdropFilter: "blur(10px)",
                            boxShadow: "0 0 18px rgba(124,58,237,0.08)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 12,
                              alignItems: "center",
                            }}
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{
                                width: 80,
                                height: 80,
                                objectFit: "contain",
                                borderRadius: 12,
                                background: "#1a1333",
                                padding: 6,
                                boxShadow: "0 0 18px rgba(168,85,247,0.18)",
                              }}
                            />
                            <div>
                              <strong style={{ color: "#fff" }}>{item.name}</strong>
                              <div style={{ color: "#d8b4fe", marginTop: 6 }}>
                                {formatPrice(Number(item.price))}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              onClick={() => decreaseQuantity(item.id)}
                              style={{
                                border: "none",
                                background: "#2a1a48",
                                color: "#fff",
                                borderRadius: 10,
                                padding: "8px 12px",
                                cursor: "pointer",
                                boxShadow: "0 0 14px rgba(124,58,237,0.18)",
                              }}
                            >
                              -
                            </button>

                            <span
                              style={{
                                minWidth: 24,
                                textAlign: "center",
                                color: "#fff",
                              }}
                            >
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => increaseQuantity(item.id)}
                              disabled={reachedStockLimit}
                              style={{
                                border: "none",
                                background: "#2a1a48",
                                color: "#fff",
                                borderRadius: 10,
                                padding: "8px 12px",
                                cursor: reachedStockLimit ? "not-allowed" : "pointer",
                                opacity: reachedStockLimit ? 0.5 : 1,
                                boxShadow: "0 0 14px rgba(124,58,237,0.18)",
                              }}
                            >
                              +
                            </button>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              style={{
                                border: "none",
                                background: "#ef4444",
                                color: "white",
                                borderRadius: 10,
                                padding: "8px 12px",
                                cursor: "pointer",
                                boxShadow: "0 0 14px rgba(239,68,68,0.28)",
                              }}
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <h3 style={{ color: "#fff", textShadow: "0 0 16px rgba(168,85,247,0.45)" }}>
                      Total: {formatPrice(cartTotal)}
                    </h3>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        onClick={goToCheckout}
                        style={{
                          background: "linear-gradient(180deg, #a855f7 0%, #6d28d9 100%)",
                          color: "white",
                          border: "1px solid rgba(216, 180, 254, 0.25)",
                          borderRadius: 12,
                          padding: "12px 16px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          boxShadow: "0 0 26px rgba(168, 85, 247, 0.78)",
                        }}
                      >
                        Finalizar pedido
                      </button>

                      <button
                        onClick={clearCart}
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          color: "white",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 12,
                          padding: "12px 16px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        Limpar carrinho
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          )}

          {showCheckout && (
            <section
              id="checkout"
              className="fade-in"
              style={{
                marginTop: 20,
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(16px)",
                borderRadius: 20,
                padding: 20,
                boxShadow: "0 10px 32px rgba(0,0,0,0.28), 0 0 24px rgba(124,58,237,0.16)",
                border: "1px solid rgba(168, 85, 247, 0.16)",
              }}
            >
              <h2 style={{ marginTop: 0, color: "#fff", textShadow: "0 0 16px rgba(168,85,247,0.5)" }}>
                Finalizar Pedido
              </h2>
              <p style={{ color: "#d1d5db" }}>
                Preencha seus dados para concluir a compra.
              </p>

              <div
                style={{
                  display: "grid",
                  gap: 14,
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                }}
              >
                <input placeholder="Nome completo *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={inputStyle} />
                <input placeholder="Telefone *" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} style={inputStyle} />
                <input placeholder="Email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} style={inputStyle} />
                <input placeholder="CEP" value={cep} onChange={(e) => setCep(e.target.value)} style={inputStyle} />
                <input placeholder="Endereço *" value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} />
                <input placeholder="Número *" value={number} onChange={(e) => setNumber(e.target.value)} style={inputStyle} />
                <input placeholder="Bairro *" value={district} onChange={(e) => setDistrict(e.target.value)} style={inputStyle} />
                <input placeholder="Cidade *" value={city} onChange={(e) => setCity(e.target.value)} style={inputStyle} />
                <input placeholder="Estado *" value={stateName} onChange={(e) => setStateName(e.target.value)} style={inputStyle} />
                <input placeholder="Complemento" value={complement} onChange={(e) => setComplement(e.target.value)} style={inputStyle} />
                <input placeholder="Referência" value={reference} onChange={(e) => setReference(e.target.value)} style={inputStyle} />
              </div>

              <div
                style={{
                  marginTop: 20,
                  padding: 16,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <h3 style={{ color: "#fff", textShadow: "0 0 14px rgba(168,85,247,0.4)" }}>
                  Resumo do Pedido
                </h3>
                <div style={{ display: "grid", gap: 8, color: "#d1d5db" }}>
                  {cart.map((item) => (
                    <div key={item.id}>
                      {item.name} - {item.quantity}x -{" "}
                      {formatPrice(Number(item.price) * item.quantity)}
                    </div>
                  ))}
                </div>
                <h3 style={{ marginTop: 16, color: "#fff", textShadow: "0 0 16px rgba(168,85,247,0.45)" }}>
                  Total: {formatPrice(cartTotal)}
                </h3>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginTop: 20,
                }}
              >
                <button
                  onClick={() => setShowCheckout(false)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: "12px 16px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  Voltar
                </button>

                <button
                  onClick={finishOrder}
                  style={{
                    background: "linear-gradient(180deg, #a855f7 0%, #6d28d9 100%)",
                    color: "white",
                    border: "1px solid rgba(216, 180, 254, 0.25)",
                    borderRadius: 12,
                    padding: "12px 16px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    boxShadow: "0 0 26px rgba(168, 85, 247, 0.78)",
                  }}
                >
                  Enviar pedido no WhatsApp
                </button>
              </div>
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
              padding: "10px 16px",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 0 28px rgba(168,85,247,0.65)",
              zIndex: 999,
              fontSize: 12,
              minWidth: 260,
              maxWidth: 340,
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
              onClick={openCartArea}
              style={{
                background: "white",
                color: "#6d28d9",
                border: "none",
                padding: "4px 8px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 12,
              }}
            >
              Ver
            </button>

            <button
              onClick={goToCheckout}
              style={{
                background: "#1f123c",
                color: "white",
                border: "none",
                padding: "4px 8px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 12,
                boxShadow: "0 0 14px rgba(168,85,247,0.28)",
              }}
            >
              Finalizar
            </button>

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
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(173, 133, 255, 0.25)",
  outline: "none",
  fontSize: 14,
  background: "rgba(18, 12, 32, 0.72)",
  color: "#fff",
  backdropFilter: "blur(12px)",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03), 0 0 16px rgba(124,58,237,0.14)",
};

const heroMiniCard: React.CSSProperties = {
  background: "rgba(20, 6, 40, 0.58)",
  border: "1px solid rgba(168, 85, 247, 0.16)",
  borderRadius: 22,
  padding: 18,
  backdropFilter: "blur(16px)",
  boxShadow:
    "0 14px 30px rgba(0,0,0,0.28), 0 0 24px rgba(124,58,237,0.14)",
  display: "flex",
  alignItems: "center",
  gap: 14,
  minHeight: 120,
};

const miniIcon: React.CSSProperties = {
  width: 52,
  height: 52,
  minWidth: 52,
  borderRadius: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 24,
  background: "linear-gradient(180deg, rgba(168,85,247,0.22), rgba(109,40,217,0.14))",
  border: "1px solid rgba(216, 180, 254, 0.2)",
  boxShadow: "0 0 18px rgba(168,85,247,0.22)",
};

const miniTitle: React.CSSProperties = {
  color: "#fff",
  fontWeight: 900,
  fontSize: 18,
  marginBottom: 4,
  textShadow: "0 0 12px rgba(168,85,247,0.18)",
};

const miniText: React.CSSProperties = {
  color: "#ddd6fe",
  fontSize: 14,
  lineHeight: 1.45,
};