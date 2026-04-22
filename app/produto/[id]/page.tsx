"use client";

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

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function LightningIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z"
        stroke="#d8b4fe"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l7 3.5v5.8c0 4.6-2.9 7.8-7 8.9-4.1-1.1-7-4.3-7-8.9V6.5L12 3Z"
        stroke="#d8b4fe"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m9.5 12 1.7 1.7 3.5-3.7"
        stroke="#d8b4fe"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2.5"
        stroke="#d8b4fe"
        strokeWidth="2.2"
      />
      <path d="M3 10h18" stroke="#d8b4fe" strokeWidth="2.2" />
      <path d="M7 15h3" stroke="#d8b4fe" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 13a8 8 0 1 1 16 0"
        stroke="#d8b4fe"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <rect x="3" y="12" width="4" height="6" rx="2" stroke="#d8b4fe" strokeWidth="2.2" />
      <rect x="17" y="12" width="4" height="6" rx="2" stroke="#d8b4fe" strokeWidth="2.2" />
      <path
        d="M12 20a3 3 0 0 0 3-3"
        stroke="#d8b4fe"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#f5f3ff" strokeWidth="2" />
      <path d="M3 12h18" stroke="#f5f3ff" strokeWidth="2" />
      <path
        d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"
        stroke="#f5f3ff"
        strokeWidth="2"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z"
        stroke="#f8fafc"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="#f5f3ff" strokeWidth="2.2" strokeLinecap="round" />
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

  function checkoutWhatsApp() {
    if (cart.length === 0) return;

    const itemsText = cart
      .map(
        (item) =>
          `- ${item.name} | Qtd: ${item.quantity} | ${formatPrice(
            Number(item.price) * item.quantity
          )}`
      )
      .join("%0A");

    const message =
      `Pedido BtTech%0A%0A` +
      `${itemsText}%0A%0A` +
      `Total: ${formatPrice(total)}`;

    window.open(`https://wa.me/5541996265158?text=${message}`, "_blank");
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
          <div style={brandText}>BtTech</div>
        </div>

        {!isMobile && (
          <div style={topNav}>
            <span style={topNavItem}>Início</span>
            <span style={topNavItem}>Produtos</span>
            <span style={topNavItem}>Como funciona</span>
            <span style={topNavItem}>Avaliações</span>
            <span style={topNavItem}>Suporte</span>
          </div>
        )}

        <div style={topActions}>
          <button style={ghostTopBtn}>Entrar</button>
          <button style={cartTopBtn} onClick={() => setOpenCart(true)}>
            <CartIcon />
            <span style={{ marginLeft: 10 }}>Carrinho</span>
            {cartCount > 0 && <span style={topBadge}>{cartCount}</span>}
          </button>
        </div>
      </div>

      <div style={contentWrap}>
        <div style={isMobile ? mobileHero : desktopHero}>
          <div style={imageCard}>
            <div style={imageGlow} />
            <img src={product.image} alt={product.name} style={productImage} />
            <div style={sitePill}>
              <GlobeIcon />
              <span style={{ marginLeft: 10 }}>bouttech.vercel.app</span>
            </div>
          </div>

          <div style={centerColumn}>
            <div style={stockBadge}>100+ EM ESTOQUE</div>

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

            <button style={pixBtn}>
              <PixBoltIcon />
              <span style={{ marginLeft: 12 }}>Pagar com Pix</span>
            </button>

            <button style={addCartBtn} onClick={() => addToCart(product)}>
              <PlusIcon />
              <span style={{ marginLeft: 12 }}>Adicionar ao carrinho</span>
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

        <div style={descriptionCard}>
          <div style={descriptionHeader}>
            <div style={descriptionIconBox}>▣</div>
            <div style={descriptionTitle}>Descrição</div>
          </div>

          <div style={descriptionText}>{productDescription}</div>
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
            onClick={checkoutWhatsApp}
            disabled={cart.length === 0}
          >
            Ir para a compra
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
  width: 48,
  height: 48,
  borderRadius: 14,
  background: "linear-gradient(135deg, #7c14ff, #db4cff)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  boxShadow: "0 0 22px rgba(183, 77, 255, 0.45)",
};

const brandText: CSSProperties = {
  fontSize: 28,
  fontWeight: 800,
  letterSpacing: 0.5,
  textShadow: "0 0 18px rgba(203, 110, 255, 0.35)",
};

const topNav: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 34,
  color: "#ede9fe",
  fontSize: 15,
};

const topNavItem: CSSProperties = {
  opacity: 0.92,
};

const topActions: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const ghostTopBtn: CSSProperties = {
  height: 48,
  padding: "0 22px",
  borderRadius: 16,
  border: "1px solid rgba(186, 104, 255, 0.25)",
  background: "rgba(16, 6, 30, 0.65)",
  color: "#f5f3ff",
  fontWeight: 700,
  backdropFilter: "blur(10px)",
};

const cartTopBtn: CSSProperties = {
  height: 48,
  padding: "0 18px",
  borderRadius: 16,
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
  minWidth: 24,
  height: 24,
  borderRadius: 999,
  background: "#b933ff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
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
  gap: 22,
  alignItems: "start",
};

const mobileHero: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const imageCard: CSSProperties = {
  position: "relative",
  minHeight: 490,
  borderRadius: 26,
  padding: 18,
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
  height: 455,
  objectFit: "cover",
  borderRadius: 20,
  border: "1px solid rgba(203, 110, 255, 0.25)",
};

