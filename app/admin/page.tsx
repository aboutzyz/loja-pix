"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Admin() {
  const [senha, setSenha] = useState("");
  const [logado, setLogado] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");

  function login() {
    if (senha === "1234") {
      setLogado(true);
    } else {
      alert("Senha errada");
    }
  }

  async function addProduct() {
    if (!name || !price || !image) {
      alert("Preencha tudo");
      return;
    }

    const { error } = await supabase.from("products").insert([
      {
        name,
        price: Number(price),
        image,
      },
    ]);

    if (error) {
      alert("Erro ao salvar");
      console.log(error);
    } else {
      alert("Produto adicionado!");
      setName("");
      setPrice("");
      setImage("");
    }
  }

  if (!logado) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Admin Login</h2>
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button onClick={login}>Entrar</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Painel Admin</h2>

      <input
        placeholder="Nome do produto"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Preço"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <input
        placeholder="URL da imagem"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />

      <button onClick={addProduct}>Adicionar produto</button>
    </div>
  );
}