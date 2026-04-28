"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { CSSProperties, useEffect, useMemo, useState } from "react";

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
  description?: string | null;
};

type CartItem = Product & { quantity: number };

type PixData = {
  qrCodeImage?: string;
  copiaCola?: string;
  paymentId?: string;
  status?: string;
  error?: unknown;
};

type PaymentStatus = "idle" | "waiting" | "paid" | "expired";

type CustomerData = {
  nome: string;
  email: string;
  cpfCnpj: string;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function onlyNumbers(value: string) {
  return value.replace(/\D/g, "");
}

function formatPixTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function isPaidStatus(status?: string) {
  return ["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(String(status || "").toUpperCase());
}

function LightningIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z"
        stroke="#d8b4fe"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l7 3.5v5.8c0 4.6-2.9 7.8-7 8.9-4.1-1.1-7-4.3-7-8.9V6.5L12 3Z"
        stroke="#d8b4fe"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m9.5 12 1.7 1.7 3.5-3.7"
        stroke="#d8b4fe"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2.5"
        stroke="#d8b4fe"
        strokeWidth="2.1"
      />
      <path d="M3 10h18" stroke="#d8b4fe" strokeWidth="2.1" />
      <path d="M7 15h3" stroke="#d8b4fe" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 13a8 8 0 1 1 16 0"
        stroke="#d8b4fe"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <rect x="3" y="12" width="4" height="6" rx="2" stroke="#d8b4fe" strokeWidth="2.1" />
      <rect x="17" y="12" width="4" height="6" rx="2" stroke="#d8b4fe" strokeWidth="2.1" />
      <path
        d="M12 20a3 3 0 0 0 3-3"
        stroke="#d8b4fe"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="20" r="1.8" fill="#f5f3ff" />
      <circle cx="18" cy="20" r="1.8" fill="#f5f3ff" />
      <path
        d="M3 4h2l2.1 9.2a1 1 0 0 0 1 .8h9.7a1 1 0 0 0 1-.8L20 7H7"
        stroke="#f5f3ff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PixBoltIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z"
        stroke="#f8fafc"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="#f5f3ff" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

export default function ProdutoPage() {
  const params = useParams();
  const id = String(params?.id ?? "");

  const [product, setProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [openCart, setOpenCart] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [pix, setPix] = useState<PixData | null>(null);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixError, setPixError] = useState("");
  const [copiedPix, setCopiedPix] = useState(false);
  const [pixStatus, setPixStatus] = useState<PaymentStatus>("idle");
  const [pixTimer, setPixTimer] = useState(15 * 60);
  const [customerData, setCustomerData] = useState<CustomerData>({
    nome: "",
    email: "",
    cpfCnpj: "",
  });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!id) return;
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (!pix?.paymentId || pixStatus !== "waiting") return;

    const countdown = setInterval(() => {
      setPixTimer((current) => {
        if (current <= 1) {
          setPixStatus((previous) => previous === "paid" ? previous : "expired");
          clearInterval(countdown);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [pix?.paymentId, pixStatus]);

  useEffect(() => {
    if (!pix?.paymentId || pixStatus !== "waiting") return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/status-pix?paymentId=${pix.paymentId}`, { cache: "no-store" });
        const data = await res.json();
        if (res.ok && isPaidStatus(data?.status)) setPixStatus("paid");
      } catch (error) {
        console.error("Erro ao consultar status do Pix:", error);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [pix?.paymentId, pixStatus]);

  async function loadProduct() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar produto:", error);
      return;
    }

    setProduct(data);
  }

  function addToCart(productToAdd: Product) {
    setCart((prev) => {
      const exist = prev.find((item) => item.id === productToAdd.id);

      if (exist) {
        if (exist.quantity >= productToAdd.stock) return prev;

        return prev.map((item) =>
          item.id === productToAdd.id
            ? { ...item, quantity: Math.min(item.quantity + 1, productToAdd.stock) }
            : item
        );
      }

      return [...prev, { ...productToAdd, quantity: 1 }];
    });

    setOpenCart(true);
  }

  function updateQty(itemId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== itemId) return item;
          const next = item.quantity + delta;
          if (next > item.stock) return item;
          return { ...item, quantity: Math.max(0, next) };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(itemId: string) {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  }

  const total = useMemo(
    () => cart.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  async function gerarPix(items: CartItem[]) {
    if (items.length === 0 || pixLoading) return;

    const cpfCnpj = onlyNumbers(customerData.cpfCnpj);
    const nome = customerData.nome.trim();
    const email = customerData.email.trim();

    if (!nome) {
      setPixError("Preencha seu nome completo para gerar o Pix.");
      return;
    }
    if (!email || !email.includes("@")) {
      setPixError("Preencha um email válido para gerar o Pix.");
      return;
    }
    if (cpfCnpj.length !== 11 && cpfCnpj.length !== 14) {
      setPixError("Preencha um CPF com 11 números ou CNPJ com 14 números.");
      return;
    }

    setPix(null);
    setPixError("");
    setCopiedPix(false);
    setPixLoading(true);
    setPixStatus("idle");
    setPixTimer(15 * 60);
    setOpenCart(true);

    const valorTotal = items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
    const descricao = items.map((item) => `${item.name} x${item.quantity}`).join(" | ");

    try {
      const res = await fetch("/api/criar-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, cpfCnpj, valor: valorTotal, descricao: `Pedido BoutBux - ${descricao}` }),
      });

      const data = await res.json();
      if (!res.ok || data?.error) {
        console.error("Erro ao gerar Pix:", data);
        setPixError("Não foi possível gerar o Pix agora. Confira seus dados e tente novamente.");
        return;
      }

      setPix(data);
      setPixStatus(isPaidStatus(data?.status) ? "paid" : "waiting");
    } catch (error) {
      console.error("Erro ao chamar API Pix:", error);
      setPixError("Erro de conexão ao gerar Pix. Tente novamente em instantes.");
    } finally {
      setPixLoading(false);
    }
  }

  function updateCustomerData(field: keyof CustomerData, value: string) {
    setCustomerData((current) => ({
      ...current,
      [field]: field === "cpfCnpj" ? value.replace(/\D/g, "").slice(0, 14) : value,
    }));
    setPixError("");
  }

  function resetPix() {
    setPix(null);
    setPixError("");
    setCopiedPix(false);
    setPixStatus("idle");
    setPixTimer(15 * 60);
  }

  function getStatusText() {
    if (pixStatus === "paid") return "Pagamento aprovado";
    if (pixStatus === "expired") return "Pix expirado";
    if (pixLoading) return "Gerando Pix";
    if (pix?.paymentId) return "Aguardando pagamento";
    return "Preencha os dados";
  }

  function getStatusDescription() {
    if (pixStatus === "paid") return "Seu pagamento foi confirmado com sucesso.";
    if (pixStatus === "expired") return "Este Pix expirou. Gere um novo para pagar.";
    if (pixLoading) return "Criando cobrança segura no Asaas...";
    if (pix?.paymentId) return "Assim que o Pix for pago, o status muda sozinho.";
    return "Informe seus dados para gerar o QR Code Pix.";
  }

  function checkoutPix() {
    gerarPix(cart);
  }

  function pagarProdutoComPix() {
    if (!product || product.stock <= 0) return;
    const item: CartItem = { ...product, quantity: 1 };
    setCart((prev) => {
      const exists = prev.find((cartItem) => cartItem.id === product.id);
      if (exists) return prev;
      return [...prev, item];
    });
    resetPix();
    setOpenCart(true);
  }

  async function copyPixCode() {
    if (!pix?.copiaCola) return;
    await navigator.clipboard.writeText(pix.copiaCola);
    setCopiedPix(true);
  }

  if (!product) {
    return (
      <div style={loadingWrap}>
        <div style={loadingGlow}></div>
        <div style={loadingText}>Carregando...</div>
      </div>
    );
  }

  const productDescription = product.description?.trim()
    ? product.description
    : `— Como receber o seu pedido?

Depois que pagar, realize o login no site.
Após realizar o login vá para seus pedidos.
No chat do seu pedido, siga o tutorial enviado.

— Como fazer o tutorial?

No celular e no PC, siga o passo a passo enviado no atendimento.
A entrega é digital e o suporte fica disponível para te ajudar.`;

  return (
    <div style={page}>
      <div style={gridOverlay} />

      <div style={topBar}>
        <div style={brandWrap}>
          <div style={brandLogoBox}>BT</div>
          <div style={brandText}>BoutBux</div>
        </div>

        <div style={topNav}>
          <Link href="/" style={topNavLink}>
            Início
          </Link>
        </div>

        <div style={topActions}>
          <button style={cartTopBtn} onClick={() => setOpenCart(true)}>
            <CartIcon />
            <span style={{ marginLeft: 8 }}>Carrinho</span>
            {cartCount > 0 && <span style={topBadge}>{cartCount}</span>}
          </button>
        </div>
      </div>

      <div style={contentWrap}>
        <div style={isMobile ? mobileHero : desktopHero}>
          <div style={leftColumn}>
            <div style={imageCard}>
              <div style={imageGlow} />
              <img src={product.image} alt={product.name} style={productImage} />
            </div>

            <div style={descriptionCard}>
              <div style={descriptionHeader}>
                <div style={descriptionIconBox}>▣</div>
                <div style={descriptionTitle}>Descrição</div>
              </div>

              <div style={descriptionText}>{productDescription}</div>
            </div>
          </div>

          <div style={centerColumn}>
            <h1 style={title}>{product.name}</h1>

            {!isMobile && (
              <div style={ratingRow}>
                <span style={star}>★</span>
                <span style={star}>★</span>
                <span style={star}>★</span>
                <span style={star}>★</span>
                <span style={star}>★</span>
                <span style={ratingText}>(4.9) 2.456 avaliações</span>
              </div>
            )}

            <div style={price}>{formatPrice(Number(product.price))}</div>
            <div style={pixText}>À vista no Pix ✥</div>

            <button style={pixBtn} onClick={pagarProdutoComPix} disabled={pixLoading || product.stock <= 0}>
              <PixBoltIcon />
              <span style={{ marginLeft: 10 }}>{pixLoading ? "Gerando Pix..." : "Pagar com Pix"}</span>
            </button>

            <button style={addCartBtn} onClick={() => addToCart(product)}>
              <PlusIcon />
              <span style={{ marginLeft: 10 }}>Adicionar ao carrinho</span>
            </button>

            <div style={securityMiniCard}>
              <div style={miniIconWrap}>
                <ShieldIcon />
              </div>
              <div>
                <div style={miniCardTitle}>Compra 100% segura</div>
                <div style={miniCardText}>Seus dados protegidos durante todo o processo.</div>
              </div>
            </div>
          </div>

          <div style={featureColumn}>
            <div style={featureCard}>
              <div style={featureIconWrap}>
                <LightningIcon />
              </div>
              <div>
                <div style={featureTitle}>Entrega imediata</div>
                <div style={featureText}>
                  Receba o seu pacote imediatamente após o pagamento.
                </div>
              </div>
            </div>

            <div style={featureCard}>
              <div style={featureIconWrap}>
                <ShieldIcon />
              </div>
              <div>
                <div style={featureTitle}>Segurança total</div>
                <div style={featureText}>
                  Seus dados são criptografados de ponta a ponta.
                </div>
              </div>
            </div>

            <div style={featureCard}>
              <div style={featureIconWrap}>
                <CardIcon />
              </div>
              <div>
                <div style={featureTitle}>Pix disponível</div>
                <div style={featureText}>
                  Pague com Pix e ganhe aprovação imediata.
                </div>
              </div>
            </div>

            <div style={featureCard}>
              <div style={featureIconWrap}>
                <SupportIcon />
              </div>
              <div>
                <div style={featureTitle}>Suporte dedicado</div>
                <div style={featureText}>
                  Atendimento rápido e humanizado sempre que precisar.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button style={floatingCartBtn} onClick={() => setOpenCart(true)}>
        <CartIcon />
        {cartCount > 0 && <span style={floatingBadge}>{cartCount}</span>}
      </button>

      {openCart && <div style={cartOverlay} onClick={() => setOpenCart(false)} />}

      <div
        style={{
          ...cartPanel,
          transform: openCart ? "translateX(0)" : "translateX(100%)",
          width: isMobile ? "100%" : 380,
        }}
      >
        <div style={cartHeader}>
          <div style={cartHeaderTitle}>Carrinho</div>
          <button style={closeCartBtn} onClick={() => setOpenCart(false)}>
            ✕
          </button>
        </div>

        <div style={cartList}>
          {cart.length === 0 ? (
            <div style={emptyCartBox}>Seu carrinho está vazio.</div>
          ) : (
            cart.map((item) => (
              <div key={item.id} style={cartItemBox}>
                <img src={item.image} alt={item.name} style={cartItemImage} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={cartItemName}>{item.name}</div>
                  <div style={cartItemPrice}>{formatPrice(Number(item.price))}</div>
                </div>

                <div style={cartItemControls}>
                  <button
                    style={qtyBtn}
                    onClick={() => updateQty(item.id, -1)}
                  >
                    −
                  </button>

                  <div style={qtyValue}>{item.quantity}</div>

                  <button
                    style={{
                      ...qtyBtn,
                      opacity: item.quantity >= item.stock ? 0.4 : 1,
                      cursor: item.quantity >= item.stock ? "not-allowed" : "pointer",
                    }}
                    disabled={item.quantity >= item.stock}
                    onClick={() => updateQty(item.id, 1)}
                  >
                    +
                  </button>

                  <button style={removeBtn} onClick={() => removeItem(item.id)}>
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div style={pixBox}>
            <div style={pixHeaderRow}>
              <div>
                <div style={pixSmallLabel}>Pagamento</div>
                <div style={pixTitle}>Pix seguro</div>
              </div>
              <div style={pixBadge}>PIX</div>
            </div>

            <div style={{ ...pixStatusBox, ...(pixStatus === "paid" ? pixStatusPaidBox : {}), ...(pixStatus === "expired" ? pixStatusExpiredBox : {}) }}>
              <div style={pixStatusIcon}>{pixStatus === "paid" ? "✓" : pixStatus === "expired" ? "!" : "⌛"}</div>
              <div>
                <div style={pixStatusTitle}>{getStatusText()}</div>
                <div style={pixStatusDescription}>{getStatusDescription()}</div>
              </div>
            </div>

            {!pix?.paymentId && (
              <div style={customerFormBox}>
                <input placeholder="Nome completo *" value={customerData.nome} onChange={(e) => updateCustomerData("nome", e.target.value)} style={checkoutInput} />
                <input placeholder="Email *" value={customerData.email} onChange={(e) => updateCustomerData("email", e.target.value)} style={checkoutInput} />
                <input placeholder="CPF ou CNPJ *" value={customerData.cpfCnpj} onChange={(e) => updateCustomerData("cpfCnpj", e.target.value)} style={checkoutInput} inputMode="numeric" />
              </div>
            )}

            {pixLoading && <div style={pixLoadingBox}><div style={pixSpinner} /><span>Gerando QR Code seguro...</span></div>}
            {pixError && <div style={pixErrorBox}>{pixError}</div>}

            {!pixLoading && pix?.paymentId && (
              <div style={pixTimerBox}>
                <span>{pixStatus === "paid" ? "Status" : "Expira em"}</span>
                <strong>{pixStatus === "paid" ? "Pago" : formatPixTimer(pixTimer)}</strong>
              </div>
            )}

            {!pixLoading && pix?.qrCodeImage && pixStatus !== "paid" && <div style={qrWrap}><img src={`data:image/png;base64,${pix.qrCodeImage}`} alt="QR Code Pix" style={qrImage} /></div>}

            {!pixLoading && pixStatus === "paid" && (
              <div style={paidBox}>
                <div style={paidIcon}>✓</div>
                <div style={paidTitle}>Pagamento confirmado!</div>
                <div style={paidText}>Seu pedido foi aprovado. Aguarde a entrega ou acompanhe pelo suporte.</div>
              </div>
            )}

            {!pixLoading && pix?.copiaCola && pixStatus !== "paid" && (
              <>
                <div style={copyLabel}>Pix copia e cola</div>
                <textarea value={pix.copiaCola} readOnly style={pixTextarea} />
                <button style={copyPixBtn} onClick={copyPixCode}>{copiedPix ? "Pix copiado!" : "Copiar Pix"}</button>
              </>
            )}

            {pix?.paymentId && pixStatus !== "paid" && <button style={newPixBtn} onClick={resetPix}>Gerar outro Pix</button>}
          </div>
        )}

        <div style={cartFooter}>
          <div style={cartTotalBox}>
            <span style={cartTotalLabel}>Valor total:</span>
            <span style={cartTotalValue}>{formatPrice(total)}</span>
          </div>

          <button
            style={{
              ...checkoutBtn,
              opacity: cart.length === 0 ? 0.65 : 1,
              cursor: cart.length === 0 ? "not-allowed" : "pointer",
            }}
            onClick={checkoutPix}
            disabled={cart.length === 0}
          >
            {pix?.paymentId ? "Ver pagamento" : pixLoading ? "Gerando Pix..." : "Gerar Pix agora"}
          </button>
        </div>
      </div>
    </div>
  );
}

const page: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 25% 20%, rgba(170, 60, 255, 0.22), transparent 30%), radial-gradient(circle at 85% 82%, rgba(208, 80, 255, 0.2), transparent 25%), linear-gradient(180deg, #090114 0%, #100022 48%, #0a0117 100%)",
  color: "#ffffff",
  position: "relative",
  overflowX: "hidden",
  fontFamily: "Arial, sans-serif",
};

const gridOverlay: CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundImage:
    "linear-gradient(rgba(179, 77, 255, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(179, 77, 255, 0.12) 1px, transparent 1px)",
  backgroundSize: "40px 40px",
  pointerEvents: "none",
  opacity: 0.6,
};

const topBar: CSSProperties = {
  position: "relative",
  zIndex: 2,
  maxWidth: 1320,
  margin: "0 auto",
  padding: "18px 18px 8px 18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
};

const brandWrap: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const brandLogoBox: CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 14,
  background: "linear-gradient(135deg, #7c14ff, #db4cff)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  fontSize: 16,
  boxShadow: "0 0 22px rgba(183, 77, 255, 0.45)",
};

const brandText: CSSProperties = {
  fontSize: 24,
  fontWeight: 800,
  letterSpacing: 0.3,
  textShadow: "0 0 18px rgba(203, 110, 255, 0.35)",
};

const topNav: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 24,
  color: "#ede9fe",
  fontSize: 15,
};

const topNavItem: CSSProperties = {
  opacity: 0.96,
  fontWeight: 700,
};

const topNavLink: CSSProperties = {
  color: "#ede9fe",
  textDecoration: "none",
  opacity: 0.96,
  fontWeight: 700,
};

const topActions: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const cartTopBtn: CSSProperties = {
  height: 44,
  padding: "0 16px",
  borderRadius: 14,
  border: "1px solid rgba(186, 104, 255, 0.3)",
  background: "rgba(16, 6, 30, 0.65)",
  color: "#f5f3ff",
  display: "flex",
  alignItems: "center",
  fontWeight: 700,
  position: "relative",
  backdropFilter: "blur(10px)",
};

const topBadge: CSSProperties = {
  marginLeft: 10,
  minWidth: 22,
  height: 22,
  borderRadius: 999,
  background: "#b933ff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 11,
  fontWeight: 800,
  boxShadow: "0 0 14px rgba(185, 51, 255, 0.55)",
};

const contentWrap: CSSProperties = {
  position: "relative",
  zIndex: 2,
  maxWidth: 1320,
  margin: "0 auto",
  padding: "14px 18px 36px 18px",
};

const desktopHero: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.35fr 0.95fr 0.85fr",
  gap: 20,
  alignItems: "start",
};

const mobileHero: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const leftColumn: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 18,
};

const imageCard: CSSProperties = {
  position: "relative",
  minHeight: 430,
  borderRadius: 24,
  padding: 16,
  background: "rgba(14, 4, 28, 0.68)",
  border: "1px solid rgba(186, 104, 255, 0.4)",
  backdropFilter: "blur(18px)",
  boxShadow:
    "0 0 30px rgba(168, 85, 247, 0.18), inset 0 0 0 1px rgba(255,255,255,0.02)",
  overflow: "hidden",
};

const imageGlow: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(circle at 55% 35%, rgba(209, 92, 255, 0.22), transparent 28%), radial-gradient(circle at 72% 72%, rgba(140, 40, 255, 0.18), transparent 24%)",
  pointerEvents: "none",
};

const productImage: CSSProperties = {
  position: "relative",
  zIndex: 1,
  width: "100%",
  height: 395,
  objectFit: "cover",
  borderRadius: 18,
  border: "1px solid rgba(203, 110, 255, 0.25)",
};

const centerColumn: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const title: CSSProperties = {
  margin: "8px 0 8px 0",
  fontSize: 42,
  lineHeight: 1,
  fontWeight: 900,
  letterSpacing: -0.5,
  textShadow: "0 0 16px rgba(195, 94, 255, 0.22)",
};

const ratingRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  marginBottom: 16,
};

const star: CSSProperties = {
  color: "#ffd84d",
  fontSize: 18,
  textShadow: "0 0 12px rgba(255,216,77,0.35)",
};

const ratingText: CSSProperties = {
  marginLeft: 8,
  color: "#ddd6fe",
  fontSize: 14,
};

const price: CSSProperties = {
  fontSize: 40,
  fontWeight: 900,
  color: "#f0abfc",
  letterSpacing: -0.5,
  marginTop: 2,
  textShadow: "0 0 18px rgba(216, 180, 254, 0.25)",
};

const pixText: CSSProperties = {
  color: "#f3e8ff",
  opacity: 0.9,
  fontSize: 18,
  marginTop: 4,
  marginBottom: 20,
};

const pixBtn: CSSProperties = {
  height: 64,
  borderRadius: 18,
  border: "1px solid rgba(241, 204, 255, 0.26)",
  background: "linear-gradient(180deg, #e03cff 0%, #8e18ff 100%)",
  color: "#ffffff",
  fontWeight: 900,
  fontSize: 22,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow:
    "0 0 28px rgba(212, 54, 255, 0.55), inset 0 1px 0 rgba(255,255,255,0.25)",
  cursor: "pointer",
};

const addCartBtn: CSSProperties = {
  marginTop: 14,
  height: 64,
  borderRadius: 18,
  border: "1px solid rgba(192, 110, 255, 0.45)",
  background: "rgba(11, 2, 22, 0.45)",
  color: "#ffffff",
  fontWeight: 800,
  fontSize: 22,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
  cursor: "pointer",
};

const securityMiniCard: CSSProperties = {
  marginTop: 18,
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: 16,
  borderRadius: 20,
  background: "rgba(18, 6, 34, 0.7)",
  border: "1px solid rgba(194, 120, 255, 0.22)",
  boxShadow: "0 0 26px rgba(168,85,247,0.12)",
};

const miniIconWrap: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 15,
  background: "rgba(180, 90, 255, 0.12)",
  border: "1px solid rgba(205,126,255,0.22)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const miniCardTitle: CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
};

const miniCardText: CSSProperties = {
  color: "#e9d5ff",
  opacity: 0.92,
  fontSize: 14,
  marginTop: 4,
};

const featureColumn: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const featureCard: CSSProperties = {
  display: "flex",
  gap: 14,
  padding: 20,
  borderRadius: 22,
  background: "rgba(18, 5, 35, 0.7)",
  border: "1px solid rgba(192, 110, 255, 0.3)",
  backdropFilter: "blur(18px)",
  boxShadow: "0 0 28px rgba(168,85,247,0.12)",
};

const featureIconWrap: CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: 16,
  background: "rgba(180, 90, 255, 0.12)",
  border: "1px solid rgba(205,126,255,0.22)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const featureTitle: CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  marginBottom: 6,
};

const featureText: CSSProperties = {
  color: "#e9d5ff",
  opacity: 0.92,
  lineHeight: 1.45,
  fontSize: 15,
};

const descriptionCard: CSSProperties = {
  borderRadius: 24,
  padding: 20,
  background: "rgba(16, 5, 30, 0.78)",
  border: "1px solid rgba(192, 110, 255, 0.32)",
  boxShadow: "0 0 30px rgba(168,85,247,0.14)",
  backdropFilter: "blur(18px)",
};

const descriptionHeader: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
};

const descriptionIconBox: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 10,
  background: "rgba(191, 90, 255, 0.12)",
  border: "1px solid rgba(205,126,255,0.22)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#d8b4fe",
  fontWeight: 800,
};

const descriptionTitle: CSSProperties = {
  fontSize: 22,
  fontWeight: 900,
  color: "#d946ef",
};

const descriptionText: CSSProperties = {
  whiteSpace: "pre-line",
  color: "#f5f3ff",
  lineHeight: 1.6,
  fontSize: 16,
};

const floatingCartBtn: CSSProperties = {
  position: "fixed",
  right: 24,
  bottom: 24,
  zIndex: 30,
  width: 72,
  height: 72,
  borderRadius: "50%",
  border: "1px solid rgba(218, 160, 255, 0.28)",
  background: "linear-gradient(180deg, #ca3cff 0%, #7a19ff 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 0 34px rgba(202, 60, 255, 0.6)",
  cursor: "pointer",
};

const floatingBadge: CSSProperties = {
  position: "absolute",
  top: -4,
  right: -4,
  minWidth: 26,
  height: 26,
  padding: "0 7px",
  borderRadius: 999,
  background: "#c026d3",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontSize: 12,
  fontWeight: 900,
  boxShadow: "0 0 18px rgba(192, 38, 211, 0.5)",
};

const cartOverlay: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  backdropFilter: "blur(6px)",
  zIndex: 40,
};

const cartPanel: CSSProperties = {
  position: "fixed",
  top: 0,
  right: 0,
  height: "100%",
  background: "rgba(9, 2, 19, 0.96)",
  borderLeft: "1px solid rgba(186, 104, 255, 0.24)",
  backdropFilter: "blur(20px)",
  zIndex: 41,
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.35s ease",
  boxShadow: "-10px 0 50px rgba(0,0,0,0.45)",
};

const cartHeader: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "22px 20px 12px 20px",
};

const cartHeaderTitle: CSSProperties = {
  fontSize: 22,
  fontWeight: 900,
};

const closeCartBtn: CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#fff",
  fontSize: 34,
  cursor: "pointer",
  lineHeight: 1,
};

const cartList: CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "6px 20px 12px 20px",
};

const emptyCartBox: CSSProperties = {
  borderRadius: 18,
  padding: 18,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(192,110,255,0.16)",
  color: "#f5f3ff",
};

const cartItemBox: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 14,
  marginBottom: 14,
  borderRadius: 18,
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(192,110,255,0.18)",
};

const cartItemImage: CSSProperties = {
  width: 62,
  height: 62,
  borderRadius: 12,
  objectFit: "cover",
  flexShrink: 0,
};

const cartItemName: CSSProperties = {
  fontWeight: 800,
  fontSize: 16,
  lineHeight: 1.2,
  wordBreak: "break-word",
};

const cartItemPrice: CSSProperties = {
  color: "#d8b4fe",
  marginTop: 4,
  fontWeight: 700,
};

const cartItemControls: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const qtyBtn: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 10,
  border: "1px solid rgba(194,120,255,0.25)",
  background: "linear-gradient(180deg, #8a23ff 0%, #6117d8 100%)",
  color: "#fff",
  fontSize: 22,
  fontWeight: 900,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const qtyValue: CSSProperties = {
  minWidth: 24,
  textAlign: "center",
  fontWeight: 900,
  fontSize: 18,
};

const removeBtn: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(180deg, #ff5a67 0%, #ef4444 100%)",
  color: "#fff",
  fontSize: 20,
  cursor: "pointer",
};

const cartFooter: CSSProperties = {
  padding: 20,
  borderTop: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(8,2,18,0.95)",
};

const cartTotalBox: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 14,
  padding: "14px 16px",
  borderRadius: 16,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(192,110,255,0.14)",
};

const cartTotalLabel: CSSProperties = {
  color: "#ddd6fe",
  fontSize: 18,
};

const cartTotalValue: CSSProperties = {
  fontSize: 28,
  fontWeight: 900,
  color: "#ffffff",
};

const checkoutBtn: CSSProperties = {
  width: "100%",
  height: 56,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "linear-gradient(180deg, #ff4cff 0%, #9327ff 100%)",
  color: "#fff",
  fontWeight: 900,
  fontSize: 19,
  boxShadow: "0 0 24px rgba(197, 71, 255, 0.4)",
  cursor: "pointer",
};

const pixBox: CSSProperties = {
  margin: "0 20px 14px 20px",
  padding: 16,
  borderRadius: 20,
  background:
    "linear-gradient(180deg, rgba(37, 8, 62, 0.94), rgba(15, 4, 30, 0.96))",
  border: "1px solid rgba(216,180,254,0.24)",
  boxShadow: "0 0 26px rgba(202, 60, 255, 0.18)",
};

const pixHeaderRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 14,
};

const pixSmallLabel: CSSProperties = {
  color: "#c4b5fd",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 0.8,
};

const pixTitle: CSSProperties = {
  color: "#fff",
  fontSize: 20,
  fontWeight: 900,
  marginTop: 3,
};

const pixBadge: CSSProperties = {
  padding: "8px 11px",
  borderRadius: 999,
  background: "linear-gradient(180deg, #e03cff 0%, #8e18ff 100%)",
  color: "#fff",
  fontWeight: 900,
  fontSize: 12,
  boxShadow: "0 0 18px rgba(224,60,255,0.38)",
};

const pixLoadingBox: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: "#f5f3ff",
  fontWeight: 800,
  padding: "14px 12px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const pixSpinner: CSSProperties = {
  width: 18,
  height: 18,
  borderRadius: "50%",
  border: "3px solid rgba(255,255,255,0.22)",
  borderTopColor: "#fff",
};

const pixErrorBox: CSSProperties = {
  color: "#fecaca",
  background: "rgba(239,68,68,0.12)",
  border: "1px solid rgba(239,68,68,0.28)",
  borderRadius: 14,
  padding: 12,
  fontWeight: 800,
  lineHeight: 1.4,
};

const qrWrap: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  padding: 14,
  borderRadius: 18,
  background: "rgba(255,255,255,0.96)",
  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
};

const qrImage: CSSProperties = {
  width: 210,
  maxWidth: "100%",
  borderRadius: 12,
};

const copyLabel: CSSProperties = {
  marginTop: 14,
  marginBottom: 8,
  color: "#ddd6fe",
  fontSize: 13,
  fontWeight: 900,
};

const pixTextarea: CSSProperties = {
  width: "100%",
  minHeight: 86,
  resize: "none",
  borderRadius: 14,
  padding: 12,
  border: "1px solid rgba(216,180,254,0.22)",
  background: "rgba(8,2,18,0.92)",
  color: "#fff",
  outline: "none",
  fontSize: 12,
  lineHeight: 1.35,
};

const copyPixBtn: CSSProperties = {
  width: "100%",
  height: 48,
  marginTop: 10,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "linear-gradient(180deg, #a855f7 0%, #6d28d9 100%)",
  color: "#fff",
  fontWeight: 900,
  fontSize: 16,
  cursor: "pointer",
  boxShadow: "0 0 20px rgba(168,85,247,0.34)",
};


const checkoutInput: CSSProperties = { width: "100%", height: 46, borderRadius: 14, border: "1px solid rgba(216,180,254,0.18)", background: "rgba(8,2,18,0.72)", color: "#fff", outline: "none", padding: "0 13px", fontSize: 14, fontWeight: 700, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)" };
const customerFormBox: CSSProperties = { display: "grid", gap: 10, marginBottom: 12 };
const pixStatusBox: CSSProperties = { display: "flex", alignItems: "center", gap: 12, padding: 12, marginBottom: 12, borderRadius: 16, background: "rgba(255,255,255,0.045)", border: "1px solid rgba(216,180,254,0.16)" };
const pixStatusPaidBox: CSSProperties = { background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.34)" };
const pixStatusExpiredBox: CSSProperties = { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.28)" };
const pixStatusIcon: CSSProperties = { width: 38, height: 38, borderRadius: 14, background: "linear-gradient(180deg, #e03cff 0%, #8e18ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, flexShrink: 0, boxShadow: "0 0 18px rgba(224,60,255,0.28)" };
const pixStatusTitle: CSSProperties = { color: "#fff", fontWeight: 900, fontSize: 15 };
const pixStatusDescription: CSSProperties = { color: "#ddd6fe", fontWeight: 700, fontSize: 12, marginTop: 3, lineHeight: 1.35 };
const pixTimerBox: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 14px", borderRadius: 14, marginBottom: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(216,180,254,0.14)", color: "#ddd6fe", fontWeight: 900 };
const paidBox: CSSProperties = { padding: 18, borderRadius: 18, textAlign: "center", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.34)" };
const paidIcon: CSSProperties = { width: 56, height: 56, borderRadius: "50%", margin: "0 auto 10px auto", background: "linear-gradient(180deg, #22c55e 0%, #16a34a 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 900, boxShadow: "0 0 22px rgba(34,197,94,0.4)" };
const paidTitle: CSSProperties = { color: "#fff", fontSize: 18, fontWeight: 900 };
const paidText: CSSProperties = { color: "#dcfce7", fontSize: 13, fontWeight: 700, lineHeight: 1.4, marginTop: 6 };
const newPixBtn: CSSProperties = { width: "100%", height: 42, marginTop: 10, borderRadius: 13, border: "1px solid rgba(216,180,254,0.18)", background: "rgba(255,255,255,0.05)", color: "#fff", fontWeight: 900, cursor: "pointer" };

const loadingWrap: CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#090114,#100022)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
};

const loadingGlow: CSSProperties = {
  position: "absolute",
  width: 220,
  height: 220,
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(195,80,255,0.35), transparent 70%)",
};

const loadingText: CSSProperties = {
  position: "relative",
  zIndex: 1,
  fontSize: 28,
  fontWeight: 900,
  color: "#fff",
};