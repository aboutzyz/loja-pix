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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        color: "#111",
        fontFamily: "Arial, sans-serif",
      }}
    >
<header
  style={{
    position: "sticky",
    top: 0,
    zIndex: 20,
    background: "#111",
    color: "white",
    padding: "16px 20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
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
        fontWeight: "bold",
        fontSize: "26px",
        background: "linear-gradient(90deg, #00ffcc, #00ff88)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        margin: 0
      }}
    >
      ⚡ BOUT TEC
    </h1>
  </div>
</header>

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
                borderRadius: 10,
                border: "1px solid #ccc",
                minWidth: 260,
                outline: "none",
              }}
            />

            <button
              onClick={() => {
                setShowCart(!showCart);
                setShowCheckout(false);
              }}
              style={{
                background: "#22c55e",
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: "10px 14px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Carrinho ({cartCount})
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
        {!showCheckout && (
          <>
            <section style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, marginBottom: 8 }}>Produtos</h2>
              <p style={{ color: "#555", marginTop: 0 }}>
                Escolha seus produtos e adicione ao carrinho.
              </p>
            </section>

            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 18,
              }}
            >
              {paginatedProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    background: "white",
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
                    border: "1px solid #e5e5e5",
                  }}
                >
                  <div
                    style={{
                      background: "#fafafa",
                      padding: 14,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: 240,
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: "100%",
                        maxWidth: 220,
                        objectFit: "contain",
                        borderRadius: 12,
                      }}
                    />
                  </div>

                  <div style={{ padding: 16 }}>
                    <h3
                      style={{
                        margin: "0 0 10px 0",
                        fontSize: 18,
                        lineHeight: 1.4,
                        minHeight: 52,
                      }}
                    >
                      {product.name}
                    </h3>

                    <p
                      style={{
                        margin: "0 0 14px 0",
                        color: "#16a34a",
                        fontSize: 24,
                        fontWeight: "bold",
                      }}
                    >
                      {formatPrice(Number(product.price))}
                    </p>

                    <button
                      onClick={() => addToCart(product)}
                      style={{
                        width: "100%",
                        background: "#111",
                        color: "white",
                        border: "none",
                        borderRadius: 12,
                        padding: "12px 14px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: 15,
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
                  borderRadius: 10,
                  border: "1px solid #ccc",
                  background: currentPage === 1 ? "#ddd" : "white",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                Página anterior
              </button>

              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "#111",
                  color: "white",
                  fontWeight: "bold",
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
                  borderRadius: 10,
                  border: "1px solid #ccc",
                  background: currentPage === totalPages ? "#ddd" : "white",
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
              background: "white",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
              border: "1px solid #e5e5e5",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Seu Carrinho</h2>

            {cart.length === 0 ? (
              <p>Seu carrinho está vazio.</p>
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
                        border: "1px solid #eee",
                        borderRadius: 12,
                        padding: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: "contain",
                            borderRadius: 10,
                            background: "#fafafa",
                            padding: 6,
                          }}
                        />
                        <div>
                          <strong>{item.name}</strong>
                          <div style={{ color: "#16a34a", marginTop: 6 }}>
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
                            background: "#eee",
                            borderRadius: 8,
                            padding: "8px 12px",
                            cursor: "pointer",
                          }}
                        >
                          -
                        </button>

                        <span style={{ minWidth: 24, textAlign: "center" }}>
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => increaseQuantity(item.id)}
                          style={{
                            border: "none",
                            background: "#eee",
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
                  <h3>Total: {formatPrice(cartTotal)}</h3>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      onClick={goToCheckout}
                      style={{
                        background: "#16a34a",
                        color: "white",
                        border: "none",
                        borderRadius: 12,
                        padding: "12px 16px",
                        cursor: "pointer",
                        fontWeight: "bold",
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
              background: "white",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
              border: "1px solid #e5e5e5",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Finalizar Pedido</h2>
            <p>Preencha seus dados para concluir a compra.</p>

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
                background: "#fafafa",
                border: "1px solid #eee",
              }}
            >
              <h3>Resumo do Pedido</h3>
              <div style={{ display: "grid", gap: 8 }}>
                {cart.map((item) => (
                  <div key={item.id}>
                    {item.name} - {item.quantity}x -{" "}
                    {formatPrice(Number(item.price) * item.quantity)}
                  </div>
                ))}
              </div>
              <h3 style={{ marginTop: 16 }}>Total: {formatPrice(cartTotal)}</h3>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
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
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 16px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Enviar pedido no WhatsApp
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #d4d4d4",
  outline: "none",
  fontSize: 14,
  background: "white",
};