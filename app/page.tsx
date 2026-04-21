import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Home() {
  const { data: products } = await supabase
    .from("products")
    .select("*");

  return (
    <div style={{ padding: 20 }}>
      <h1>Minha Loja</h1>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {products?.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ccc", padding: 10 }}>
            <img src={p.image} width={200} />
            <h2>{p.name}</h2>
            <p>R$ {p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}