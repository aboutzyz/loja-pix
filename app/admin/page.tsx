"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

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

const ADMIN_PASSWORD = "1234";
const BUCKET_NAME = "product-images";

export default function AdminPage() {
  const [senha, setSenha] = useState("");
  const [logado, setLogado] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [image, setImage] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadingCategory, setUploadingCategory] = useState(false);

  const [search, setSearch] = useState("");

  function login() {
    if (senha === ADMIN_PASSWORD) {
      setLogado(true);
    } else {
      alert("Senha errada");
    }
  }

  async function loadProducts() {
    setLoadingProducts(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    setLoadingProducts(false);

    if (error) {
      console.log(error);
      alert("Erro ao carregar produtos");
      return;
    }

    setProducts((data as Product[]) || []);
  }

  async function loadCategories() {
    setLoadingCategories(true);

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    setLoadingCategories(false);

    if (error) {
      console.log(error);
      alert("Erro ao carregar categorias");
      return;
    }

    setCategories((data as Category[]) || []);
  }

  useEffect(() => {
    if (logado) {
      loadProducts();
      loadCategories();
    }
  }, [logado]);

  function clearForm() {
    setName("");
    setPrice("");
    setStock("0");
    setImage("");
    setCategoryId("");
    setEditingId(null);
  }

  function clearCategoryForm() {
    setCategoryName("");
    setCategoryImage("");
    setEditingCategoryId(null);
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    setUploading(false);

    if (uploadError) {
      console.log(uploadError);
      alert("Erro ao enviar imagem");
      return;
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    setImage(data.publicUrl);
    alert("Imagem enviada com sucesso!");
  }

  async function handleCategoryImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCategory(true);

    const ext = file.name.split(".").pop();
    const fileName = `category-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    setUploadingCategory(false);

    if (uploadError) {
      console.log(uploadError);
      alert("Erro ao enviar imagem da categoria");
      return;
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    setCategoryImage(data.publicUrl);
    alert("Imagem da categoria enviada com sucesso!");
  }

  async function saveProduct() {
    if (!name || !price || !image || !categoryId) {
      alert("Preencha nome, preço, imagem e categoria.");
      return;
    }

    const payload = {
      name: name.trim(),
      price: Number(price),
      image: image.trim(),
      stock: Number(stock || 0),
      category_id: categoryId.trim(),
    };

    if (Number.isNaN(payload.price) || Number.isNaN(payload.stock)) {
      alert("Preço e estoque precisam ser números válidos.");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        console.log(error);
        alert("Erro ao editar produto");
        return;
      }

      alert("Produto editado com sucesso!");
    } else {
      const { error } = await supabase.from("products").insert([payload]);

      if (error) {
        console.log(error);
        alert("Erro ao adicionar produto");
        return;
      }

      alert("Produto adicionado com sucesso!");
    }

    clearForm();
    loadProducts();
  }

  async function saveCategory() {
    if (!categoryName || !categoryImage) {
      alert("Preencha nome e imagem da categoria.");
      return;
    }

    const payload = {
      name: categoryName.trim(),
      image: categoryImage.trim(),
    };

    if (editingCategoryId) {
      const { error } = await supabase
        .from("categories")
        .update(payload)
        .eq("id", editingCategoryId);

      if (error) {
        console.log(error);
        alert("Erro ao editar categoria");
        return;
      }

      alert("Categoria editada com sucesso!");
    } else {
      const { error } = await supabase.from("categories").insert([payload]);

      if (error) {
        console.log(error);
        alert("Erro ao adicionar categoria");
        return;
      }

      alert("Categoria adicionada com sucesso!");
    }

    clearCategoryForm();
    loadCategories();
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setStock(String(product.stock ?? 0));
    setImage(product.image);
    setCategoryId(product.category_id ?? "");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startEditCategory(category: Category) {
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    setCategoryImage(category.image);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteProduct(product: Product) {
    const ok = window.confirm(`Remover "${product.name}"?`);
    if (!ok) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      console.log(error);
      alert("Erro ao remover produto");
      return;
    }

    alert("Produto removido!");
    if (editingId === product.id) {
      clearForm();
    }
    loadProducts();
  }

  async function deleteCategory(category: Category) {
    const ok = window.confirm(`Remover categoria "${category.name}"?`);
    if (!ok) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (error) {
      console.log(error);
      alert("Erro ao remover categoria");
      return;
    }

    alert("Categoria removida!");
    if (editingCategoryId === category.id) {
      clearCategoryForm();
    }
    loadCategories();
    loadProducts();
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  function getCategoryName(id?: string | null) {
    if (!id) return "Sem categoria";
    return categories.find((c) => c.id === id)?.name || "Sem categoria";
  }

  if (!logado) {
    return (
      <div style={pageStyle}>
        <div style={loginCardStyle}>
          <h1 style={titleStyle}>Painel Admin</h1>
          <p style={mutedStyle}>Acesso restrito</p>

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={inputStyle}
          />

          <button onClick={login} style={primaryButtonStyle}>
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>💎 Admin BtTech</h1>
            <p style={mutedStyle}>Adicionar, editar, remover e controlar estoque</p>
          </div>

          <button
            onClick={() => {
              setLogado(false);
              setSenha("");
            }}
            style={secondaryButtonStyle}
          >
            Sair
          </button>
        </div>

        <div style={gridStyle}>
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>
              {editingId ? "Editar produto" : "Novo produto"}
            </h2>

            <div style={formGridStyle}>
              <input
                placeholder="Nome do produto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />

              <input
                placeholder="Preço"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={inputStyle}
              />

              <input
                placeholder="Estoque"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                style={inputStyle}
              />

              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={inputStyle}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <input
                placeholder="Link da imagem"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                style={inputStyle}
              />

              <label style={uploadBoxStyle}>
                <span>{uploading ? "Enviando imagem..." : "Enviar imagem do PC"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
              </label>

              {image && (
                <div style={previewBoxStyle}>
                  <img
                    src={image}
                    alt="Prévia"
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: "contain",
                      borderRadius: 10,
                      background: "#0f081b",
                      padding: 6,
                    }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
              <button onClick={saveProduct} style={primaryButtonStyle}>
                {editingId ? "Salvar alterações" : "Adicionar produto"}
              </button>

              <button onClick={clearForm} style={secondaryButtonStyle}>
                Limpar
              </button>
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>
              {editingCategoryId ? "Editar categoria" : "Nova categoria"}
            </h2>

            <div style={formGridStyle}>
              <input
                placeholder="Nome da categoria"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                style={inputStyle}
              />

              <input
                placeholder="Link da imagem da categoria"
                value={categoryImage}
                onChange={(e) => setCategoryImage(e.target.value)}
                style={inputStyle}
              />

              <label style={uploadBoxStyle}>
                <span>
                  {uploadingCategory
                    ? "Enviando imagem da categoria..."
                    : "Enviar imagem da categoria"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCategoryImageUpload}
                  style={{ display: "none" }}
                />
              </label>

              {categoryImage && (
                <div style={previewBoxStyle}>
                  <img
                    src={categoryImage}
                    alt="Prévia categoria"
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: "contain",
                      borderRadius: 10,
                      background: "#0f081b",
                      padding: 6,
                    }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
              <button onClick={saveCategory} style={primaryButtonStyle}>
                {editingCategoryId ? "Salvar categoria" : "Adicionar categoria"}
              </button>

              <button onClick={clearCategoryForm} style={secondaryButtonStyle}>
                Limpar
              </button>
            </div>
          </div>

          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2 style={sectionTitleStyle}>Produtos cadastrados</h2>

              <input
                placeholder="Pesquisar produto"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, maxWidth: 260 }}
              />
            </div>

            {loadingProducts ? (
              <p style={mutedStyle}>Carregando...</p>
            ) : filteredProducts.length === 0 ? (
              <p style={mutedStyle}>Nenhum produto encontrado.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {filteredProducts.map((product) => (
                  <div key={product.id} style={productRowStyle}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: 72,
                          height: 72,
                          objectFit: "contain",
                          borderRadius: 10,
                          background: "#0f081b",
                          padding: 6,
                          flexShrink: 0,
                        }}
                      />

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: "bold",
                            color: "#fff",
                            marginBottom: 4,
                            wordBreak: "break-word",
                          }}
                        >
                          {product.name}
                        </div>
                        <div style={smallMutedStyle}>
                          Preço: R$ {Number(product.price).toFixed(2)}
                        </div>
                        <div style={smallMutedStyle}>
                          Estoque: {product.stock ?? 0}
                        </div>
                        <div style={smallMutedStyle}>
                          Categoria: {getCategoryName(product.category_id)}
                        </div>
                        <div style={smallMutedStyle}>
                          Category ID: {product.category_id || "Sem categoria"}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        onClick={() => startEdit(product)}
                        style={editButtonStyle}
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => deleteProduct(product)}
                        style={deleteButtonStyle}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Categorias cadastradas</h2>

            {loadingCategories ? (
              <p style={mutedStyle}>Carregando categorias...</p>
            ) : categories.length === 0 ? (
              <p style={mutedStyle}>Nenhuma categoria cadastrada.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {categories.map((category) => (
                  <div key={category.id} style={productRowStyle}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
                      <img
                        src={category.image}
                        alt={category.name}
                        style={{
                          width: 72,
                          height: 72,
                          objectFit: "contain",
                          borderRadius: 10,
                          background: "#0f081b",
                          padding: 6,
                          flexShrink: 0,
                        }}
                      />

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: "bold",
                            color: "#fff",
                            marginBottom: 4,
                            wordBreak: "break-word",
                          }}
                        >
                          {category.name}
                        </div>
                        <div style={smallMutedStyle}>ID: {category.id}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        onClick={() => startEditCategory(category)}
                        style={editButtonStyle}
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => deleteCategory(category)}
                        style={deleteButtonStyle}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, rgba(168,85,247,0.18), transparent 25%), linear-gradient(180deg, #05030b 0%, #12081f 50%, #08040f 100%)",
  color: "white",
  fontFamily: "Arial, sans-serif",
  padding: 20,
};

const containerStyle: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 20,
};

const loginCardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 380,
  margin: "80px auto",
  background: "rgba(20, 11, 36, 0.95)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  padding: 24,
  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
};

const cardStyle: React.CSSProperties = {
  background: "rgba(20, 11, 36, 0.95)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  padding: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  gap: 18,
};

const formGridStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 30,
};

const sectionTitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 12,
  fontSize: 22,
};

const mutedStyle: React.CSSProperties = {
  color: "#cbd5e1",
  marginTop: 6,
};

const smallMutedStyle: React.CSSProperties = {
  color: "#cbd5e1",
  fontSize: 14,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#0f081b",
  color: "white",
  outline: "none",
  fontSize: 14,
};

const primaryButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 12,
  padding: "12px 16px",
  cursor: "pointer",
  fontWeight: "bold",
  color: "white",
  background: "linear-gradient(180deg, #7e22ce 0%, #4c1d95 100%)",
  boxShadow: "0 0 18px rgba(126,34,206,0.35)",
};

const secondaryButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  padding: "12px 16px",
  cursor: "pointer",
  fontWeight: "bold",
  color: "white",
  background: "#111",
};

const editButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: "bold",
  color: "white",
  background: "#2563eb",
};

const deleteButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: "bold",
  color: "white",
  background: "#ef4444",
};

const uploadBoxStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px dashed rgba(255,255,255,0.18)",
  background: "#0f081b",
  color: "#e2e8f0",
  cursor: "pointer",
  textAlign: "center",
  fontWeight: "bold",
};

const previewBoxStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const productRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
  padding: 12,
  borderRadius: 14,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
};