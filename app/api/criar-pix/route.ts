import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nome = body.nome || "Cliente BoutBux";
    const email = body.email || null;
    const valor = Number(body.valor);
    const descricao = body.descricao || "Compra na loja";

    const headers = {
      "Content-Type": "application/json",
      access_token: process.env.ASAAS_API_KEY as string,
    };

    // 🔹 Criar cliente (SEM CPF fake)
    const customerRes = await fetch(
      `${process.env.ASAAS_API_URL}/customers`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: nome,
          ...(email ? { email } : {}),
          notificationDisabled: true,
        }),
      }
    );

    const customer = await customerRes.json();

    if (!customerRes.ok) {
      console.error("Erro cliente:", customer);
      return NextResponse.json({ error: customer }, { status: 400 });
    }

    // 🔹 Criar pagamento PIX
    const paymentRes = await fetch(
      `${process.env.ASAAS_API_URL}/payments`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          customer: customer.id,
          billingType: "PIX",
          value: valor,
          dueDate: new Date().toISOString().split("T")[0],
          description: descricao,
        }),
      }
    );

    const payment = await paymentRes.json();

    if (!paymentRes.ok) {
      console.error("Erro pagamento:", payment);
      return NextResponse.json({ error: payment }, { status: 400 });
    }

    // 🔹 Buscar QR Code
    const qrRes = await fetch(
      `${process.env.ASAAS_API_URL}/payments/${payment.id}/pixQrCode`,
      {
        method: "GET",
        headers,
      }
    );

    const qr = await qrRes.json();

    if (!qrRes.ok) {
      console.error("Erro QR:", qr);
      return NextResponse.json({ error: qr }, { status: 400 });
    }

    return NextResponse.json({
      qrCodeImage: qr.encodedImage,
      copiaCola: qr.payload,
      paymentId: payment.id,
      status: payment.status,
    });
  } catch (err) {
    console.error("Erro geral:", err);
    return NextResponse.json(
      { error: "Erro ao gerar Pix" },
      { status: 500 }
    );
  }
}