const sitePill: CSSProperties = {
  position: "absolute",
  left: 28,
  bottom: 26,
  zIndex: 2,
  display: "inline-flex",
  alignItems: "center",
  padding: "10px 18px",
  borderRadius: 999,
  background: "rgba(33, 12, 57, 0.8)",
  border: "1px solid rgba(205, 126, 255, 0.26)",
  fontWeight: 700,
  boxShadow: "0 0 20px rgba(168,85,247,0.25)",
};

const centerColumn: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const stockBadge: CSSProperties = {
  width: "fit-content",
  padding: "8px 14px",
  borderRadius: 999,
  background: "linear-gradient(135deg, #5f10d1, #b63cff)",
  color: "#faf5ff",
  fontWeight: 800,
  fontSize: 15,
  boxShadow: "0 0 20px rgba(168,85,247,0.35)",
};

const title: CSSProperties = {
  margin: "16px 0 8px 0",
  fontSize: 58,
  lineHeight: 1,
  fontWeight: 900,
  letterSpacing: -1,
  textShadow: "0 0 16px rgba(195, 94, 255, 0.22)",
};

const ratingRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  marginBottom: 18,
};

const star: CSSProperties = {
  color: "#ffd84d",
  fontSize: 22,
  textShadow: "0 0 12px rgba(255,216,77,0.35)",
};

const ratingText: CSSProperties = {
  marginLeft: 8,
  color: "#ddd6fe",
  fontSize: 18,
};

const price: CSSProperties = {
  fontSize: 54,
  fontWeight: 900,
  color: "#f0abfc",
  letterSpacing: -1,
  marginTop: 4,
  textShadow: "0 0 18px rgba(216, 180, 254, 0.25)",
};

const pixText: CSSProperties = {
  color: "#f3e8ff",
  opacity: 0.9,
  fontSize: 22,
  marginTop: 4,
  marginBottom: 22,
};

const pixBtn: CSSProperties = {
  height: 82,
  borderRadius: 22,
  border: "1px solid rgba(241, 204, 255, 0.26)",
  background: "linear-gradient(180deg, #e03cff 0%, #8e18ff 100%)",
  color: "#ffffff",
  fontWeight: 900,
  fontSize: 30,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow:
    "0 0 28px rgba(212, 54, 255, 0.55), inset 0 1px 0 rgba(255,255,255,0.25)",
  cursor: "pointer",
};

const addCartBtn: CSSProperties = {
  marginTop: 18,
  height: 82,
  borderRadius: 22,
  border: "1px solid rgba(192, 110, 255, 0.45)",
  background: "rgba(11, 2, 22, 0.45)",
  color: "#ffffff",
  fontWeight: 800,
  fontSize: 30,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
  cursor: "pointer",
};

const securityMiniCard: CSSProperties = {
  marginTop: 22,
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: 18,
  borderRadius: 22,
  background: "rgba(18, 6, 34, 0.7)",
  border: "1px solid rgba(194, 120, 255, 0.22)",
  boxShadow: "0 0 26px rgba(168,85,247,0.12)",
};

const miniIconWrap: CSSProperties = {
  width: 54,
  height: 54,
  borderRadius: 16,
  background: "rgba(180, 90, 255, 0.12)",
  border: "1px solid rgba(205,126,255,0.22)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const miniCardTitle: CSSProperties = {
  fontSize: 24,
  fontWeight: 800,
};

const miniCardText: CSSProperties = {
  color: "#e9d5ff",
  opacity: 0.92,
  fontSize: 17,
  marginTop: 4,
};

const featureColumn: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const featureCard: CSSProperties = {
  display: "flex",
  gap: 16,
  padding: 24,
  borderRadius: 24,
  background: "rgba(18, 5, 35, 0.7)",
  border: "1px solid rgba(192, 110, 255, 0.3)",
  backdropFilter: "blur(18px)",
  boxShadow: "0 0 28px rgba(168,85,247,0.12)",
};

const featureIconWrap: CSSProperties = {
  width: 58,
  height: 58,
  borderRadius: 18,
  background: "rgba(180, 90, 255, 0.12)",
  border: "1px solid rgba(205,126,255,0.22)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const featureTitle: CSSProperties = {
  fontSize: 26,
  fontWeight: 800,
  marginBottom: 6,
};

const featureText: CSSProperties = {
  color: "#e9d5ff",
  opacity: 0.92,
  lineHeight: 1.5,
  fontSize: 18,
};

const descriptionCard: CSSProperties = {
  marginTop: 22,
  borderRadius: 26,
  padding: 24,
  background: "rgba(16, 5, 30, 0.78)",
  border: "1px solid rgba(192, 110, 255, 0.32)",
  boxShadow: "0 0 30px rgba(168,85,247,0.14)",
  backdropFilter: "blur(18px)",
};

const descriptionHeader: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 18,
};

const descriptionIconBox: CSSProperties = {
  width: 34,
  height: 34,
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
  fontSize: 32,
  fontWeight: 900,
  color: "#d946ef",
};

const descriptionText: CSSProperties = {
  whiteSpace: "pre-line",
  color: "#f5f3ff",
  lineHeight: 1.62,
  fontSize: 20,
};

const floatingCartBtn: CSSProperties = {
  position: "fixed",
  right: 26,
  bottom: 26,
  zIndex: 30,
  width: 78,
  height: 78,
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
  minWidth: 28,
  height: 28,
  padding: "0 7px",
  borderRadius: 999,
  background: "#c026d3",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontSize: 13,
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
  fontSize: 17,
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
  height: 58,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "linear-gradient(180deg, #ff4cff 0%, #9327ff 100%)",
  color: "#fff",
  fontWeight: 900,
  fontSize: 21,
  boxShadow: "0 0 24px rgba(197, 71, 255, 0.4)",
  cursor: "pointer",
};

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