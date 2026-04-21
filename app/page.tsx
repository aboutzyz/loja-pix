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

  function loadCart() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
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
    const end = start + PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const cartTotal = cart.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0
  );

  function goToCheckout() {
    if (cart.length === 0) {
      alert("Seu carrinho está vazio.");
      return;
    }

    setShowCheckout(true);
    setShowCart(false);

    setTimeout(() => {
      const checkoutSection = document.getElementById("checkout");
      checkoutSection?.scrollIntoView({ behavior: "smooth" });
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

const diamonds = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: `${(i * 4.7 + 2) % 100}%`,
  duration: `${14 + (i % 6) * 3}s`,
  delay: `${(i % 7) * 1.2}s`,
  size: `${28 + (i % 6) * 16}px`,
  opacity: 0.22 + (i % 4) * 0.12,
  rotate: `${-18 + (i % 7) * 8}deg`,
  blur: i % 5 === 0 ? "1px" : "0px",
}));
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
  "radial-gradient(circle at 15% 20%, rgba(168,85,247,0.22), transparent 22%), radial-gradient(circle at 85% 22%, rgba(192,132,252,0.18), transparent 20%), radial-gradient(circle at 30% 75%, rgba(91,33,182,0.24), transparent 22%), radial-gradient(circle at 70% 80%, rgba(124,58,237,0.16), transparent 18%), linear-gradient(180deg, #05030b 0%, #12081f 48%, #08040f 100%)",
        color: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
{diamonds.map((diamond) => (
  <img
    key={diamond.id}
    src="/diamond.png"
    alt=""
    className="diamond-rain"
    style={{
      left: diamond.left,
      animationDuration: diamond.duration,
      animationDelay: diamond.delay,
      width: diamond.size,
      opacity: diamond.opacity,
      transform: `rotate(${diamond.rotate})`,
      filter: `drop-shadow(0 0 10px rgba(180,120,255,0.35))
               drop-shadow(0 0 22px rgba(120,70,255,0.28))
               blur(${diamond.blur})`,
    }}
  />
))}
      </div>

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
          <h1
            style={{
              margin: 0,
              fontWeight: "bold",
              fontSize: 36,
              letterSpacing: "1px",
              color: "#ffffff",
              textShadow: "0 0 18px rgba(192, 132, 252, 0.35)",
            }}
          >
            💎 BOUT TEC
          </h1>

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
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
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

            <button
              onClick={() => {
                setShowCart(!showCart);
                setShowCheckout(false);
              }}
              style={{
                background: "linear-gradient(180deg, #7c3aed 0%, #4c1d95 100%)",
                color: "white",
                border: "1px solid rgba(196, 181, 253, 0.35)",
                borderRadius: 14,
                padding: "10px 14px",
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: "0 0 18px rgba(124, 58, 237, 0.45)",
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
          padding: 20,
          position: "relative",
          zIndex: 1,
        }}
      >
        {!showCheckout && (
          <>
            <section style={{ marginBottom: 24 }}>
              <h2
                style={{
                  fontSize: 30,
                  marginBottom: 8,
                  color: "#ffffff",
                  textShadow: "0 0 12px rgba(168, 85, 247, 0.22)",
                }}
              >
                Produtos
              </h2>
              <p style={{ color: "#d1d5db", marginTop: 0 }}>
                Escolha seus produtos e adicione ao carrinho.
              </p>
            </section>

            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 18,
                background: "rgba(10, 8, 20, 0.55)",
                border: "1px solid rgba(168, 85, 247, 0.12)",
                borderRadius: 24,
                padding: 22,
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              }}
            >
              {paginatedProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    background: "rgba(12, 8, 24, 0.92)",
                    borderRadius: 18,
                    overflow: "hidden",
                    boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
                    border: "1px solid rgba(159, 122, 234, 0.18)",
                    maxWidth: 290,
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
                        objectFit: "contain",
                        borderRadius: 12,
                      }}
                    />
                  </div>

                  <div style={{ padding: 16 }}>
                    <h3
                      style={{
                        margin: "0 0 10px 0",
                        fontSize: 16,
                        lineHeight: 1.35,
                        minHeight: 44,
                        color: "#ffffff",
                      }}
                    >
                      {product.name}
                    </h3>

                    <p
                      style={{
                        margin: "0 0 14px 0",
                        color: "#d8b4fe",
                        fontSize: 28,
                        fontWeight: "bold",
                        textShadow: "0 0 14px rgba(168, 85, 247, 0.22)",
                      }}
                    >
                      {formatPrice(Number(product.price))}
                    </p>

                    <button
                      onClick={() => addToCart(product)}
                      style={{
                        width: "100%",
                        background:
                          "linear-gradient(180deg, #7e22ce 0%, #4c1d95 100%)",
                        color: "white",
                        border: "1px solid rgba(216, 180, 254, 0.25)",
                        borderRadius: 14,
                        padding: "11px 14px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: 16,
                        boxShadow: "0 0 20px rgba(126, 34, 206, 0.45)",
                      }}
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              ))}
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
                  padding: "10px 14px",
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
                  padding: "10px 14px",
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
                  padding: "10px 14px",
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

        {showCart && !showCheckout && (
          <section
            style={{
              marginTop: 30,
              background: "rgba(12, 8, 24, 0.92)",
              borderRadius: 20,
              padding: 20,
              boxShadow: "0 8px 22px rgba(0,0,0,0.25)",
              border: "1px solid rgba(168, 85, 247, 0.16)",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#fff" }}>Seu Carrinho</h2>

            {cart.length === 0 ? (
              <p style={{ color: "#d1d5db" }}>Seu carrinho está vazio.</p>
            ) : (
              <>
                <div style={{ display: "grid", gap: 14 }}>
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        gap: 14,
                        alignItems: "center",
                        justifyContent: "space-between",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 12,
                        padding: 12,
                        flexWrap: "wrap",
                        background: "rgba(255,255,255,0.02)",
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
                            borderRadius: 10,
                            background: "#1a1333",
                            padding: 6,
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
                            borderRadius: 8,
                            padding: "8px 12px",
                            cursor: "pointer",
                          }}
                        >
                          -
                        </button>

                        <span style={{ minWidth: 24, textAlign: "center", color: "#fff" }}>
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => increaseQuantity(item.id)}
                          style={{
                            border: "none",
                            background: "#2a1a48",
                            color: "#fff",
                            borderRadius: 8,
                            padding: "8px 12px",
                            cursor: "pointer",
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
                            borderRadius: 8,
                            padding: "8px 12px",
                            cursor: "pointer",
                          }}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 20 }}>
                  <h3 style={{ color: "#fff" }}>Total: {formatPrice(cartTotal)}</h3>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      onClick={goToCheckout}
                      style={{
                        background: "linear-gradient(180deg, #7e22ce 0%, #4c1d95 100%)",
                        color: "white",
                        border: "1px solid rgba(216, 180, 254, 0.25)",
                        borderRadius: 12,
                        padding: "12px 16px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        boxShadow: "0 0 18px rgba(126, 34, 206, 0.35)",
                      }}
                    >
                      Ir para checkout
                    </button>

                    <button
                      onClick={clearCart}
                      style={{
                        background: "#111",
                        color: "white",
                        border: "none",
                        borderRadius: 12,
                        padding: "12px 16px",
                        cursor: "pointer",
                        fontWeight: "bold",
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
            style={{
              marginTop: 20,
              background: "rgba(12, 8, 24, 0.92)",
              borderRadius: 20,
              padding: 20,
              boxShadow: "0 8px 22px rgba(0,0,0,0.25)",
              border: "1px solid rgba(168, 85, 247, 0.16)",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#fff" }}>Finalizar Pedido</h2>
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
              <input
                placeholder="Nome completo *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Telefone *"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="CEP"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Endereço *"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Número *"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Bairro *"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Cidade *"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Estado *"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Complemento"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Referência"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div
              style={{
                marginTop: 20,
                padding: 16,
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <h3 style={{ color: "#fff" }}>Resumo do Pedido</h3>
              <div style={{ display: "grid", gap: 8, color: "#d1d5db" }}>
                {cart.map((item) => (
                  <div key={item.id}>
                    {item.name} - {item.quantity}x -{" "}
                    {formatPrice(Number(item.price) * item.quantity)}
                  </div>
                ))}
              </div>
              <h3 style={{ marginTop: 16, color: "#fff" }}>
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
                  background: "#111",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 16px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Voltar
              </button>

              <button
                onClick={finishOrder}
                style={{
                  background: "linear-gradient(180deg, #7e22ce 0%, #4c1d95 100%)",
                  color: "white",
                  border: "1px solid rgba(216, 180, 254, 0.25)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  boxShadow: "0 0 18px rgba(126, 34, 206, 0.35)",
                }}
              >
                Enviar pedido no WhatsApp
              </button>
            </div>
          </section>
        )}
      </main>

<style jsx>{`
  .diamond-rain {
    position: absolute;
    top: -14%;
    animation-name: diamondFall;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    user-select: none;
    pointer-events: none;
    will-change: transform, opacity;
  }

  @keyframes diamondFall {
    0% {
      transform: translate3d(0, -12vh, 0) rotate(-12deg) scale(0.9);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    50% {
      transform: translate3d(12px, 50vh, 0) rotate(6deg) scale(1);
    }
    100% {
      transform: translate3d(-16px, 120vh, 0) rotate(18deg) scale(0.92);
      opacity: 0;
    }
  }
`}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(173, 133, 255, 0.25)",
  outline: "none",
  fontSize: 14,
  background: "rgba(18, 12, 32, 0.92)",
  color: "#fff",
};